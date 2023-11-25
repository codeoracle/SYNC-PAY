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
router.post('/make-payment', async (req, res) => {
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

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email, 
        amount: amount * 100, 
      },
      {
        headers: {
          Authorization: process.env.PAYSTACK_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;

    // Update the reference field in the database with the Paystack reference
    savedPayment.reference = data.data.reference;
    await savedPayment.save();

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
