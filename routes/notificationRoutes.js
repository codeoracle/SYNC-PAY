const express = require('express');
const router = express.Router();

// Simple route to emit a notification
router.post('/notify', (req, res) => {
  try {
    const { message } = req.body;

    // Emit the notification to all connected clients
    req.io.emit('notification', { message });

    res.status(200).json({ message: 'Notification sent successfully', success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
});

module.exports = router;