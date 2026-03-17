const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Bookings (complex) - use populate/slots logic' });
});

module.exports = router;

