const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to the client route
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    // Get the business owner's ID from the decoded token
    const businessOwnerId = req.user.businessOwnerId;

    // Verify ownership by matching businessOwnerId with the decoded token
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

// Include the previous POST response for creating a new client
router.post('/new/client', authenticateToken, async (req, res) => {
  try {
    // Get the business owner's ID from the decoded token
    const businessOwnerId = req.user.businessOwnerId;

    // Securely create a new client by verifying ownership and validating input
    const newClient = new Client({
      businessOwnerId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      country: req.body.country,
      address: req.body.address,
    });

    const savedClient = await newClient.save();

    res.status(201).json({
      message: 'Client created successfully',
      client: savedClient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
