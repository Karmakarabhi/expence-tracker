const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Item name cannot be more than 200 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'pieces',
      enum: [
        'pieces',
        'kg',
        'bags',
        'sqft',
        'sqm',
        'cft',
        'rft',
        'liters',
        'tons',
        'trips',
        'days',
        'hours',
        'boxes',
        'bundles',
        'rolls',
        'sheets',
        'sets',
        'units',
        'other',
      ],
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    supplierName: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'cheque', 'credit', 'other'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'paid',
    },
    locationUsed: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    receiptUrl: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: calculate total if not set
expenseSchema.pre('save', function (next) {
  if (this.quantity && this.rate) {
    this.totalAmount = this.quantity * this.rate;
  }
  next();
});

// Pre-update: recalculate total
expenseSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.quantity !== undefined && update.rate !== undefined) {
    update.totalAmount = update.quantity * update.rate;
  } else if (update.quantity !== undefined || update.rate !== undefined) {
    // Will be handled in controller with full doc
  }
  next();
});

// Indexes for common queries
expenseSchema.index({ projectId: 1, date: -1 });
expenseSchema.index({ projectId: 1, categoryId: 1 });
expenseSchema.index({ createdBy: 1, date: -1 });
expenseSchema.index({ supplierName: 1 });
expenseSchema.index({ paymentStatus: 1 });
expenseSchema.index({ itemName: 'text', supplierName: 'text', notes: 'text', purpose: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
