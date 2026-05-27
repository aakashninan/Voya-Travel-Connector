const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  destination: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invites: [inviteSchema],
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to speed up membership queries
groupSchema.index({ members: 1 });

// Index to speed up pending invitation queries
groupSchema.index({ 'invites.user': 1, 'invites.status': 1 });

module.exports = mongoose.model('Group', groupSchema);
