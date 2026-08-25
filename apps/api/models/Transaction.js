const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    holdingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Holding',
      required: [true, 'Holding is required'],
    },
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: [true, 'Portfolio is required'],
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL', 'SIP', 'DIVIDEND', 'INTEREST', 'SWITCH_IN', 'SWITCH_OUT'],
      required: [true, 'Transaction type is required'],
    },
    units: {
      type: Number,
      required: [true, 'Units are required'],
    },
    nav: {
      type: Number,
      required: [true, 'NAV is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InvestmentTransaction', transactionSchema);