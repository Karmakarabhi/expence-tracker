const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');

exports.addHolding = async (req, res) => {
  try {
    const { portfolioId } = req.body;
    
    // Validate portfolio belongs to user
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
    }

    const holding = await Holding.create(req.body);
    res.status(201).json({ success: true, data: holding });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getHoldings = async (req, res) => {
  try {
    const { portfolioId } = req.params;

    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized or invalid portfolio' });
    }

    const holdings = await Holding.find({ portfolioId });
    res.status(200).json({ success: true, count: holdings.length, data: holdings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateHolding = async (req, res) => {
  try {
    let holding = await Holding.findById(req.params.id);

    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    // Verify ownership
    const portfolio = await Portfolio.findById(holding.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    holding = await Holding.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: holding });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteHolding = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.id);

    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    // Verify ownership
    const portfolio = await Portfolio.findById(holding.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await holding.deleteOne();
    // Would need to delete transactions belonging to this holding as well later

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};