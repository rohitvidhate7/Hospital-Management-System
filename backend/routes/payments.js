const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  getPaymentStats
} = require('../controllers/paymentController');

// All routes are protected
router.use(protect);

// Routes
router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/:id', getPaymentById);
router.put('/:id', updatePaymentStatus);
router.delete('/:id', deletePayment);

module.exports = router;
