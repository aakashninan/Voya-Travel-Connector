const express = require('express');
const router = express.Router();
const { swipeUser, getMatches, getLikesReceived, getDirectMessages, sendDirectMessage } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.post('/swipe', protect, swipeUser);
router.get('/likes-received', protect, getLikesReceived);
router.route('/:partnerId/messages')
  .get(protect, getDirectMessages)
  .post(protect, sendDirectMessage);
router.get('/', protect, getMatches);

module.exports = router;
