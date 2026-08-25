const express = require('express');
const { portfolioReview, holdingExplainer, whatIf } = require('../controllers/portfolioAiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Full AI portfolio review
router.post('/portfolio-review/:portfolioId', protect, portfolioReview);

// Explain a specific holding
router.post('/explain-holding/:holdingId', protect, holdingExplainer);

// What-if scenario analysis
router.post('/what-if/:portfolioId', protect, whatIf);

module.exports = router;
