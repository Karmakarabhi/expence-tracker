const express = require('express');
const { fetchSchemeList } = require('../utils/mfApiFetcher');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    const data = await fetchSchemeList(q);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
