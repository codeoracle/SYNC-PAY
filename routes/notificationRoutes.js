const express = require('express');
const router = express.Router();

router.post('/send-notification', (req, res) => {
  const io = req.io;

  // Extract data from the request body or parameters if needed
  const { message } = req.body;

  // Emit a notification to all connected clients
  io.emit('notification', { message });

  res.status(200).json({ success: true, message: 'Notification sent' });
});

module.exports = router;
