// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({

   invoiceId: { type: String, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  businessOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;