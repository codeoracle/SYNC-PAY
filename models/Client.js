const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  businessOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessOwner',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
