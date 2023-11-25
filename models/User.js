const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

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
  role: {
    type: String,
    enum: ['businessOwner', 'client'],
    default: 'businessOwner',
  },
},
{timestamps: true}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
