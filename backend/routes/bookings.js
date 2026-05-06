// Booking Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getAvailableSlots
} = require('../controllers/bookingController');

// All routes require authentication
router.use(protect);

// GET /api/bookings - Get all bookings (admin/receptionist) or user's bookings
router.get('/', getBookings);

// GET /api/bookings/my - Get current user's bookings
router.get('/my', getMyBookings);

// GET /api/bookings/slots - Get available time slots
router.get('/slots', getAvailableSlots);

// GET /api/bookings/:id - Get single booking
router.get('/:id', getBooking);

// POST /api/bookings - Create booking
router.post('/', createBooking);

// PUT /api/bookings/:id - Update booking
router.put('/:id', updateBooking);

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', deleteBooking);

module.exports = router;
