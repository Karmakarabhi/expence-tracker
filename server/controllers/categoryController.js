const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Default construction categories
const DEFAULT_CATEGORIES = [
  { name: 'Materials', icon: '🧱', description: 'Raw construction materials like bricks, sand, cement, steel' },
  { name: 'Labour', icon: '👷', description: 'Worker wages, mason, helper costs' },
  { name: 'Finishing', icon: '✨', description: 'Finishing work like flooring, tiles, polish' },
  { name: 'Electrical', icon: '⚡', description: 'Wiring, switches, panels, fixtures' },
  { name: 'Plumbing', icon: '🔧', description: 'Pipes, fittings, taps, sanitary' },
  { name: 'Painting', icon: '🎨', description: 'Paint, primer, putty, painter cost' },
  { name: 'Carpentry', icon: '🪚', description: 'Doors, windows, cabinets, wood work' },
  { name: 'Transportation', icon: '🚛', description: 'Material delivery, vehicle charges' },
  { name: 'Miscellaneous', icon: '📋', description: 'Other expenses not covered above' },
];

// @desc    Get all categories (with subcategories tree)
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      createdBy: req.user.id,
      parentCategory: null,
    })
      .populate({
        path: 'subcategories',
        populate: { path: 'subcategories' },
      })
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories flat (for dropdowns)
// @route   GET /api/categories/flat
exports.getCategoriesFlat = async (req, res, next) => {
  try {
    const categories = await Category.find({ createdBy: req.user.id }).sort({
      name: 1,
    });

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    req.body.createdBy = req.user.id;
    const category = await Category.create(req.body);

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete subcategories
    await Category.deleteMany({ parentCategory: category._id });

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed default categories for a user
// @route   POST /api/categories/seed
exports.seedCategories = async (req, res, next) => {
  try {
    // Check if user already has categories
    const existing = await Category.countDocuments({ createdBy: req.user.id });
    if (existing > 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories already exist. Delete all to re-seed.',
      });
    }

    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdBy: req.user.id,
    }));

    const created = await Category.insertMany(categories);

    res.status(201).json({
      success: true,
      count: created.length,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};
