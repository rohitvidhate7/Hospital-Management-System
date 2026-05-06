// Department Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

// All routes require authentication
router.use(protect);

// GET /api/departments - Get all departments
router.get('/', getDepartments);

// GET /api/departments/:id - Get single department
router.get('/:id', getDepartment);

// POST /api/departments - Create department
router.post('/', authorize(['admin']), createDepartment);

// PUT /api/departments/:id - Update department
router.put('/:id', authorize(['admin']), updateDepartment);

// DELETE /api/departments/:id - Delete department
router.delete('/:id', authorize(['admin']), deleteDepartment);

module.exports = router;
