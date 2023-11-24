const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BusinessOwner = require('../models/BusinessOwner');
const Client = require('../models/Client');

const router = express.Router();

// Register a new business owner
router.post('/register', async (req, res) => {
  try {
    const { businessName, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new business owner
    const newBusinessOwner = new BusinessOwner({ businessName, email, password: hashedPassword });
    const savedBusinessOwner = await newBusinessOwner.save();

    // Create a new user
    const newUser = new User({ email, password: hashedPassword, role: 'businessOwner' });
    await newUser.save();

    res.status(201).json(savedBusinessOwner);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Business owner login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if business owner exists
    const businessOwner = await BusinessOwner.findOne({ email });
    if (!businessOwner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, businessOwner.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: businessOwner.email, role: 'businessOwner' },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({ businessOwner, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Client login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if client exists
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, client.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: client.email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({ client, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
