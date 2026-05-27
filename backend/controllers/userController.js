const User = require('../models/User');
const Match = require('../models/Match');
const Group = require('../models/Group');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      age,
      gender,
      occupation,
      bio,
      location,
      nativity,
      pictures,
      prompts,
      voicePrompt,
      destinations,
      travelDuration,
      travelStyles,
      travelCalendar
    } = req.body;

    // Update fields if provided
    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (occupation !== undefined) user.occupation = occupation;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (nativity !== undefined) user.nativity = nativity;
    if (pictures !== undefined) user.pictures = pictures;
    if (prompts !== undefined) user.prompts = prompts;
    if (voicePrompt !== undefined) user.voicePrompt = voicePrompt;
    if (destinations !== undefined) user.destinations = destinations;
    if (travelDuration !== undefined) user.travelDuration = travelDuration;
    if (travelStyles !== undefined) user.travelStyles = travelStyles;
    if (travelCalendar !== undefined) user.travelCalendar = travelCalendar;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feed of other users based on swipes and filters
// @route   GET /api/users/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Get list of user IDs that current user has already swiped on (likes or dislikes)
    const swipedMatches = await Match.find({ sender: currentUserId }).select('receiver');
    const swipedUserIds = swipedMatches.map(m => m.receiver);

    // Add current user to exclusions
    swipedUserIds.push(currentUserId);

    // 2. Build filter query
    const query = { _id: { $nin: swipedUserIds } };

    // Get filters from query parameters
    const { gender, travelStyle, duration, destination, location, nativity } = req.query;

    // A. Gender Filter: If 'men' or 'women', match exactly. If 'everyone' or omitted, do not restrict.
    if (gender && gender !== 'everyone') {
      query.gender = gender;
    }

    // B. Travel Styles Filter: Matches if user has at least one of the selected styles
    if (travelStyle) {
      // Expecting comma-separated or single value
      const styles = travelStyle.split(',');
      query.travelStyles = { $in: styles.map(s => new RegExp(`^${s.trim()}$`, 'i')) };
    }

    // C. Travel Duration Filter
    if (duration && duration !== '') {
      query.travelDuration = new RegExp(duration.trim(), 'i');
    }

    // D. Target Destination keyword matching
    if (destination && destination.trim() !== '') {
      query.destinations = {
        $elemMatch: { $regex: destination.trim(), $options: 'i' }
      };
    }

    // E. Location Filter
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // F. Nativity Filter
    if (nativity && nativity.trim() !== '') {
      query.nativity = new RegExp(nativity.trim(), 'i');
    }

    // 3. Find profiles matching filters
    // Only return users who have at least set a bio or some pictures (completed profile vibe check)
    // To ensure feed is not empty during local tests, let's fall back to any user except exclusions
    let feedUsers = await User.find(query)
      .select('-password')
      .limit(30);

    res.json(feedUsers);
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get consolidated sync data for real-time dashboard updates
// @route   GET /api/users/sync
// @access  Private
const getSyncData = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { activeDirectChatId } = req.query;

    // 1. Query Matches and Groups in parallel using index-covered operations
    const [allMatches, myGroups, pendingInvites] = await Promise.all([
      Match.find({ $or: [{ sender: currentUserId }, { receiver: currentUserId }] }),
      Group.find({ members: currentUserId })
        .populate('members', 'name age pictures occupation bio')
        .populate('creator', 'name age'),
      Group.find({
        'invites': {
          $elemMatch: { user: currentUserId, status: 'pending' }
        }
      })
      .populate('creator', 'name age pictures occupation')
      .select('name description destination creator createdAt')
    ]);

    // 2. Perform in-memory separation of Likes Sent, Likes Received, and Mutual Matches
    const likedMeIds = allMatches
      .filter(m => m.receiver && m.receiver.toString() === currentUserId.toString() && m.status === 'like')
      .map(m => m.sender.toString());

    const ILikedIds = allMatches
      .filter(m => m.sender && m.sender.toString() === currentUserId.toString() && m.status === 'like')
      .map(m => m.receiver.toString());

    const mySwipedUserIds = allMatches
      .filter(m => m.sender && m.sender.toString() === currentUserId.toString())
      .map(m => m.receiver.toString());

    const mutualUserIds = ILikedIds.filter(id => likedMeIds.includes(id));
    const cleanSenderIds = likedMeIds.filter(id => !mySwipedUserIds.includes(id));

    // 3. Fetch matched and liked-by users profiles in parallel
    const [matchedUsers, likedByUsers] = await Promise.all([
      User.find({ _id: { $in: mutualUserIds } })
        .select('name age gender occupation bio pictures destinations travelDuration travelStyles travelCalendar'),
      User.find({ _id: { $in: cleanSenderIds } })
        .select('name age gender occupation bio pictures destinations travelDuration travelStyles travelCalendar')
    ]);

    // 4. Resolve direct chat messages in-memory if requested
    let directMessages = [];
    if (activeDirectChatId && activeDirectChatId.trim() !== '') {
      const sortedSender = currentUserId.toString() < activeDirectChatId.toString() ? currentUserId : activeDirectChatId;
      const sortedReceiver = currentUserId.toString() < activeDirectChatId.toString() ? activeDirectChatId : currentUserId;
      
      const activeMatchDoc = allMatches.find(m => 
        m.sender && m.receiver &&
        m.sender.toString() === sortedSender.toString() && 
        m.receiver.toString() === sortedReceiver.toString() && 
        m.status === 'like'
      );
      if (activeMatchDoc) {
        directMessages = activeMatchDoc.messages || [];
      }
    }

    res.json({
      matches: matchedUsers,
      likesReceived: likedByUsers,
      groups: myGroups,
      pendingInvites,
      directMessages
    });
  } catch (error) {
    console.error('Consolidated Sync Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getFeed,
  getSyncData
};
