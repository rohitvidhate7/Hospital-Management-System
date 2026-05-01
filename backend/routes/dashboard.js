// Dashboard Routes
// Role-based dashboards for Admin, Doctor, Patient, Receptionist
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
  getReceptionistDashboard
} = require('../controllers/dashboardController');

// GET /api/dashboard/stats - General stats (any authenticated user)
router.get('/stats', protect, getDashboardStats);

// GET /api/dashboard/admin - Admin only
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

// GET /api/dashboard/doctor - Doctor only
router.get('/doctor', protect, authorize('admin', 'doctor'), getDoctorDashboard);

// GET /api/dashboard/patient - Patient only
router.get('/patient', protect, authorize('admin', 'patient'), getPatientDashboard);

// GET /api/dashboard/receptionist - Receptionist only (also accessible by admin)
router.get('/receptionist', protect, authorize('admin', 'receptionist'), getReceptionistDashboard);

module.exports = router;
