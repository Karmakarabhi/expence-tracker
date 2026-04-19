const Expense = require('../models/Expense');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// @desc    Get daily report
// @route   GET /api/reports/daily
exports.getDailyReport = async (req, res, next) => {
  try {
    const { projectId, date } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    match.date = { $gte: targetDate, $lt: nextDay };

    const expenses = await Expense.find(match)
      .populate('categoryId', 'name icon')
      .populate('projectId', 'name')
      .sort({ date: -1 });

    const totalResult = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        totalAmount: totalResult[0]?.total || 0,
        totalEntries: totalResult[0]?.count || 0,
        expenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly report
// @route   GET /api/reports/weekly
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const { projectId, startDate } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    match.date = { $gte: start, $lt: end };

    const dailyBreakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const categoryBreakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: { _id: '$categoryId', total: { $sum: '$totalAmount' }, count: { $sum: 1 } },
      },
      {
        $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' },
      },
      { $unwind: '$category' },
      { $project: { name: '$category.name', icon: '$category.icon', total: 1, count: 1 } },
      { $sort: { total: -1 } },
    ]);

    const totalResult = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalAmount: totalResult[0]?.total || 0,
        totalEntries: totalResult[0]?.count || 0,
        dailyBreakdown,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly report
// @route   GET /api/reports/monthly
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { projectId, year, month } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 1);

    match.date = { $gte: start, $lt: end };

    const dailyBreakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const categoryBreakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: { _id: '$categoryId', total: { $sum: '$totalAmount' }, count: { $sum: 1 } },
      },
      {
        $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' },
      },
      { $unwind: '$category' },
      { $project: { name: '$category.name', icon: '$category.icon', total: 1, count: 1 } },
      { $sort: { total: -1 } },
    ]);

    const supplierBreakdown = await Expense.aggregate([
      { $match: { ...match, supplierName: { $ne: null, $ne: '' } } },
      {
        $group: { _id: '$supplierName', total: { $sum: '$totalAmount' }, count: { $sum: 1 } },
      },
      { $sort: { total: -1 } },
      { $limit: 20 },
    ]);

    const totalResult = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth + 1,
        totalAmount: totalResult[0]?.total || 0,
        totalEntries: totalResult[0]?.count || 0,
        dailyBreakdown,
        categoryBreakdown,
        supplierBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise report
// @route   GET /api/reports/category
exports.getCategoryReport = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const report = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$categoryId',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$totalAmount' },
          minAmount: { $min: '$totalAmount' },
          maxAmount: { $max: '$totalAmount' },
          items: { $addToSet: '$itemName' },
        },
      },
      {
        $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          totalAmount: 1,
          count: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
          minAmount: 1,
          maxAmount: 1,
          uniqueItems: { $size: '$items' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const grandTotal = report.reduce((sum, r) => sum + r.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        grandTotal,
        categories: report.map((r) => ({
          ...r,
          percentage: grandTotal > 0 ? Math.round((r.totalAmount / grandTotal) * 100 * 100) / 100 : 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get supplier-wise report
// @route   GET /api/reports/supplier
exports.getSupplierReport = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const report = await Expense.aggregate([
      { $match: { ...match, supplierName: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$supplierName',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0] },
          },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget vs actual report
// @route   GET /api/reports/budget
exports.getBudgetReport = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const categorySpending = await Expense.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: { _id: '$categoryId', actual: { $sum: '$totalAmount' }, count: { $sum: 1 } },
      },
      {
        $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          actual: 1,
          count: 1,
        },
      },
      { $sort: { actual: -1 } },
    ]);

    // Attach budget per category
    const budgetComparison = categorySpending.map((cat) => {
      const budgeted = project.categoryBudgets?.get(cat._id.toString()) || 0;
      return {
        ...cat,
        budgeted,
        remaining: budgeted - cat.actual,
        overBudget: cat.actual > budgeted && budgeted > 0,
        percentUsed: budgeted > 0 ? Math.round((cat.actual / budgeted) * 100) : null,
      };
    });

    const totalSpent = categorySpending.reduce((sum, c) => sum + c.actual, 0);

    res.status(200).json({
      success: true,
      data: {
        projectName: project.name,
        totalBudget: project.budget,
        totalSpent,
        remaining: project.budget - totalSpent,
        percentUsed: project.budget > 0 ? Math.round((totalSpent / project.budget) * 100) : 0,
        overBudget: totalSpent > project.budget,
        categoryComparison: budgetComparison,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status report
// @route   GET /api/reports/payment-status
exports.getPaymentStatusReport = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const match = { createdBy: new mongoose.Types.ObjectId(req.user.id) };
    if (projectId) match.projectId = new mongoose.Types.ObjectId(projectId);

    const report = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$paymentStatus',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const methodBreakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { status: '$paymentStatus', method: '$paymentMethod' },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusSummary: report,
        methodBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
