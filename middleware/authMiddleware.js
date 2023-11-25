const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');

async function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization');

  if (authHeader) {
    // const token = authHeader;
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden - Invalid token' });
      }

      // Check user role and set it in req.user
      switch (user.role) {
        case 'businessOwner':
          req.user = await User.findOne({ email: user.email });
          break;
        case 'client':
          req.user = await Client.findOne({ email: user.email });
          break;
        default:
          return res.status(403).json({ message: 'Forbidden - Unknown role' });
      }

      next();
    });
  } else {
    return res.status(401).json({ message: 'Unauthorized - Missing token' });
  }
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }
  };
}

module.exports = { authenticateToken, authorizeRole };
