// Appointments Routes
// Role-based access with populate for doctor/patient
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getTodayAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

// All routes protected
router.use(protect);

// GET /api/appointments - Get all appointments with filters
router.get('/', getAppointments);

// GET /api/appointments/today - Get today's appointments
router.get('/today', getTodayAppointments);

// GET /api/appointments/doctor/:doctorId - Get doctor's appointments
router.get('/doctor/:doctorId', getDoctorAppointments);

// GET /api/appointments/patient/:patientId - Get patient's appointments
router.get('/patient/:patientId', getPatientAppointments);

// GET /api/appointments/:id - Get single appointment
router.get('/:id', getAppointment);

// POST /api/appointments - Create appointment
router.post('/', createAppointment);

// PUT /api/appointments/:id - Update appointment
router.put('/:id', updateAppointment);

// PATCH /api/appointments/:id/status - Update status only
router.patch('/:id/status', updateAppointmentStatus);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', deleteAppointment);

module.exports = router;
