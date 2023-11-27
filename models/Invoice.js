// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({

  invoiceId: { type: String, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Define products as an array
  amount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
