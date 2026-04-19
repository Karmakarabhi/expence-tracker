const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// @desc    Get all expenses (with filtering, search, pagination)
// @route   GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      projectId,
      categoryId,
      subcategory,
      supplierName,
      paymentStatus,
      paymentMethod,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter = { createdBy: req.user.id };

    if (projectId) filter.projectId = projectId;
    if (categoryId) filter.categoryId = categoryId;
    if (subcategory) filter.subcategory = { $regex: subcategory, $options: 'i' };
    if (supplierName) filter.supplierName = { $regex: supplierName, $options: 'i' };
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    if (amountMin || amountMax) {
      filter.totalAmount = {};
      if (amountMin) filter.totalAmount.$gte = Number(amountMin);
      if (amountMax) filter.totalAmount.$lte = Number(amountMax);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('categoryId', 'name icon')
        .populate('projectId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    })
      .populate('categoryId', 'name icon')
      .populate('projectId', 'name');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
exports.createExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    req.body.createdBy = req.user.id;

    // Calculate total
    if (req.body.quantity && req.body.rate) {
      req.body.totalAmount = Number(req.body.quantity) * Number(req.body.rate);
    }

    // Handle file upload
    if (req.file) {
      req.body.receiptUrl = `/uploads/${req.file.filename}`;
    }

    // Handle tags
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((t) => t.trim());
    }

    const expense = await Expense.create(req.body);

    const populated = await Expense.findById(expense._id)
      .populate('categoryId', 'name icon')
      .populate('projectId', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Recalculate total
    const qty = req.body.quantity !== undefined ? Number(req.body.quantity) : expense.quantity;
    const rate = req.body.rate !== undefined ? Number(req.body.rate) : expense.rate;
    req.body.totalAmount = qty * rate;

    // Handle file upload
    if (req.file) {
      // Delete old file if exists
      if (expense.receiptUrl) {
        const oldPath = path.join(__dirname, '..', expense.receiptUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      req.body.receiptUrl = `/uploads/${req.file.filename}`;
    }

    // Handle tags
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((t) => t.trim());
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('categoryId', 'name icon')
      .populate('projectId', 'name');

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Delete uploaded file if exists
    if (expense.receiptUrl) {
      const filePath = path.join(__dirname, '..', expense.receiptUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise totals
// @route   GET /api/expenses/summary/category
exports.getCategoryTotals = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const totals = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          totalAmount: 1,
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json({ success: true, data: totals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly totals
// @route   GET /api/expenses/summary/monthly
exports.getMonthlyTotals = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const totals = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({ success: true, data: totals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   GET /api/expenses/summary/dashboard
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [
      totalResult,
      todayResult,
      weekResult,
      monthResult,
      pendingResult,
      categoryTotals,
      recentExpenses,
      monthlyTrend,
    ] = await Promise.all([
      // Total spending
      Expense.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      // Today's spending
      Expense.aggregate([
        { $match: { ...match, date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      // This week's spending
      Expense.aggregate([
        { $match: { ...match, date: { $gte: startOfWeek, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      // This month's spending
      Expense.aggregate([
        { $match: { ...match, date: { $gte: startOfMonth, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      // Pending payments
      Expense.aggregate([
        { $match: { ...match, paymentStatus: 'pending' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      // Category-wise totals
      Expense.aggregate([
        { $match: match },
        { $group: { _id: '$categoryId', total: { $sum: '$totalAmount' } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            name: '$category.name',
            icon: '$category.icon',
            total: 1,
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      // Recent expenses
      Expense.find(match)
        .populate('categoryId', 'name icon')
        .populate('projectId', 'name')
        .sort({ date: -1 })
        .limit(10),
      // Monthly trend (last 12 months)
      Expense.aggregate([
        { $match: match },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSpent: totalResult[0]?.total || 0,
        totalExpenses: totalResult[0]?.count || 0,
        todaySpent: todayResult[0]?.total || 0,
        todayCount: todayResult[0]?.count || 0,
        weekSpent: weekResult[0]?.total || 0,
        monthSpent: monthResult[0]?.total || 0,
        pendingAmount: pendingResult[0]?.total || 0,
        pendingCount: pendingResult[0]?.count || 0,
        categoryTotals,
        recentExpenses,
        monthlyTrend: monthlyTrend.map((m) => ({
          year: m._id.year,
          month: m._id.month,
          total: m.total,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
