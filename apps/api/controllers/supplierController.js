const Expense = require('../models/Expense');
const Supplier = require('../models/Supplier');
const SupplierSettlement = require('../models/SupplierSettlement');
const mongoose = require('mongoose');

// @desc    Get supplier spending summary (total, paid, balance)
// @route   GET /api/suppliers/summary
exports.getSupplierSummary = async (req, res, next) => {
  try {
    const { supplierName } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all expenses for this supplier
    const expenseMatch = { createdBy: userId, supplierName: { $exists: true, $ne: '' } };
    if (supplierName) {
      expenseMatch.supplierName = { $regex: supplierName, $options: 'i' };
    }

    const expenses = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: '$supplierName',
          totalSpent: { $sum: '$totalAmount' },
          expenseCount: { $sum: 1 },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] },
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0] },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    // Get settlements for each supplier
    const settlements = await SupplierSettlement.find({
      userId,
    }).select('supplierName settledAmount paymentDate');

    // Merge settlements with expenses
    const supplierData = expenses.map((supplier) => {
      const supplierSettlements = settlements.filter(
        (s) => s.supplierName.toLowerCase() === supplier._id.toLowerCase()
      );
      const totalSettled = supplierSettlements.reduce((sum, s) => sum + s.settledAmount, 0);
      const balance = supplier.totalSpent - totalSettled;

      return {
        supplierName: supplier._id,
        totalSpent: supplier.totalSpent,
        expenseCount: supplier.expenseCount,
        paidAmount: supplier.paidAmount,
        pendingAmount: supplier.pendingAmount,
        totalSettled,
        balance,
        recentSettlement: supplierSettlements[0]?.paymentDate || null,
      };
    });

    res.status(200).json({
      success: true,
      count: supplierData.length,
      data: supplierData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get supplier details with full ledger
// @route   GET /api/suppliers/ledger/:supplierName
exports.getSupplierLedger = async (req, res, next) => {
  try {
    const { supplierName } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all expenses for this supplier
    const expenses = await Expense.find({
      createdBy: userId,
      supplierName: { $regex: `^${supplierName}$`, $options: 'i' },
    })
      .select('itemName totalAmount date paymentStatus paymentMethod')
      .sort({ date: -1 });

    // Get all settlements for this supplier
    const settlements = await SupplierSettlement.find({
      userId,
      supplierName: { $regex: `^${supplierName}$`, $options: 'i' },
    })
      .select('settledAmount paymentDate paymentMethod referenceNumber notes')
      .sort({ paymentDate: -1 });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
    const totalSettled = settlements.reduce((sum, s) => sum + s.settledAmount, 0);
    const balance = totalExpenses - totalSettled;

    res.status(200).json({
      success: true,
      data: {
        supplierName,
        expenses,
        settlements,
        summary: {
          totalExpenses,
          totalSettled,
          balance,
          expenseCount: expenses.length,
          settlementCount: settlements.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record settlement payment to supplier
// @route   POST /api/suppliers/settle
exports.recordSettlement = async (req, res, next) => {
  try {
    const { supplierName, settledAmount, paymentDate, paymentMethod, referenceNumber, notes, linkedExpenses } = req.body;

    // Validate
    if (!supplierName || !settledAmount) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name and settlement amount are required',
      });
    }

    // Create settlement record
    const settlement = await SupplierSettlement.create({
      userId: req.user.id,
      supplierName,
      settledAmount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || 'bank',
      referenceNumber,
      notes,
      linkedExpenses: linkedExpenses || [],
    });

    res.status(201).json({
      success: true,
      data: settlement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all suppliers for a user (with totals)
// @route   GET /api/suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get distinct supplier names from expenses
    const supplierNames = await Expense.find({
      createdBy: userId,
      supplierName: { $exists: true, $ne: '' },
    })
      .distinct('supplierName');

    // Get summary for each supplier
    const suppliers = await Promise.all(
      supplierNames.map(async (name) => {
        const expenses = await Expense.aggregate([
          { $match: { createdBy: userId, supplierName: name } },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$totalAmount' },
              count: { $sum: 1 },
            },
          },
        ]);

        const settlements = await SupplierSettlement.aggregate([
          { $match: { userId, supplierName: name } },
          {
            $group: {
              _id: null,
              totalSettled: { $sum: '$settledAmount' },
            },
          },
        ]);

        const totalSpent = expenses[0]?.totalSpent || 0;
        const totalSettled = settlements[0]?.totalSettled || 0;

        return {
          supplierName: name,
          totalSpent,
          totalSettled,
          balance: totalSpent - totalSettled,
          expenseCount: expenses[0]?.count || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers.sort((a, b) => b.totalSpent - a.totalSpent),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settlement history for a supplier
// @route   GET /api/suppliers/:supplierName/settlements
exports.getSupplierSettlements = async (req, res, next) => {
  try {
    const { supplierName } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const settlements = await SupplierSettlement.find({
      userId,
      supplierName: { $regex: `^${supplierName}$`, $options: 'i' },
    })
      .populate('linkedExpenses', 'itemName totalAmount date')
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: settlements.length,
      data: settlements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete settlement
// @route   DELETE /api/suppliers/settlements/:settlementId
exports.deleteSettlement = async (req, res, next) => {
  try {
    const settlement = await SupplierSettlement.findOne({
      _id: req.params.settlementId,
      userId: req.user.id,
    });

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found',
      });
    }

    await SupplierSettlement.deleteOne({ _id: req.params.settlementId });

    res.status(200).json({
      success: true,
      message: 'Settlement deleted',
    });
  } catch (error) {
    next(error);
  }
};
