const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    memberName: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    relation: {
      type: String,
      enum: ['Self', 'Father', 'Mother', 'Spouse', 'Child', 'Other'],
      default: 'Self',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);