const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const BusinessOwner = require('../models/BusinessOwner');
const Client = require('../models/Client');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new product
router.post('/new/product', authenticateToken, async (req, res) => {
  try {
    const { productName, price, status } = req.body;
    const { email, role } = req.user;

    // Check if the user is a business owner
    if (role !== 'businessOwner') {
      return res.status(403).json({ message: 'Only business owners can create products' });
    }

    // Find the business owner
    const businessOwner = await BusinessOwner.findOne({ email });
    if (!businessOwner) {
      return res.status(404).json({ message: 'Business owner not found' });
    }

    // Create a new product
    const newProduct = new Product({
      productName,
      price,
      status,
      businessOwnerId: businessOwner._id,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get product details based on user type
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.user;

    let products;

    if (role === 'businessOwner') {
      // Business owner can see all products
      products = await Product.find({});
    } else if (role === 'client') {
      // Client can see only products assigned to them
      const client = await Client.findOne({ email });
      products = await Product.find({ businessOwnerId: client.businessOwnerId });
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    res.status(200).json({
      message: 'Product details retrieved successfully',
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
