// clientController.js
const express = require('express');
const axios = require('axios');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product'); 

const router = express.Router();

// Get all products
router.get('/get-products', async (req, res) => {
  try {
    const { businessOwnerId } = req.query;

    // Fetch all products associated with the business owner
    const products = await Product.find({ businessOwnerId });

    res.status(200).json({ message: 'Products retrieved successfully', products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get invoices for a client
router.get('/get-invoices', async (req, res) => {
  try {
    const { clientId } = req.query;

    // Fetch all invoices associated with the client
    const invoices = await Invoice.find({ clientId }).populate('products');

    res.status(200).json({ message: 'Invoices retrieved successfully', invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Make payment for an invoice
router.put('/make-payment', async (req, res) => {
  try {
    const { clientId, invoiceId, amount, email } = req.body;

    // Save payment details to the database
    const payment = new Payment({
      clientId,
      invoiceId,
      amount,
      reference: '', 
    });

    const savedPayment = await payment.save();

    // Simulate a successful payment status
    const paymentStatusData = {
      data: {
        status: 'paid', // Simulate a successful payment
      },
    };

    // Update payment status in the database based on the simulated Paystack response
    payment.status = paymentStatusData.data.status;
    await payment.save();

    // If payment is successful, update the associated invoice
    if (payment.status === 'paid') {
      const invoice = await Invoice.findOne({ _id: invoiceId });
      if (invoice) {
        invoice.isPaid = true;
        invoice.payments.push(savedPayment._id);
        await invoice.save();
      }

      // Emit a Socket.IO event to notify clients about the payment status
      req.io.emit('paymentStatus', {
        clientId: payment.clientId,
        invoiceId: payment.invoice,
        status: payment.status,
      });
    }

    res.status(200).json({ message: 'Payment simulated successfully', success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
