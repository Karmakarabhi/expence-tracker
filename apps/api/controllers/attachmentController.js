const Attachment = require('../models/Attachment');
const Expense = require('../models/Expense');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// @desc    Upload attachment
// @route   POST /api/attachments
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { relatedModel, relatedId, category } = req.body;

    // Validation
    if (!relatedModel || !relatedId || !category) {
      // Delete uploaded file if validation fails
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'relatedModel, relatedId, and category are required',
      });
    }

    // Validate relatedModel enum
    if (!['Expense', 'Transaction'].includes(relatedModel)) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'relatedModel must be Expense or Transaction',
      });
    }

    // Validate category enum
    if (!['purchase_invoice', 'deposit_slip', 'other'].includes(category)) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'category must be purchase_invoice, deposit_slip, or other',
      });
    }

    // Verify related record exists and belongs to user
    let relatedRecord;
    if (relatedModel === 'Expense') {
      relatedRecord = await Expense.findOne({
        _id: new mongoose.Types.ObjectId(relatedId),
        createdBy: req.user.id,
      });
    } else if (relatedModel === 'Transaction') {
      // Future: add Transaction model check
      // For now, just validate the ObjectId format
      if (!mongoose.Types.ObjectId.isValid(relatedId)) {
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(400).json({ success: false, message: 'Invalid related ID format' });
      }
      relatedRecord = { _id: relatedId }; // Placeholder for now
    }

    if (!relatedRecord) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({
        success: false,
        message: `${relatedModel} not found or access denied`,
      });
    }

    // Create attachment record
    const attachment = await Attachment.create({
      relatedModel,
      relatedId: new mongoose.Types.ObjectId(relatedId),
      category,
      originalName: req.file.originalname,
      storagePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// @desc    Get attachments for a related record
// @route   GET /api/attachments/:relatedModel/:relatedId
exports.getAttachments = async (req, res, next) => {
  try {
    const { relatedModel, relatedId } = req.params;

    // Validate relatedModel
    if (!['Expense', 'Transaction'].includes(relatedModel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid relatedModel',
      });
    }

    // Verify ownership
    if (relatedModel === 'Expense') {
      const expense = await Expense.findOne({
        _id: new mongoose.Types.ObjectId(relatedId),
        createdBy: req.user.id,
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or access denied',
        });
      }
    }

    // Fetch active attachments
    const attachments = await Attachment.find({
      relatedModel,
      relatedId: new mongoose.Types.ObjectId(relatedId),
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attachments.length,
      data: attachments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download attachment
// @route   GET /api/attachments/:id/download
exports.downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate('uploadedBy', 'email');

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found',
      });
    }

    // Verify ownership
    if (attachment.relatedModel === 'Expense') {
      const expense = await Expense.findOne({
        _id: attachment.relatedId,
        createdBy: req.user.id,
      });

      if (!expense) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // Build file path
    const filePath = path.join(__dirname, '..', attachment.storagePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk',
      });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimeType);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      res.status(500).json({
        success: false,
        message: 'Error streaming file',
      });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attachment (soft delete)
// @route   DELETE /api/attachments/:id
exports.deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found',
      });
    }

    // Verify ownership
    if (attachment.relatedModel === 'Expense') {
      const expense = await Expense.findOne({
        _id: attachment.relatedId,
        createdBy: req.user.id,
      });

      if (!expense) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // Soft delete
    attachment.isDeleted = true;
    await attachment.save();

    // Optionally delete from disk (keeping for audit, but can comment out for forensics)
    const filePath = path.join(__dirname, '..', attachment.storagePath);
    if (fs.existsSync(filePath)) {
      // For now, keep on disk for audit trail. Uncomment to delete:
      // fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: 'Attachment deleted',
      data: attachment,
    });
  } catch (error) {
    next(error);
  }
};
