// Booking Controller
const Booking = require('../models/Booking');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const AppError = require('../utils/AppError');

// @desc Get all bookings (for All Bookings admin view or user bookings)
// @route GET /api/bookings
// @access Private
exports.getBookings = async (req, res, next) => {
  try {
    const { search, status, type, page = 1, limit = 20 } = req.query;
    const queryObj = {};

    // Filter by status
    if (status) {
      queryObj.status = status;
    }

    // Filter by type
    if (type) {
      queryObj.type = type;
    }

    // Search by patient name, phone, or transaction ID
    if (search) {
      queryObj.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientPhone: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Booking.countDocuments(queryObj);
    const bookings = await Booking.find(queryObj)
      .populate('user', 'name email')
      .populate('doctor', 'name specialization')
      .populate('service', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get my bookings (for current user)
// @route GET /api/bookings/my
// @access Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const queryObj = { user: req.user._id };

    if (status) {
      queryObj.status = status;
    }

    const bookings = await Booking.find(queryObj)
      .populate('doctor', 'name specialization')
      .populate('service', 'name price')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single booking
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('doctor', 'name specialization consultationFee')
      .populate('service', 'name price description');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { type, serviceId, doctorId, date, timeSlot, amount, paymentMethod, patientName, patientPhone, patientEmail, notes } = req.body;

    // Validate based on type
    if (type === 'service' && !serviceId) {
      return next(new AppError('Service ID is required', 400));
    }
    if (type === 'consultation' && !doctorId) {
      return next(new AppError('Doctor ID is required', 400));
    }

    // Create booking
    const bookingData = {
      user: req.user._id,
      type,
      date: new Date(date),
      timeSlot,
      amount,
      paymentMethod: paymentMethod || '',
      paymentStatus: 'unpaid',
      patientName: patientName || req.user.name,
      patientPhone: patientPhone || '',
      patientEmail: patientEmail || req.user.email,
      notes: notes || '',
      status: 'pending'
    };

    if (type === 'service') {
      bookingData.service = serviceId;
    } else {
      bookingData.doctor = doctorId;
    }

    const booking = await Booking.create(bookingData);

    // Populate and return
    await booking.populate('doctor', 'name specialization');
    await booking.populate('service', 'name price');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update booking status
exports.updateBooking = async (req, res, next) => {
  try {
    const { status, paymentStatus, transactionId, notes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Update fields
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (transactionId) booking.transactionId = transactionId;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    await booking.populate('doctor', 'name specialization');
    await booking.populate('service', 'name price');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete booking
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get available time slots (for booking)
// @route GET /api/bookings/slots
// @access Private
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, serviceId, date } = req.query;

    if (!date) {
      return next(new AppError('Date is required', 400));
    }

    const queryDate = new Date(date);
    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Get existing bookings for the date
    const existingBookings = await Booking.find({
      date: { $gte: queryDate, $lt: nextDate },
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');

    const bookedSlots = existingBookings.map(b => b.timeSlot);

    // Generate available slots (9 AM to 5 PM, every 30 minutes)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date: queryDate,
        availableSlots,
        bookingCount: bookedSlots.length
      }
    });
  } catch (error) {
    next(error);
  }
};
