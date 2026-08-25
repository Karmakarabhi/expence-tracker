const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getCategories,
  getCategoriesFlat,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} = require('../controllers/categoryController');

router.use(protect);

router
  .route('/')
  .get(getCategories)
  .post(
    [body('name').notEmpty().withMessage('Category name is required')],
    createCategory
  );

router.get('/flat', getCategoriesFlat);
router.post('/seed', seedCategories);

router
  .route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
