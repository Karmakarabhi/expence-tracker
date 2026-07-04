const mongoose = require('mongoose');

const supplierSettlementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      index: true,
    },
    settledAmount: {
      type: Number,
      required: [true, 'Settlement amount is required'],
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'cheque', 'bank', 'upi', 'other'],
      default: 'bank',
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    linkedExpenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups
supplierSettlementSchema.index({ userId: 1, supplierName: 1, paymentDate: -1 });

module.exports = mongoose.model('SupplierSettlement', supplierSettlementSchema);
