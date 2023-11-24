const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');



// Protected route example
router.get('/dashboard', authenticateToken, authorizeRole('Business Owner'), async (req, res) => {
 try {
    // Get total balance
    const totalBalance = await Payment.aggregate([
      {
        $match: { status: 'paid' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Get total number of clients
    const totalClients = await Client.countDocuments();

    res.status(200).json({
      totalBalance: totalBalance.length > 0 ? totalBalance[0].total : 0,
      totalClients,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;