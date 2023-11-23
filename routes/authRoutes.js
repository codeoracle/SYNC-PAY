const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user

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

    // Create a new user
    const newUser = new User({ businessName, email, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Login

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, {expiresIn: "3d"});

    // const { password, ...others} = user._doc


    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;