// Doctor Controller
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');

// @desc Get all doctors with pagination/search
exports.getDoctors = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    console.log('🔍 Doctors query:', { search, status, page, limit });

    const queryObj = {};

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) queryObj.status = status;

    const total = await Doctor.countDocuments(queryObj);
    const doctors = await Doctor.find(queryObj)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: {
        doctors,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single doctor
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('department', 'name');
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create doctor
exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update doctor
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name');
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete doctor
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

