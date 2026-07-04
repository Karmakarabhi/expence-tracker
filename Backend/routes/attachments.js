const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment,
} = require('../controllers/attachmentController');

// All routes require authentication
router.use(protect);

// POST: Upload attachment
router.post('/', upload.single('file'), uploadAttachment);

// GET: List attachments for a related record
router.get('/:relatedModel/:relatedId', getAttachments);

// GET: Download attachment
router.get('/:id/download', downloadAttachment);

// DELETE: Delete attachment (soft delete)
router.delete('/:id', deleteAttachment);

module.exports = router;
