const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');
const {
  validateCreateDoctor,
  validateUpdateDoctor,
  validateGetDoctor,
  checkValidation,
} = require('../validations/doctors'); // assume exists like patients

router.get('/', protect, authorize(['admin', 'receptionist']), getDoctors);
router.get('/:id', protect, validateGetDoctor, checkValidation, getDoctor);
router.post('/', protect, authorize(['admin', 'receptionist']), validateCreateDoctor, checkValidation, createDoctor);
router.put('/:id', protect, authorize(['admin', 'receptionist']), validateGetDoctor, validateUpdateDoctor, checkValidation, updateDoctor);
router.delete('/:id', protect, authorize(['admin', 'receptionist']), validateGetDoctor, checkValidation, deleteDoctor);

module.exports = router;

