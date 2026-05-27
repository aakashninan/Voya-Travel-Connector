const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const promptSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const voicePromptSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  audio: { type: String, default: '' } // Base64 audio representation or mock audio URL
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'other'],
    required: true
  },
  occupation: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  nativity: {
    type: String,
    default: ''
  },
  pictures: {
    type: [String],
    default: []
  },
  prompts: {
    type: [promptSchema],
    default: [],
    validate: [val => val.length <= 3, 'Maximum of 3 prompts allowed']
  },
  voicePrompt: {
    type: voicePromptSchema,
    default: () => ({})
  },
  // Travel Preferences
  destinations: {
    type: [String],
    default: []
  },
  travelDuration: {
    type: String,
    default: '' // e.g. "1-2 weeks", "1 month+", etc.
  },
  travelStyles: {
    type: [String],
    default: [] // e.g. ["Backpacking", "Luxury", "Adventure"]
  },
  travelCalendar: {
    type: String,
    default: '' // e.g. "Summer 2026", "June-July"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes to speed up explore feed query lookups
userSchema.index({ gender: 1 });
userSchema.index({ nativity: 1 });
userSchema.index({ location: 1 });

module.exports = mongoose.model('User', userSchema);
