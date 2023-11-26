const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create a new product
router.post('/create-product', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { productName, price, clientId } = req.body;

    // Create a new product
    const newProduct = new Product({
      businessOwnerId: req.user._id, 
      productName,
      price,
    });

    const savedProduct = await newProduct.save();

    // Generate a unique invoice ID
    const invoiceId = uuid.v4();

    // Create a new invoice
    const newInvoice = new Invoice({
      clientId,
      businessOwnerId: req.user._id, 
      invoiceId,
      products: [savedProduct._id],
    });

    const savedInvoice = await newInvoice.save();

    res.status(201).json({ message: 'Product and invoice created successfully', product: savedProduct, invoice: savedInvoice, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

// Get all products
router.get('/products', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const businessOwnerId = req.user._id;

    const products = await Product.find({ businessOwnerId });

    res.status(200).json({
      message: 'Products retrieved successfully',
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get products by status (paid or unpaid)
router.get('/products/:status', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { status } = req.params;
    const businessOwnerId = req.user._id;

    const products = await Product.find({ businessOwnerId, status });

    res.status(200).json({
      message: `Products with status ${status} retrieved successfully`,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get product details
router.get('/products/:productId', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { productId } = req.params;
    const businessOwnerId = req.user._id;

    const product = await Product.findOne({ _id: productId, businessOwnerId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product details retrieved successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;