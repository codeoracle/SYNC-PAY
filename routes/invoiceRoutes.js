const express = require('express');
const BusinessOwner = require('../models/BusinessOwner');
const Client = require('../models/Client');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Get invoice details
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.user;

    let businessOwner;
    let client;
    let product;
    let invoice;

    if (role === 'businessOwner') {
      businessOwner = await BusinessOwner.findOne({ email });
      // Business owner can see all invoices
      invoice = await Invoice.find({}).populate('productId');
    } else if (role === 'client') {
      client = await Client.findOne({ email });
      // Client can see invoices for products assigned to them
      product = await Product.findOne({ businessOwnerId: client.businessOwnerId });
      invoice = await Invoice.find({ productId: product._id }).populate('productId');
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    res.status(200).json({
      message: 'Invoice details retrieved successfully',
      businessOwner,
      client,
      product,
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
