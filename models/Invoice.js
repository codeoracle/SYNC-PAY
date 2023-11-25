const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  amount: { type: Number, required: false },
  isPaid: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
