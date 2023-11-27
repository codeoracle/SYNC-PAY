const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Invoice = require('../models/Invoice');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');


// Get all invoices with product details
router.get('/invoices', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const invoices = await Invoice.find().populate({
      path: 'products',
      select: 'productName price', // Select the fields you want to retrieve
    });

    res.status(200).json({
      message: 'Invoices retrieved successfully',
      invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

// Get a single invoice by ID with product details
router.get('/invoices/:invoiceId', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId).populate({
      path: 'products',
      select: 'productName price', // Select the fields you want to retrieve
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found', success: false });
    }

    res.status(200).json({
      message: 'Invoice retrieved successfully',
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

// Update invoice status from unpaid to paid
router.put('/invoices/:invoiceId/mark-paid', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Find the invoice by ID
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found', success: false });
    }

    // Check if the invoice is already paid
    if (invoice.isPaid) {
      return res.status(400).json({ message: 'Invoice is already paid', success: false });
    }
    // Update invoice status to paid
    invoice.isPaid = true;

    // You can generate the reference number here, e.g., using a function or library
    const referenceNumber = uuid.v4();

    // Save the updated invoice
    await invoice.save();

    res.status(200).json({
      message: 'Invoice status updated to paid successfully',
      referenceNumber,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

module.exports = router;