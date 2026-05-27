const Match = require('../models/Match');
const User = require('../models/User');

// @desc    Swipe left (dislike) or right (like) on a traveler
// @route   POST /api/matches/swipe
// @access  Private
const swipeUser = async (req, res) => {
  const { targetUserId, status } = req.body;
  const currentUserId = req.user._id;

  if (!targetUserId || !['like', 'dislike'].includes(status)) {
    return res.status(400).json({ message: 'Invalid target user or swipe status' });
  }

  try {
    console.log(`[SWIPE] User ${currentUserId} swiped ${status} on User ${targetUserId}`);

    // 1. Create or update swipe record
    const swipe = await Match.findOneAndUpdate(
      { sender: currentUserId, receiver: targetUserId },
      { status, createdAt: new Date() },
      { upsert: true, new: true }
    );

    let isMatch = false;

    // 2. If it's a like, check for a mutual match
    if (status === 'like') {
      const mutualLike = await Match.findOne({
        sender: targetUserId,
        receiver: currentUserId,
        status: 'like'
      });

      if (mutualLike) {
        isMatch = true;
        console.log(`[MATCH] Mutual Match formed between ${currentUserId} and ${targetUserId}!`);
      }
    }

    res.json({
      success: true,
      swipe,
      isMatch,
      message: isMatch ? "It's a WanderMatch!" : 'Swipe recorded successfully'
    });
  } catch (error) {
    console.error('Swipe Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all mutual matches for current user
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    // Find all users I liked
    const myLikes = await Match.find({ sender: currentUserId, status: 'like' });
    const likedUserIds = myLikes.map(like => like.receiver);

    if (likedUserIds.length === 0) {
      return res.json([]);
    }

    // Find which of those liked users also liked me back
    const mutualLikes = await Match.find({
      sender: { $in: likedUserIds },
      receiver: currentUserId,
      status: 'like'
    });

    const mutualUserIds = mutualLikes.map(like => like.sender);

    // Populate user profiles
    const matchedUsers = await User.find({ _id: { $in: mutualUserIds } })
      .select('name age gender occupation bio pictures destinations travelDuration travelStyles travelCalendar');

    res.json(matchedUsers);
  } catch (error) {
    console.error('Get Matches Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all likes received by current user (Who Liked Me)
// @route   GET /api/matches/likes-received
// @access  Private
const getLikesReceived = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    // Find all likes sent to me
    const likesSentToMe = await Match.find({ receiver: currentUserId, status: 'like' }).select('sender');
    const senderIds = likesSentToMe.map(like => like.sender);

    console.log(`[LIKES-RECEIVED] Raw likes sent to ${currentUserId}:`, senderIds);

    if (senderIds.length === 0) {
      return res.json([]);
    }

    // Filter out users that I have already swiped on (liked or disliked)
    const mySwipes = await Match.find({ sender: currentUserId }).select('receiver');
    const mySwipedUserIds = mySwipes.map(swipe => swipe.receiver.toString());

    console.log(`[LIKES-RECEIVED] ${currentUserId} has already swiped on:`, mySwipedUserIds);

    // Only include senders I haven't swiped on
    const cleanSenderIds = senderIds.filter(id => !mySwipedUserIds.includes(id.toString()));

    console.log(`[LIKES-RECEIVED] Clean pending likes for ${currentUserId}:`, cleanSenderIds);

    // Populate user profiles
    const likedByUsers = await User.find({ _id: { $in: cleanSenderIds } })
      .select('name age gender occupation bio pictures destinations travelDuration travelStyles travelCalendar');

    res.json(likedByUsers);
  } catch (error) {
    console.error('Get Likes Received Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get direct messages for a mutual match
// @route   GET /api/matches/:partnerId/messages
// @access  Private
const getDirectMessages = async (req, res) => {
  const currentUserId = req.user._id;
  const { partnerId } = req.params;

  try {
    // Determine consistent document by sorting sender/receiver IDs lexicographically in JavaScript
    const sortedSender = currentUserId.toString() < partnerId.toString() ? currentUserId : partnerId;
    const sortedReceiver = currentUserId.toString() < partnerId.toString() ? partnerId : currentUserId;

    const match = await Match.findOne({
      sender: sortedSender,
      receiver: sortedReceiver,
      status: 'like'
    });

    if (!match) {
      console.log(`[DM] No consistent match document found for ${currentUserId} and ${partnerId}`);
      return res.status(404).json({ message: 'Mutual match conversation not found' });
    }

    res.json(match.messages);
  } catch (error) {
    console.error('Get Direct Messages Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a direct message to a mutual match
// @route   POST /api/matches/:partnerId/messages
// @access  Private
const sendDirectMessage = async (req, res) => {
  const currentUserId = req.user._id;
  const { partnerId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Message text cannot be empty' });
  }

  try {
    // Determine consistent document by sorting sender/receiver IDs lexicographically in JavaScript
    const sortedSender = currentUserId.toString() < partnerId.toString() ? currentUserId : partnerId;
    const sortedReceiver = currentUserId.toString() < partnerId.toString() ? partnerId : currentUserId;

    const match = await Match.findOne({
      sender: sortedSender,
      receiver: sortedReceiver,
      status: 'like'
    });

    if (!match) {
      return res.status(404).json({ message: 'Mutual match conversation not found' });
    }

    match.messages.push({
      sender: currentUserId,
      senderName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    });

    await match.save();
    console.log(`[DM] Message successfully sent from ${currentUserId} to ${partnerId}`);
    res.json(match.messages);
  } catch (error) {
    console.error('Send Direct Message Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  swipeUser,
  getMatches,
  getLikesReceived,
  getDirectMessages,
  sendDirectMessage
};
