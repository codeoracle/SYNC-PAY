const mongoose = require('mongoose');

const businessOwnerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BusinessOwner = mongoose.model('BusinessOwner', businessOwnerSchema);

module.exports = BusinessOwner;
