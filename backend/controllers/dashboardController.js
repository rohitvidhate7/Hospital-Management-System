const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Department = require('../models/Department');
const Service = require('../models/Service');

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
      totalAppointments, todayAppointments, scheduledAppointments, completedAppointments, cancelledAppointments,
      totalDepartments,
      totalServices,
      totalRevenue,
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
      Appointment.countDocuments({ date: new Date().toISOString().split('T')[0] }),
      Appointment.countDocuments({ status: 'Scheduled' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),

      // Departments
      Department.countDocuments(),

      // Services
      Service.countDocuments(),

      // Revenue (from payments)
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).then(results => results[0]?.total || 0),

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

    // Recent appointments (last 7)
    const recentAppointments = await Appointment.find({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    })
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
      .limit(7)
      .select('patient doctor date time status');

    // Payment summary
    const paymentSummary = await Payment.aggregate([
      { $group: {
          _id: null,
          totalBilled: { $sum: '$amount' },
          totalCollected: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } }
        }
      }
    ]);
    
    const stats = {
      totalPatients,
      activePatients,
      recentPatients,
      totalDoctors,
      availableDoctors,
      totalAppointments,
      todayAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      totalDepartments,
      totalServices,
      totalRevenue,
      criticalPatients,
      recentAppointments,
      departmentStats,
      paymentSummary: paymentSummary[0] || { totalBilled: 0, totalCollected: 0 }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

