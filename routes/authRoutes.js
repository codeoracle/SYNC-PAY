const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');

const router = express.Router();

// Register a new business owner
router.post('/register', async (req, res) => {
  try {
    const { businessName, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists', success: false });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ businessName, email, password: hashedPassword, role: 'businessOwner' });
    const savedUser = await newUser.save();

    res.status(201).json({ user: savedUser, success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

// Business owner login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if business owner exists
    const businessOwner = await User.findOne({ email });
    if (!businessOwner) {
      return res.status(401).json({ error: 'Invalid credentials', success: false });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, businessOwner.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials', success: false });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: businessOwner.email, role: 'businessOwner' },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.status(200).json({ businessOwner, token, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});



module.exports = router;
