const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');

// All routes require authentication
router.use(protect);

// GET /api/doctors - Get all doctors
router.get('/', getDoctors);

// GET /api/doctors/:id - Get single doctor
router.get('/:id', getDoctor);

// POST /api/doctors - Create doctor
router.post('/', authorize(['admin', 'receptionist']), createDoctor);

// PUT /api/doctors/:id - Update doctor
router.put('/:id', authorize(['admin', 'receptionist']), updateDoctor);

// DELETE /api/doctors/:id - Delete doctor
router.delete('/:id', authorize(['admin', 'receptionist']), deleteDoctor);

module.exports = router;

