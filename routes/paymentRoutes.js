const express = require('express');
const router = express.Router();
const axios = require('axios');

const mySecretKey = process.env.PAYSTACK_KEY; 

router.post('/initialize-payment', async (req, res) => {
  try {
    const { amount, email } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, 
      },
      {

        method: 'POST',
        headers: {
          Authorization: mySecretKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;

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
          Authorization: mySecretKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const { data } = response;

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {router};