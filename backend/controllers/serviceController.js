// Service Controller
const Service = require('../models/Service');
const AppError = require('../utils/AppError');

// @desc Get all services
// @route GET /api/services
// @access Private
exports.getServices = async (req, res, next) => {
  try {
    const { search, status, category, department, page = 1, limit = 20 } = req.query;
    const queryObj = {};

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) queryObj.status = status;
    if (category) queryObj.category = category;
    if (department) queryObj.department = department;

    const total = await Service.countDocuments(queryObj);
    const services = await Service.find(queryObj)
      .populate('department', 'name')
      .populate('doctor', 'name specialization')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: {
        services,
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

// @desc Get single service
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('department', 'name')
      .populate('doctor', 'name specialization');
    if (!service) {
      return next(new AppError('Service not found', 404));
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create service
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update service
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name');
    if (!service) {
      return next(new AppError('Service not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete service
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return next(new AppError('Service not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
