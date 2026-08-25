const InvestmentTransaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const { recalcHolding } = require('../services/ledgerService');

exports.addTransaction = async (req, res) => {
  try {
    const { holdingId, type, units, nav, amount, date, notes } = req.body;

    // Verify holding and portfolio ownership
    const holding = await Holding.findById(holdingId);
    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    const portfolio = await Portfolio.findById(holding.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
    }

    const tx = await InvestmentTransaction.create({
      holdingId,
      portfolioId: holding.portfolioId,
      type,
      units,
      nav,
      amount, // Should be units * nav usually, depending on type
      date,
      notes
    });

    // Fire ledger update
    await recalcHolding(holdingId);

    res.status(201).json({ success: true, data: tx });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { holdingId, portfolioId } = req.query;
    let query = {};

    if (portfolioId) {
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio || portfolio.userId.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
      }
      query.portfolioId = portfolioId;
    }

    if (holdingId) {
      const holding = await Holding.findById(holdingId);
      const portfolio = await Portfolio.findById(holding.portfolioId);
      if (!portfolio || portfolio.userId.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
      }
      query.holdingId = holdingId;
    }

    // Must filter by something owned by user. If neither, return error to avoid grabbing all
    if (!portfolioId && !holdingId) {
      return res.status(400).json({ success: false, error: 'Required portfolioId or holdingId filter' });
    }

    const transactions = await InvestmentTransaction.find(query).sort('-date');
    res.status(200).json({ success: true, count: transactions.length, data: transactions });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await InvestmentTransaction.findById(req.params.id);

    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const portfolio = await Portfolio.findById(tx.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
    }

    await tx.deleteOne();

    // Recompute on delete too - critical for audit integrity
    await recalcHolding(tx.holdingId);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
