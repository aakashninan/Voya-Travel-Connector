const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getFeed, getSyncData } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.get('/feed', protect, getFeed);
router.get('/sync', protect, getSyncData);

module.exports = router;
