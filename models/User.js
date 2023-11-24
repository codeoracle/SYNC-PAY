const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
