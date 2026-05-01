const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const { patientId, appointmentId, amount, status, paymentMethod, transactionId, notes } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Validate appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
    }

    // Create payment
    const payment = await Payment.create({
      patient: patientId,
      appointment: appointmentId || null,
      amount: amount || 0,
      status: status || 'Pending',
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId || '',
      notes: notes || ''
    });

    // Populate patient and appointment details
    await payment.populate([
      { path: 'patient', select: 'name phone email' },
      { path: 'appointment', select: 'date time' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, search, patientId, page = 1, limit = 50 } = req.query;

    // Build query
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by patient
    if (patientId) {
      query.patient = patientId;
    }

    // Search by patient name or transactionId
    if (search) {
      const patients = await Patient.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const patientIds = patients.map(p => p._id);

      query.$or = [
        { patient: { $in: patientIds } },
        { transactionId: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const payments = await Payment.find(query)
      .populate('patient', 'name phone email')
      .populate('appointment', 'date time doctor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    // Get summary statistics
    const summary = await Payment.aggregate([
      { $group: {
        _id: null,
        totalBilled: { $sum: '$amount' },
        totalCollected: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] } },
        failedAmount: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, '$amount', 0] } }
      }}
    ]);

    res.status(200).json({
      success: true,
      payments,
      summary: summary[0] || { totalBilled: 0, totalCollected: 0, pendingAmount: 0, failedAmount: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient', 'name phone email age gender')
      .populate('appointment');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, paymentMethod, transactionId, amount, notes } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Update fields
    if (status) payment.status = status;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId) payment.transactionId = transactionId;
    if (amount !== undefined) payment.amount = amount;
    if (notes !== undefined) payment.notes = notes;

    // Set paidAt when status is Paid
    if (status === 'Paid' && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    await payment.save();

    // Populate for response
    await payment.populate([
      { path: 'patient', select: 'name phone email' },
      { path: 'appointment', select: 'date time' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment statistics for dashboard
// @route   GET /api/payments/stats
// @access  Private
exports.getPaymentStats = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      { $group: {
        _id: null,
        totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] } },
        failedAmount: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, '$amount', 0] } },
        totalTransactions: { $sum: 1 },
        completedTransactions: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } }
      }}
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalRevenue: 0,
        pendingAmount: 0,
        failedAmount: 0,
        totalTransactions: 0,
        completedTransactions: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
