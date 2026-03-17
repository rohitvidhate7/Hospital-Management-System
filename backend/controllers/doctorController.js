// Doctor Controller - Follows patient pattern
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');

// getAllDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor - similar to patient
exports.getDoctors = async (req, res, next) => {
  // ... pagination/search logic
  res.status(200).json({ success: true, data: { doctors } });
};
// etc full CRUD

