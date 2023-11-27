const express = require('express');
const short = require('short-uuid');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate invoice for a specific product and update product status
router.put('/generate-invoice/:productId', authenticateToken, async (req, res) => {
  try {
    const { clientId, amount } = req.body;
    const { productId } = req.params;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found', success: false });
    }

    // Create a new invoice
    let invoiceId = '#';
    const id = short.generate();
    invoiceId += id;

    // Create a new invoice for the product
    const newInvoice = new Invoice({
      clientId,
      invoiceId,
      businessOwnerId: product.businessOwnerId,
      amount,
      products: [productId],
    });

    const savedInvoice = await newInvoice.save();

    // Update the product status to paid
    product.status = 'paid';
    await product.save();

    // Save payment details to the database
    const payment = new Payment({
      clientId,
      invoiceId: savedInvoice._id,
      amount,
      reference: short.generate(),
    });

    const savedPayment = await payment.save();

    // Emit a Socket.IO event to notify clients about the payment status
    req.io.emit('paymentStatus', {
      clientId: payment.clientId,
      invoiceId: payment.invoiceId,
      status: 'paid',
    });

    res.status(200).json({
      message: 'Payment and invoice created successfully',
      success: true,
      payment: savedPayment,
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
});

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