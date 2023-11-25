// controllers/passwordResetController.js
const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const sendEmail = require('../utils/sendEmail');

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Controller to handle forgot password request
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique token
    const token = generateToken();

    // Save the token to the database
    const resetToken = new PasswordResetToken({
      userId: user._id,
      token,
      expires: Date.now() + 3600000, // Token expires in 1 hour
    });

    await resetToken.save();

    // Send the reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of the password. Please click on the following link to complete the process: ${resetUrl}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller to handle password reset
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find the token in the database
    const resetToken = await PasswordResetToken.findOne({ token, expires: { $gt: Date.now() } });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Find the user associated with the token
    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = password;
    await user.save();

    // Delete the reset token from the database
    await resetToken.remove();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { forgotPassword, resetPassword };
