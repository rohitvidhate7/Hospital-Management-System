// Department Controller
const Department = require('../models/Department');
const AppError = require('../utils/AppError');

// @desc Get all departments
// @route GET /api/departments
// @access Private
exports.getDepartments = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const queryObj = {};

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) queryObj.status = status;

    const total = await Department.countDocuments(queryObj);
    const departments = await Department.find(queryObj)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: {
        departments,
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

// @desc Get single department
exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create department
exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update department
exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!department) {
      return next(new AppError('Department not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete department
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
