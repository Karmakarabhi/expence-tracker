const express = require('express');
const {
  createPortfolio,
  getPortfolios,
  updatePortfolio,
  deletePortfolio,
  setDefault,
  getAnalytics,
  refreshPrices
} = require('../controllers/portfolioController');
const { addPortfolioPdf, addPortfolioExcel } = require('../controllers/reportController');
const { protect } = require('../middleware/auth'); // Check later if this path matches

const router = express.Router();

router.route('/')
  .post(protect, createPortfolio)
  .get(protect, getPortfolios);

router.route('/:id/analytics')
  .get(protect, getAnalytics);

router.post('/:id/refresh-prices', protect, refreshPrices);

router.route('/:id')
  .put(protect, updatePortfolio)
  .delete(protect, deletePortfolio);

router.patch('/:id/set-default', protect, setDefault);

router.get('/:id/report/pdf', protect, addPortfolioPdf);
router.get('/:id/report/excel', protect, addPortfolioExcel);

module.exports = router;