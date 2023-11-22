const express = require('express');
const router = express.Router();
const crypto = require('crypto-js');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save the reset token and expiration time in the user's document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send a password reset email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.forwardemail.net",
        port: 465,
        secure: true,
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this email because you (or someone else) have requested a password reset for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            ${process.env.CLIENT_URL}/reset-password/${resetToken}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }

      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Password reset email sent' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Verify and reset the password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the user with the reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update the user's password and clear the reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
