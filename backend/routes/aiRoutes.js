const express = require('express');
const router = express.Router();
const { getAIChatResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, getAIChatResponse);

module.exports = router;
