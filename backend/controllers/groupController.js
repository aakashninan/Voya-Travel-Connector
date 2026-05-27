const Group = require('../models/Group');
const Match = require('../models/Match');
const User = require('../models/User');

// Helper to verify if target is a mutual match of current user
const checkIsMutualMatch = async (userId, targetId) => {
  const check1 = await Match.findOne({ sender: userId, receiver: targetId, status: 'like' });
  const check2 = await Match.findOne({ sender: targetId, receiver: userId, status: 'like' });
  return !!(check1 && check2);
};

// @desc    Create a new travel group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  const { name, description, destination } = req.body;
  const creatorId = req.user._id;

  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  try {
    const group = await Group.create({
      name,
      description,
      destination,
      creator: creatorId,
      members: [creatorId], // Creator is automatically a member
      invites: []
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Create Group Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite a mutual match to a travel group
// @route   POST /api/groups/:groupId/invite
// @access  Private
const inviteMatchToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { inviteeId } = req.body;
  const currentUserId = req.user._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only members can invite others
    if (!group.members.includes(currentUserId)) {
      return res.status(403).json({ message: 'Only active members can invite travelers' });
    }

    // Verify invitee is a mutual match
    const isMutual = await checkIsMutualMatch(currentUserId, inviteeId);
    if (!isMutual) {
      return res.status(400).json({ message: 'You can only invite mutual matches to travel groups' });
    }

    // Check if user is already a member
    if (group.members.includes(inviteeId)) {
      return res.status(400).json({ message: 'Traveler is already a member of this group' });
    }

    // Check if user already has a pending/approved invite
    const existingInvite = group.invites.find(inv => inv.user.toString() === inviteeId);
    if (existingInvite) {
      if (existingInvite.status === 'pending') {
        return res.status(400).json({ message: 'Invitation already pending for this traveler' });
      }
      if (existingInvite.status === 'approved') {
        return res.status(400).json({ message: 'Traveler is already approved' });
      }
      // If rejected, let's allow re-inviting by resetting status to pending
      existingInvite.status = 'pending';
      existingInvite.sentAt = new Date();
    } else {
      // Add new invite
      group.invites.push({ user: inviteeId, status: 'pending' });
    }

    await group.save();
    res.json({ success: true, message: 'Invitation sent successfully', group });
  } catch (error) {
    console.error('Invite Match Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending group invitations for the logged-in traveler
// @route   GET /api/groups/invites
// @access  Private
const getPendingInvites = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const groups = await Group.find({
      'invites': {
        $elemMatch: { user: currentUserId, status: 'pending' }
      }
    })
    .populate('creator', 'name age pictures occupation')
    .select('name description destination creator createdAt');

    res.json(groups);
  } catch (error) {
    console.error('Get Pending Invites Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or reject a group invitation
// @route   PUT /api/groups/:groupId/respond
// @access  Private
const respondToInvite = async (req, res) => {
  const { groupId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  const currentUserId = req.user._id;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the invite sub-document
    const invite = group.invites.find(inv => inv.user.toString() === currentUserId.toString());

    if (!invite) {
      return res.status(404).json({ message: 'No invitation found for this user in this group' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invitation already ${invite.status}` });
    }

    if (action === 'approve') {
      invite.status = 'approved';
      // Add to members if not already there
      if (!group.members.includes(currentUserId)) {
        group.members.push(currentUserId);
      }
    } else {
      invite.status = 'rejected';
    }

    await group.save();

    res.json({
      success: true,
      message: `Invitation successfully ${action === 'approve' ? 'approved' : 'rejected'}`,
      group
    });
  } catch (error) {
    console.error('Respond Invite Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active groups current traveler belongs to
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const groups = await Group.find({ members: currentUserId })
      .populate('members', 'name age pictures occupation bio')
      .populate('creator', 'name age');

    res.json(groups);
  } catch (error) {
    console.error('Get My Groups Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a message in a planning group chat
// @route   POST /api/groups/:groupId/messages
// @access  Private
const sendGroupMessage = async (req, res) => {
  const { groupId } = req.params;
  const { text } = req.body;
  const currentUserId = req.user._id;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Message text cannot be empty' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Verify sender is in members list
    if (!group.members.includes(currentUserId)) {
      return res.status(403).json({ message: 'You must be a member of the group to chat' });
    }

    // Add message
    group.messages.push({
      sender: currentUserId,
      senderName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    });

    await group.save();

    // Fetch the updated messages list
    res.json(group.messages);
  } catch (error) {
    console.error('Send Msg Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  inviteMatchToGroup,
  getPendingInvites,
  respondToInvite,
  getMyGroups,
  sendGroupMessage
};
