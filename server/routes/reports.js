const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCategoryReport,
  getSupplierReport,
  getBudgetReport,
  getPaymentStatusReport,
} = require('../controllers/reportController');

router.use(protect);

router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/category', getCategoryReport);
router.get('/supplier', getSupplierReport);
router.get('/budget', getBudgetReport);
router.get('/payment-status', getPaymentStatusReport);

module.exports = router;
