const mongoose = require('mongoose');

/**
 * Patient Model - Complete enhanced schema for Hospital Management
 */
const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    index: true,
  },
  email: {
    type: String,
    default: '',
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    index: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 0,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['Active', 'Discharged', 'Critical'],
    default: 'Active',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound text index for search
patientSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Patient', patientSchema);

