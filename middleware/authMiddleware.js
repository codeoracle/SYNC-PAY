const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.header.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden - Invalid token' });
        }
        
        req.user = user;
        next();
    });
} else{
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
