const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Product = require('../models/Product');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');


// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
}

// Get all clients
router.get('/clients', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const businessOwnerId = req.user._id;

    const clients = await Client.find({ businessOwnerId });

    res.status(200).json({
      message: 'Clients retrieved successfully',
      clients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get client details
router.get('/clients/:clientId', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { clientId } = req.params;
    const businessOwnerId = req.user._id;

    const client = await Client.findOne({ _id: clientId, businessOwnerId });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({
      message: 'Client details retrieved successfully',
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all products for the client
router.get('/client/products', authenticateToken, async (req, res) => {
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

// Get product details for the client
router.get('/client/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId });

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

// Use the error handling middleware
router.use(errorHandler);

module.exports = router;
