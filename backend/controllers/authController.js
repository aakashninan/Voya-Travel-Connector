const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Match = require('../models/Match');
const Group = require('../models/Group');

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretwandersynckey123!', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password, name, age, gender } = req.body;

  if (!email || !password || !name || !age || !gender) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email,
      password,
      name,
      age,
      gender
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        hasProfile: user.pictures.length > 0 || user.bio !== '',
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account and cascade delete related matches/groups
// @route   DELETE /api/auth/delete
// @access  Private
const deleteAccount = async (req, res) => {
  const userId = req.user._id;

  try {
    // 1. Delete user matches (both as sender and receiver)
    await Match.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // 2. Remove user from all groups they are members of
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // 3. Remove user invites from all groups
    await Group.updateMany(
      { 'invites.user': userId },
      { $pull: { invites: { user: userId } } }
    );

    // 4. Delete groups created by this user
    await Group.deleteMany({ creator: userId });

    // 5. Delete the User record
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated matches and groups deleted successfully.' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  deleteAccount
};
