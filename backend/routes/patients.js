const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPatients, getPatient, createPatient, updatePatient, deletePatient,
} = require('../controllers/patientController');
const {
  validateCreatePatient,
  validateUpdatePatient,
  validateGetPatient,
  validateSearchQuery,
  checkValidation,
} = require('../validations/patients');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/patients?search=&status=&page=&limit=
router.get('/', 
  validateSearchQuery,
  checkValidation,
  getPatients
);

// GET /api/patients/:id
router.get('/:id', validateGetPatient, checkValidation, getPatient);

// POST /api/patients
router.post('/', authorize(['admin', 'receptionist']), validateCreatePatient, checkValidation, createPatient);

// PUT /api/patients/:id
router.put('/:id', authorize(['admin', 'receptionist']), validateGetPatient, validateUpdatePatient, checkValidation, updatePatient);

// DELETE /api/patients/:id
router.delete('/:id', authorize(['admin', 'receptionist']), validateGetPatient, checkValidation, deletePatient);

module.exports = router;
