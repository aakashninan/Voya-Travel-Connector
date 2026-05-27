const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
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

const matchSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  },
  messages: {
    type: [directMessageSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to speed up check and prevent duplicate entries
matchSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Index to speed up "Who Liked You" lookups
matchSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
