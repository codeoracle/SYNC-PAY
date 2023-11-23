const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Create a new client profile
router.post('/new/client', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      address,
      password,
    } = req.body;

    // Check if the client with the same email already exists
    const existingClient = await Client.findOne({ email });

    if (existingClient) {
      return res.status(409).json({ message: 'Client with this email already exists' });
    }

    const newClient = new Client({
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      address,
      password,
    });

    const savedClient = await newClient.save();
    res.status(201).json(savedClient);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
