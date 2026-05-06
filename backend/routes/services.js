// Service Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// All routes require authentication
router.use(protect);

// GET /api/services - Get all services
router.get('/', getServices);

// GET /api/services/:id - Get single service
router.get('/:id', getService);

// POST /api/services - Create service
router.post('/', authorize(['admin']), createService);

// PUT /api/services/:id - Update service
router.put('/:id', authorize(['admin']), updateService);

// DELETE /api/services/:id - Delete service
router.delete('/:id', authorize(['admin']), deleteService);

module.exports = router;
