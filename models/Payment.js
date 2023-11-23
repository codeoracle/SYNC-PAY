const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'pending', 'paid'],
    default: 'unpaid',
  },
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{timestamps: true}
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
