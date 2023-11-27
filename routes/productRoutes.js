// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const short = require('short-uuid');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create a new product
router.post('/create-product', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { productName, price } = req.body;

    // Find or create an open invoice for all clients under the business owner
    const businessOwnerId = req.user._id;
    let newInvoice;

    // Find the latest unpaid invoice for the business owner
    const openInvoice = await Invoice.findOne({ businessOwnerId, isPaid: false }).sort({ createdAt: -1 });

    if (!openInvoice) {
      // If no open invoice exists, create a new one
      let invoiceId = '#';
      const id = short.generate();
      invoiceId += id;

      newInvoice = new Invoice({
        businessOwnerId,
        invoiceId,
        amount: price,
        products: [], // Initialize products as an empty array
      });

      // Save the new invoice
      await newInvoice.save();
    } else {
      newInvoice = openInvoice;
    }

    // Create a new product
    const newProduct = new Product({
      businessOwnerId,
      productName,
      price,
    });

    const savedProduct = await newProduct.save();

    // Add the product to the invoice
    newInvoice.products.push(savedProduct._id);

    // Save the updated invoice
    await newInvoice.save();

    res.status(201).json({
      message: 'Product and invoice created successfully',
      product: savedProduct,
      Invoice: newInvoice,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

// Get all products
router.get('/products', authenticateToken, async (req, res) => {
    try {
    const products = await Product.find();

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
router.get('/products/:status', authenticateToken, async (req, res) => {
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
router.get('/product/:productId', authenticateToken, async (req, res) => {
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
