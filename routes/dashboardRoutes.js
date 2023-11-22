const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');



// Protected route example
router.get('/dashboard', authenticateToken, authorizeRole('Business Owner'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the dashboard, Business Owner!' });
});

module.exports = router;