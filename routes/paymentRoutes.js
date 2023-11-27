// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const uuid = require('uuid');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

const paystackSec = process.env.PAYSTACK_KEY;

router.post('/initialize-payment', async (req, res) => {
  try {
    const { clientId, amount, email, invoiceId } = req.body;

    // Find the existing invoice in the database
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

  
    // Save payment details to the database
    const payment = new Payment({
      clientId,
      invoiceId,
      amount,
      email,
      reference: uuid.v4(),
    });

    const savedPayment = await payment.save();

    // Simulate a successful payment status
    const paymentStatusData = {
      data: {
        reference: savedPayment.reference,
        status: 'success',
      },
    };

    // Update the reference field in the database with the simulated payment status
    savedPayment.reference = paymentStatusData.data.reference;
    savedPayment.status = paymentStatusData.data.status;
    await savedPayment.save();

    res.status(200).json(paymentStatusData);
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
        const invoice = await Invoice.findOne({ _id: payment.invoiceId });
        if (invoice) {
          invoice.isPaid = true;
          invoice.payments.push(payment._id);
          await invoice.save();
        }

        // Emit a Socket.IO event to notify clients about the payment status
        req.io.emit('paymentStatus', {
          clientId: payment.clientId,
          invoiceId: payment.invoiceId,
          status: data.data.status,
        });
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;