const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{timestamps: true}
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
