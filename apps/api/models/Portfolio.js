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
    // Target allocation (for AI rebalancing advice)
    riskProfile: {
      type: String,
      enum: ['Conservative', 'Moderate', 'Aggressive'],
      default: 'Moderate',
    },
    targetEquityPct: { type: Number, default: 60 },
    targetDebtPct:   { type: Number, default: 30 },
    targetGoldPct:   { type: Number, default: 10 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);