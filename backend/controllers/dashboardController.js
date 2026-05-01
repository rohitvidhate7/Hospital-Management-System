const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Department = require('../models/Department');
const Service = require('../models/Service');
const User = require('../models/User');

const getCountSafe = async (Model, query = {}) => {
  try {
    return await Model.countDocuments(query);
  } catch {
    return 0;
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Core counts
    const [
      totalPatients, activePatients, recentPatients,
      totalDoctors, availableDoctors,
      totalAppointments, todayAppointments, pendingAppointments, confirmedAppointments, completedAppointments, cancelledAppointments,
      totalDepartments,
      totalServices,
      criticalPatients,
      departmentStats
    ] = await Promise.all([
      // Patients
      Patient.countDocuments(),
      Patient.countDocuments({ status: 'Active' }),
      Patient.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
        .select('name age gender bloodGroup status')
        .sort({ createdAt: -1 })
        .limit(5),

      // Doctors
      Doctor.countDocuments(),
      Doctor.countDocuments({ status: 'Available' }),

      // Appointments
      Appointment.countDocuments(),
      Appointment.countDocuments({ 
        date: { $gte: new Date(new Date().setHours(0,0,0,0)), $lt: new Date(new Date().setHours(23,59,59,999)) }
      }),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Confirmed' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),

      // Departments
      Department.countDocuments(),

      // Services
      Service.countDocuments(),

      // Critical patients
      Patient.countDocuments({ status: 'Critical' }),

      // Department stats
      Doctor.aggregate([
        { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
        { $group: { _id: { $arrayElemAt: ['$dept.name', 0] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Payment statistics using new simplified fields
    const paymentStats = await Payment.aggregate([
      { $group: {
        _id: null,
        totalBilled: { $sum: '$amount' },
        totalCollected: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] } },
        failedAmount: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, '$amount', 0] } },
        completedTransactions: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } }
      }}
    ]);

    const paymentSummary = paymentStats[0] || { 
      totalBilled: 0, 
      totalCollected: 0, 
      pendingAmount: 0, 
      failedAmount: 0,
      completedTransactions: 0
    };

    // Recent appointments (last 7)
    const recentAppointments = await Appointment.find({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    })
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
      .limit(7)
      .select('patient doctor date time status');

    const stats = {
      totalPatients,
      activePatients,
      recentPatients,
      totalDoctors,
      availableDoctors,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalDepartments,
      totalServices,
      totalRevenue: paymentSummary.totalCollected, // Total Revenue from Paid payments
      pendingPayments: paymentSummary.pendingAmount, // Pending Amount
      completedTransactions: paymentSummary.completedTransactions, // Completed Transactions count
      criticalPatients,
      recentAppointments,
      departmentStats,
      paymentSummary: {
        totalBilled: paymentSummary.totalBilled,
        totalCollected: paymentSummary.totalCollected,
        pendingAmount: paymentSummary.pendingAmount,
        failedAmount: paymentSummary.failedAmount
      }
    };

res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Admin Dashboard Stats
// @route GET /api/dashboard/admin
// @access Admin only
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Get all stats for admin
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      totalRevenue,
      pendingPayments,
      recentAppointments
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Payment.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'Pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Appointment.find()
        .populate('patient', 'name phone')
        .populate('doctor', 'name specialization')
        .sort({ date: -1 })
        .limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments: todayAppointments || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingPayments: pendingPayments[0]?.total || 0,
        recentAppointments,
        role: 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Doctor Dashboard Stats
// @route GET /api/dashboard/doctor
// @access Doctor only
exports.getDoctorDashboard = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    
    // Find doctor by email (matching with User account)
    const doctor = await Doctor.findOne({ email: userEmail });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found. Please contact admin.'
      });
    }

    // Get doctor-specific stats
    const [
      myAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments
    ] = await Promise.all([
      Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name phone email age gender')
        .populate('doctor', 'name specialization')
        .sort({ date: -1 })
        .limit(20),
      Appointment.find({
        doctor: doctor._id,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
        .populate('patient', 'name phone')
        .sort({ time: 1 }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'Pending' }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'Completed' })
    ]);

    // Get unique patients
    const patientIds = [...new Set(myAppointments.map(apt => apt.patient?._id?.toString()).filter(Boolean))];

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          consultationFee: doctor.consultationFee
        },
        myAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalPatients: patientIds.length,
        role: 'doctor'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Patient Dashboard Stats
// @route GET /api/dashboard/patient
// @access Patient only
exports.getPatientDashboard = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    
    // Find patient by email
    const patient = await Patient.findOne({ email: userEmail });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found. Please contact reception.'
      });
    }

    // Get patient's appointments
    const [
      myAppointments,
      availableDoctors
    ] = await Promise.all([
      Appointment.find({ patient: patient._id })
        .populate('patient', 'name phone')
        .populate('doctor', 'name specialization consultationFee')
        .sort({ date: -1 }),
      Doctor.find({ status: 'Available' })
        .populate('department', 'name')
        .select('name specialization consultationFee')
    ]);

    // Get payment history
    const payments = await Payment.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          _id: patient._id,
          name: patient.name,
          phone: patient.phone
        },
        myAppointments,
        availableDoctors,
        payments,
        role: 'patient'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Receptionist Dashboard Stats
// @route GET /api/dashboard/receptionist
// @access Receptionist only
exports.getReceptionistDashboard = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'receptionist' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Get all patients and doctors for receptionist
    const [
      todayAppointments,
      pendingAppointments,
      allPatients,
      availableDoctors,
      recentAppointments
    ] = await Promise.all([
      Appointment.find({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
        .populate('patient', 'name phone')
        .populate('doctor', 'name specialization')
        .sort({ time: 1 }),
      Appointment.find({ status: 'Pending' })
        .populate('patient', 'name phone')
        .populate('doctor', 'name specialization')
        .sort({ date: 1 })
        .limit(20),
      Patient.find().select('name phone email age').sort({ createdAt: -1 }).limit(20),
      Doctor.find({ status: 'Available' })
        .populate('department', 'name')
        .select('name specialization consultationFee'),
      Appointment.find()
        .populate('patient', 'name phone')
        .populate('doctor', 'name specialization')
        .sort({ date: -1 })
        .limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        pendingAppointments,
        allPatients,
        availableDoctors,
        recentAppointments,
        role: 'receptionist'
      }
    });
  } catch (error) {
    next(error);
  }
};
