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

// GET /api/patients?search=&status=&page=&limit=
router.get('/', 
  validateSearchQuery,
  checkValidation,
  getPatients
); // TEMP: Public for dashboard testing - add protect back after auth fix


// GET /api/patients/:id
router.get('/:id', protect, validateGetPatient, checkValidation, getPatient);

// POST /api/patients
router.post('/', protect, authorize(['admin', 'receptionist']), validateCreatePatient, checkValidation, createPatient);

// PUT /api/patients/:id
router.put('/:id', protect, authorize(['admin', 'receptionist']), validateGetPatient, validateUpdatePatient, checkValidation, updatePatient);

// DELETE /api/patients/:id
router.delete('/:id', protect, authorize(['admin', 'receptionist']), validateGetPatient, checkValidation, deletePatient);

module.exports = router;
