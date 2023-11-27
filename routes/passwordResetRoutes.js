// const express = require('express');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const sgMail = require('@sendgrid/mail');

// const app = express();
// app.use(express.json());

// // Set your SendGrid API key
// sgMail.setApiKey(process.env.PASS_SEC);



// // Generate a JWT token for password reset
// function generateResetToken() {
//   return jwt.sign({ data: 'reset' }, 'your-secret-key', { expiresIn: '1h' });
// }

// // Send password reset email
// async function sendResetEmail(user) {
//   const resetToken = generateResetToken();
//   const resetLink = `https://sync-pay.netlify.app//reset-password?token=${resetToken}`;

//   // Update user in the database with the new reset token and expiry date
//   await User.findByIdAndUpdate(user._id, {
//     resetToken: resetToken,
//     resetTokenExpiry: Date.now() + 3600000, // 1 hour expiration
//   });

//   // Send email with the reset link using SendGrid
//   const msg = {
//     to: user.email,
//     from: process.env.EMAIL_USER,
//     subject: process.env.EMAIL_PASSWORD,
//     text: `Click the following link to reset your password: ${resetLink}`,
//   };

//   try {
//     await sgMail.send(msg);
//     console.log('Email sent successfully');
//   } catch (error) {
//     console.error(error);
//   }
// }

// // Request password reset
// app.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   try {
//     // Find the user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Send password reset email
//     await sendResetEmail(user);

//     res.status(200).json({ message: 'Password reset email sent' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // Handle password reset
// app.post('/reset-password', async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     // Verify the reset token
//     const decodedToken = jwt.verify(token, 'your-secret-key');

//     // Find the user by the reset token
//     const user = await User.findOne({ resetToken: token });

//     if (!user || user.resetTokenExpiry < Date.now()) {
//       return res.status(400).json({ message: 'Invalid or expired reset token' });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update user's password and clear reset token
//     await User.findByIdAndUpdate(user._id, {
//       password: hashedPassword,
//       resetToken: null,
//       resetTokenExpiry: null,
//     });

//     res.status(200).json({ message: 'Password reset successful' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });
