const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const InvestmentTransaction = require('../models/Transaction');
const { xirr } = require('../utils/xirrCalculator');
const { refreshCache } = require('./priceCacheController');

exports.createPortfolio = async (req, res) => {
  try {
    const { name, currency, color, isDefault } = req.body;

    // If this is set as default, unset others for this user
    if (isDefault) {
      await Portfolio.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const portfolio = await Portfolio.create({
      userId: req.user.id,
      name,
      currency: currency || 'INR',
      color: color || '#6366f1',
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updatePortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // If making this one default, update others
    if (req.body.isDefault) {
      await Portfolio.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    portfolio = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    if (portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await portfolio.deleteOne();
    // In a real app we would want to cascade delete holdings and transactions too

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.setDefault = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Portfolio not found or unauthorized' });
    }

    await Portfolio.updateMany({ userId: req.user.id }, { isDefault: false });
    portfolio.isDefault = true;
    await portfolio.save();

    res.status(200).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
    }

    const holdings = await Holding.find({ portfolioId: portfolio._id });
    const transactions = await InvestmentTransaction.find({ portfolioId: portfolio._id });

    let totalInvested = 0;
    let currentValue = 0;

    // Calculate invested and current from holdings
    for (const h of holdings) {
      totalInvested += (h.avgCost * h.units);
      currentValue += (h.currentNav * h.units);
    }

    // Build cashflows for XIRR
    // Outflows (Buy/SIP) = negative
    // Inflows (Sell/Dividend) = positive
    const cashflows = transactions.map(tx => {
      let amt = tx.amount;
      if (['BUY', 'SIP', 'SWITCH_IN'].includes(tx.type)) {
        amt = -amt;
      } else if (['SELL', 'SWITCH_OUT', 'DIVIDEND', 'INTEREST'].includes(tx.type)) {
        amt = amt;
      }
      return { amount: amt, date: tx.date };
    });

    // Throw current portfolio value at today's date as a final massive inflow for XIRR
    if (currentValue > 0) {
      cashflows.push({ amount: currentValue, date: new Date() });
    }

    const xirrValue = cashflows.length > 1 ? xirr(cashflows) * 100 : 0; // %

    const absoluteGain = currentValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalInvested,
        currentValue,
        absoluteGain,
        gainPercent,
        xirr: xirrValue,
        holdings
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.refreshPrices = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const codes = await Holding.distinct('amfiCode', { portfolioId: portfolio._id, amfiCode: { $exists: true, $ne: null } });
    if(codes.length > 0) {
       await refreshCache(codes);
    }
    
    res.status(200).json({ success: true, message: 'Prices refreshed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
