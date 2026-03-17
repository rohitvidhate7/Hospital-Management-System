const express = require('express');
const router = express.Router();

// Stub - implement using patient pattern
router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Doctors endpoint - implement controller' });
});

module.exports = router;

