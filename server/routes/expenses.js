const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategoryTotals,
  getMonthlyTotals,
  getDashboardSummary,
} = require('../controllers/expenseController');

router.use(protect);

// Summary routes (must be before /:id)
router.get('/summary/category', getCategoryTotals);
router.get('/summary/monthly', getMonthlyTotals);
router.get('/summary/dashboard', getDashboardSummary);

router
  .route('/')
  .get(getExpenses)
  .post(
    upload.single('receipt'),
    [
      body('projectId').notEmpty().withMessage('Project is required'),
      body('categoryId').notEmpty().withMessage('Category is required'),
      body('itemName').notEmpty().withMessage('Item name is required'),
      body('quantity')
        .isNumeric()
        .withMessage('Quantity must be a number'),
      body('rate')
        .isNumeric()
        .withMessage('Rate must be a number'),
      body('date').notEmpty().withMessage('Date is required'),
    ],
    createExpense
  );

router
  .route('/:id')
  .get(getExpense)
  .put(upload.single('receipt'), updateExpense)
  .delete(deleteExpense);

module.exports = router;
