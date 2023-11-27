const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
// const Product = require('../models/Product');
const User = require('../models/User');
const Client = require('../models/Client');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new client
router.post('/create-client', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
  try {
    const { businessOwnerId, firstName, lastName, email, phoneNumber, country, address, password } = req.body;

    // Check if the client already exists
    const existingClient = await Client.findOne({ email, businessOwnerId });
    if (existingClient) {
      return res.status(409).json({ error: 'Client already exists', success: false });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = new Client({
      businessOwnerId,
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      address,
      password: hashedPassword,
    });

    const savedClient = await newClient.save();

    res.status(201).json({ message: 'Client created successfully', client: savedClient, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});
// Client login
router.post('/client-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if client exists
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials', success: false });
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, client.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials', success: false });
    }

    // Fetch the business owner's information based on the businessOwnerId
    const businessOwner = await User.findById(client.businessOwnerId);

    // Generate JWT token
    const token = jwt.sign(
      { email: client.email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    // Include business owner's information in the response
    res.status(200).json({
      client: {
        _id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        role: client.role,
        phoneNumber: client.phoneNumber,
        country: client.country,
        password: client.password,
        businessOwner: {
          _id: businessOwner._id,
          name: businessOwner.businessName, // Adjust the property accordingly
          email: businessOwner.email,
        },
      },
      token,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', success: false });
  }
});

// router.post('/client-login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if client exists
//     const client = await Client.findOne({ email });
//     if (!client) {
//       return res.status(401).json({ error: 'Invalid credentials', success: false });
//     }

//     // Verify the password
//     const passwordMatch = await bcrypt.compare(password, client.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ error: 'Invalid credentials', success: false });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { email: client.email, role: 'client' },
//       process.env.JWT_SECRET,
//       { expiresIn: '3d' }
//     );

//     res.status(200).json({ client, token, success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error', success: false });
//   }
// });

// Create a new product and generate an invoice
// router.post('/create-product', authenticateToken, authorizeRole('businessOwner'), async (req, res) => {
//   try {
//     const { businessOwnerId, productName, price, clientId } = req.body;

//     // Check if the product with the same name and price already exists
//     const existingProduct = await Product.findOne({ productName, price, businessOwnerId });
//     if (existingProduct) {
//       return res.status(409).json({ error: 'Product already exists', success: false });
//     }

//     // Create a new product
//     const newProduct = new Product({
//       businessOwnerId,
//       productName,
//       price,
//     });

//     const savedProduct = await newProduct.save();

//     // Generate a unique invoice ID
//     const invoiceId = uuid.v4();

//     // Create a new invoice
//     const newInvoice = new Invoice({
//       clientId,
//       businessOwnerId,
//       invoiceId,
//       products: [savedProduct._id],
//     });

//     const savedInvoice = await newInvoice.save();

//     res.status(201).json({ message: 'Product and invoice created successfully', product: savedProduct, invoice: savedInvoice, success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error', success: false });
//   }
// });

module.exports = router;
