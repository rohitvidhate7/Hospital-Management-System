const { body, query, param, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Patient validation chains

const validateCreatePatient = [
  body('name')
    .trim().notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
  body('phone')
    .notEmpty().withMessage('Phone is required')
    .isMobilePhone('any').optional({ checkFalsy: true }).withMessage('Valid phone required'),
  body('email')
    .optional()
    .isEmail().normalizeEmail().withMessage('Valid email required'),
  body('age')
    .isInt({ min: 0, max: 120 }).withMessage('Age must be 0-120'),
  body('gender')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
];

const validateUpdatePatient = [
  body('name')
    .optional()
    .trim().notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
  // ... other optional fields
];

const validateGetPatient = [
  param('id').isMongoId().withMessage('Valid patient ID required'),
];

const validateSearchQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isLength({ max: 100 }),
  query('status').optional().isIn(['Active', 'Discharged', 'Critical']),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array().map(e => e.msg).join(', '), 400);
  }
  next();
};

module.exports = {
  validateCreatePatient,
  validateUpdatePatient,
  validateGetPatient,
  validateSearchQuery,
  checkValidation,
};

