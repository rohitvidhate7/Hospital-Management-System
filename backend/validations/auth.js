const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Validation middlewares for auth routes
 * Use as: validateRegister, then checkValidation
 */

// Register validation
const validateRegister = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'patient', 'receptionist']).withMessage('Invalid role'),
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// OTP validation
const validateOtpRequest = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
];

const validateOtpVerify = [
  validateOtpRequest[0],
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

// Google auth
const validateGoogle = [
  body('credential').notEmpty().withMessage('Google credential required'),
];

// Validation result checker
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(e => e.msg).join(', ');
    throw new AppError(errorMsg, 400);
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateOtpRequest,
  validateOtpVerify,
  validateGoogle,
  checkValidation,
};

