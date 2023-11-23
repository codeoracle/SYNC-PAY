const express = require('express');
const router = express.Router();
const axios = require('axios');
const  uuidv4 = require('uuid')
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

const paystackSec = process.env.PAYSTACK_KEY; 

router.post('/initialize-payment', async (req, res) => {
  try {
    const { clientId, amount } = req.body;

    // Generate a unique invoice ID

    const invoiceId = generateUniqueInvoiceId();

    // Save invoice details to the database
    const invoice = new Invoice({
      clientId,
      invoiceId,
      amount,
    });

    const savedInvoice = await invoice.save();

    // Save payment details to the database
    const payment = new Payment({
      fullName: req.body.fullName,
      email: req.body.email,
      amount,
      reference: '', 
      invoiceId: savedInvoice.invoiceId,
    });

    const savedPayment = await payment.save();

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.body.email,
        amount: amount * 100, // Paystack API expects amount in kobo
      },
      {
        headers: {
          Authorization: paystackSec,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;

    // Update the reference field in the database with the Paystack reference
    savedPayment.reference = data.data.reference;
    savedPayment.invoiceId = savedInvoice.invoiceId;
    await savedPayment.save();

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: paystackSec,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;

    // Update payment status in the database based on the Paystack response
    const payment = await Payment.findOne({ reference });
    if (payment) {
      payment.status = data.data.status;
      await payment.save();

      // If payment is successful, update the associated invoice
      if (data.data.status === 'paid') {
        const invoice = await Invoice.findOne({ invoiceId: payment.invoiceId });
        if (invoice) {
          invoice.isPaid = true;
          invoice.payments.push(payment._id);
          await invoice.save();
        }
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Helper function to generate a unique invoice ID
function generateUniqueInvoiceId() {
  
return uuidv4();

}

module.exports = router;
