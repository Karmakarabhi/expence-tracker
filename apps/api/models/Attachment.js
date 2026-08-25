const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    relatedModel: {
      type: String,
      enum: ['Expense', 'Transaction'],
      required: [true, 'Related model is required'],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Related ID is required'],
      index: true,
    },
    category: {
      type: String,
      enum: ['purchase_invoice', 'deposit_slip', 'other'],
      required: [true, 'Attachment category is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    sizeBytes: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups by related record
attachmentSchema.index({ relatedModel: 1, relatedId: 1, isDeleted: 1 });
// Index for finding active attachments by category
attachmentSchema.index({ relatedModel: 1, relatedId: 1, category: 1, isDeleted: 1 });

// Soft delete support: query should filter isDeleted: false
attachmentSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Attachment', attachmentSchema);
