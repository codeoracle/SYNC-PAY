const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Create a new product
router.post('/new/product', async (req, res) => {
  try {
    const { productName, price, status } = req.body;

    const newProduct = new Product({ productName, price, status });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
