const express = require('express');
const router = express.Router();
const {
  createGroup,
  inviteMatchToGroup,
  getPendingInvites,
  respondToInvite,
  getMyGroups,
  sendGroupMessage
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createGroup)
  .get(protect, getMyGroups);

router.get('/invites', protect, getPendingInvites);
router.post('/:groupId/invite', protect, inviteMatchToGroup);
router.put('/:groupId/respond', protect, respondToInvite);
router.post('/:groupId/messages', protect, sendGroupMessage);

module.exports = router;
