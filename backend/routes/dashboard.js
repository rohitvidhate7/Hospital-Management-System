const express = require('express');
const router = express.Router();

router.get('/stats', (req, res) => {
  res.status(501).json({ success: false, message: 'Dashboard stats - aggregate queries' });
});

module.exports = router;

