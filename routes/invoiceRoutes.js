const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('clientId');

    res.status(200).json({
      message: 'Invoices retrieved successfully',
      invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

module.exports = router;
