const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Services endpoint - copy patient controller pattern' });
});

module.exports = router;

