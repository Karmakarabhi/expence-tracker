const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: [true, 'Portfolio is required'],
    },
    type: {
      type: String,
      enum: ['MF', 'ETF', 'FD', 'Stock', 'PPF', 'NPS', 'Savings'],
      required: [true, 'Investment type is required'],
    },
    name: {
      type: String,
      required: [true, 'Holding name is required'],
    },
    amfiCode: {
      type: String, // For MF only
    },
    symbol: {
      type: String, // For ETF/Stock
    },
    units: {
      type: Number,
      default: 0,
    },
    avgCost: {
      type: Number,
      default: 0,
    },
    currentNav: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['Equity', 'Debt', 'Liquid', 'Gold', 'FD', 'Savings', 'Other'],
      default: 'Other',
    },
    capType: {
      type: String,
      enum: ['Large', 'Mid', 'Small', 'Multi', 'None'],
      default: 'None',
    },
    maturityDate: {
      type: Date, // For FD/PPF
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Holding', holdingSchema);