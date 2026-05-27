const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/delete', protect, deleteAccount);

module.exports = router;
