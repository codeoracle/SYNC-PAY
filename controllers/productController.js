const Product = require('../models/Product');

// Controller to create a new product
const createProduct = async (req, res) => {
  try {
    const { productName, price } = req.body;
    const newProduct = new Product({ productName, price });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller to get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { createProduct, getAllProducts };
