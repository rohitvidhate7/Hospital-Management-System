// Authentication & Authorization Middleware
// protect(): Verify JWT token
// authorize(roles): Check user role in ['admin', 'doctor', 'patient']

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hospital_secret_2024_dev');
    req.user = await User.findById(decoded.id).select('-password');
    
    console.log('🔐 Auth user:', req.user?._id, req.user?.email, req.user?.role || 'NO USER');
    
    if (!req.user) {
      return next(new AppError(`User not found for ID: ${decoded.id}`, 401));
    }

    next();
  } catch (error) {
    next(new AppError('Not authorized, token failed', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      next();
    } else {
      return next(new AppError(`Role ${req.user.role} is not authorized for this action`, 403));
    }
  };

};

module.exports = { protect, authorize };

