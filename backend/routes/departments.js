const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Departments endpoint - implement using patient pattern' });
});

module.exports = router;

