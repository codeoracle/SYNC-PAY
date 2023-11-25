const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Dashboard route for business owner
router.get('/dashboard', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    // Get business owner's ID from the decoded token
    const businessOwnerId = req.user._id; // Assuming the business owner's ID is stored in req.user._id

    // Fetch necessary data for the dashboard
    const totalAmount = await Invoice.aggregate([
      { $match: { businessOwnerId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const numberOfClients = await Client.countDocuments({ businessOwnerId });

    const totalInvoices = await Invoice.countDocuments({ businessOwnerId });

    // Return the dashboard information
    res.status(200).json({
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      numberOfClients,
      totalInvoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
