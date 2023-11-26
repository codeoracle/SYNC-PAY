const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  invoiceId: {
    type: String,
    ref: 'Invoice',
    required: false,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
  },
},
{ timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
