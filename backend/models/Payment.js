const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  // New simplified amount field (task requirement)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  // New simplified status (Paid, Pending, Failed - task requirement)
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Pending',
  },
  // Simplified payment method (Cash, UPI, Card - task requirement)
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Card'],
    default: 'Cash',
  },
  // Transaction ID for tracking
  transactionId: {
    type: String,
    default: '',
  },
  // Legacy fields - kept for backward compatibility
  items: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  }],
  subtotal: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Refunded', 'Cancelled'],
    default: 'Pending',
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  notes: {
    type: String,
    default: '',
  },
  paidAt: {
    type: Date,
  },
}, { timestamps: true });

// Auto-generate invoice number
paymentSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.invoiceNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
