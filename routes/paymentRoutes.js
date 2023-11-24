const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const BusinessOwner = require('../models/BusinessOwner');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Make payment for a product
router.post('/initialize-payment', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const { email, role } = req.user;

    // Check if the user is a client
    if (role !== 'client') {
      return res.status(403).json({ message: 'Only clients can make payments' });
    }

    // Find the client
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Find the product assigned to the client
    const product = await Product.findOne({ _id: productId, businessOwnerId: client.businessOwnerId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not assigned to the client' });
    }

    // Integrate with Paystack for payment processing
    const paystackResponse = await initiatePaystackPayment(product.price, client.email);
    const paymentReference = paystackResponse.data.data.reference;

    // Update the product's status to 'paid'
    product.status = 'paid';
    await product.save();

    // Create an invoice for the payment
    const invoice = new Invoice({
      productId: product._id,
      productName: product.productName,
      price: product.price,
      clientEmail: client.email,
      status: 'paid',
    });
    await invoice.save();

    // You can send the payment details back to the client
    res.status(200).json({
      message: 'Payment successful',
      paymentReference,
      product,
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Function to initiate payment using Paystack
async function initiatePaystackPayment(amount, email) {
  const paystackEndpoint = 'https://api.paystack.co/transaction/initialize';
  const paystackSecretKey = process.env.PAYSTACK_KEY;

  const paystackPayload = {
    email,
    amount: amount * 100, // Paystack requires amount in kobo
  };

  const paystackHeaders = {
    headers: {
      Authorization: paystackSecretKey,
    },
  };

  return axios.post(paystackEndpoint, paystackPayload, paystackHeaders);
}

module.exports = router;