// Appointment Controller
// Full CRUD with populate for doctor/patient relationships
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const AppError = require('../utils/AppError');

// @desc Get all appointments with filtering and populate
// @route GET /api/appointments
// @access Private (role-based)
exports.getAppointments = async (req, res, next) => {
  try {
    const { 
      search, 
      status, 
      doctorId, 
      patientId, 
      date, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const queryObj = {};

    // Filter by status
    if (status) {
      queryObj.status = status;
    }

    // Filter by doctor
    if (doctorId) {
      queryObj.doctor = doctorId;
    }

    // Filter by patient
    if (patientId) {
      queryObj.patient = patientId;
    }

    // Filter by date (exact match or range)
    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      queryObj.date = { $gte: searchDate, $lt: nextDate };
    }

    // Search by patient name or doctor name
    if (search) {
      const patients = await Patient.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const patientIds = patients.map(p => p._id);

      const doctors = await Doctor.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const doctorIds = doctors.map(d => d._id);

      queryObj.$or = [
        { patient: { $in: patientIds } },
        { doctor: { $in: doctorIds } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(queryObj)
      .populate('patient', 'name phone email age gender')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ date: -1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single appointment by ID
// @route GET /api/appointments/:id
// @access Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone email age gender bloodGroup address')
      .populate('doctor', 'name specialization consultationFee department');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create new appointment
// @route POST /api/appointments
// @access Private (admin, receptionist, patient)
exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, time, type, notes, fee } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: new Date(date),
      time,
      type: type || 'Consultation',
      notes: notes || '',
      fee: fee || doctor.consultationFee,
      status: 'Pending'
    });

    // Populate and return
    await appointment.populate('patient', 'name phone email');
    await appointment.populate('doctor', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update appointment
// @route PUT /api/appointments/:id
// @access Private
exports.updateAppointment = async (req, res, next) => {
  try {
    const { date, time, type, status, notes, prescription, fee } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Update fields
    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (type) appointment.type = type;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (fee !== undefined) appointment.fee = fee;

    await appointment.save();

    // Populate and return
    await appointment.populate('patient', 'name phone email');
    await appointment.populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete appointment
// @route DELETE /api/appointments/:id
// @access Private (admin, receptionist)
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get appointments for a specific doctor
// @route GET /api/appointments/doctor/:doctorId
// @access Private
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date, status } = req.query;

    const queryObj = { doctor: doctorId };

    if (status) {
      queryObj.status = status;
    }

    // Filter by date
    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      queryObj.date = { $gte: searchDate, $lt: nextDate };
    }

    const appointments = await Appointment.find(queryObj)
      .populate('patient', 'name phone email age gender')
      .populate('doctor', 'name specialization')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get appointments for a specific patient
// @route GET /api/appointments/patient/:patientId
// @access Private
exports.getPatientAppointments = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient: patientId })
      .populate('patient', 'name phone email')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ date: -1, time: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get today's appointments (for any role)
// @route GET /api/appointments/today
// @access Private
exports.getTodayAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queryObj = {
      date: { $gte: today, $lt: tomorrow }
    };

    // If doctor role, filter by their appointments
    if (req.user.role === 'doctor') {
      // Need to link user to doctor - use email matching
      const doctor = await Doctor.findOne({ email: req.user.email });
      if (doctor) {
        queryObj.doctor = doctor._id;
      }
    }

    // If patient role, filter by their appointments
    if (req.user.role === 'patient') {
      const patients = await Patient.find({ email: req.user.email });
      if (patients.length > 0) {
        queryObj.patient = { $in: patients.map(p => p._id) };
      }
    }

    const appointments = await Appointment.find(queryObj)
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization')
      .sort({ time: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update appointment status
// @route PATCH /api/appointments/:id/status
// @access Private
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, prescription } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (status) appointment.status = status;
    if (prescription !== undefined) appointment.prescription = prescription;

    // Set completed timestamp
    if (status === 'Completed') {
      appointment.notes = appointment.notes || '';
    }

    await appointment.save();

    await appointment.populate('patient', 'name phone email');
    await appointment.populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Appointment status updated',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
