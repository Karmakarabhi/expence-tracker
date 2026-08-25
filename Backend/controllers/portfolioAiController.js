/**
 * portfolioAiController.js
 *
 * Pipeline per endpoint:
 *   DB → portfolioMetricsService (math) → rulesEngine (findings) → aiService (explanations)
 *
 * The controller assembles the curated portfolioContext sent to the AI.
 * Raw DB documents are never passed to the LLM.
 */

const Portfolio      = require('../models/Portfolio');
const Holding        = require('../models/Holding');
const Transaction    = require('../models/Transaction');
const InvestmentGoal = require('../models/InvestmentGoal');

const { buildPortfolioMetrics }        = require('../services/portfolioMetricsService');
const { runRules }                     = require('../services/rulesEngine');
const { generateFindingExplanations, explainHolding, analyzeWhatIf } = require('../services/aiService');

// ── Build curated portfolioContext for LLM ────────────────────────────────────
// NEVER send raw DB documents. Send only what the AI needs.
function buildPortfolioContext(portfolio, metrics) {
  return {
    portfolio: {
      name:        portfolio.name,
      memberName:  portfolio.memberName,
      riskProfile: portfolio.riskProfile ?? 'Moderate',
      currency:    portfolio.currency ?? 'INR',
      targetAllocation: {
        equityPct: portfolio.targetEquityPct ?? 60,
        debtPct:   portfolio.targetDebtPct   ?? 30,
        goldPct:   portfolio.targetGoldPct   ?? 10,
      },
    },
    performance: {
      invested:         metrics.summary.totalInvested,
      currentValue:     metrics.summary.currentValue,
      absoluteGainRs:   metrics.summary.absoluteGain,
      absoluteReturnPct: metrics.summary.gainPercent,
    },
    allocation: metrics.assetAllocation,
    rebalancing: metrics.rebalancing,
    concentration: metrics.holdingWeights.slice(0, 5).map(h => ({
      name:     h.name,
      weightPct: h.weight,
      category: h.category,
    })),
    goalProgress: metrics.goalProgress,
    upcomingMaturities: metrics.upcomingMaturities,
  };
}

// ── Portfolio Review ─────────────────────────────────────────────────────────
exports.portfolioReview = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Portfolio not found or unauthorized' });
    }

    const [holdings, transactions, goals] = await Promise.all([
      Holding.find({ portfolioId: portfolio._id }),
      Transaction.find({ portfolioId: portfolio._id }),
      InvestmentGoal.find({ portfolioId: portfolio._id }),
    ]);

    if (holdings.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No holdings found. Add some investments before requesting a portfolio review.',
      });
    }

    // Step 1: Pure math
    const metrics = buildPortfolioMetrics(portfolio, holdings, transactions, goals);

    // Step 2: Deterministic findings (rules engine — no AI)
    const { findings, healthMatrix } = runRules(metrics);

    // Step 3: Curated LLM context (never raw DB docs)
    const portfolioContext = buildPortfolioContext(portfolio, metrics);

    // Step 4: AI explains findings (AI does NOT decide what is a problem)
    const aiOutput = await generateFindingExplanations(findings, portfolioContext);

    // Step 5: Merge findings with explanations
    const enrichedFindings = findings.map(f => ({
      ...f,
      explanation: aiOutput.explanations[f.type] ?? '',
    }));

    res.status(200).json({
      success: true,
      data: {
        portfolioSummary: aiOutput.portfolioSummary,
        healthMatrix,
        findings: enrichedFindings,
        metrics: {
          summary:     metrics.summary,
          rebalancing: metrics.rebalancing,
          assetAllocation: metrics.assetAllocation,
          capAllocation:   metrics.capAllocation,
        },
      },
    });
  } catch (error) {
    console.error('Portfolio Review Error:', error.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Portfolio review failed. Please try again.',
    });
  }
};

// ── Holding Explainer ────────────────────────────────────────────────────────
exports.holdingExplainer = async (req, res) => {
  try {
    const holding = await Holding.findById(req.params.holdingId);
    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    const portfolio = await Portfolio.findById(holding.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const allHoldings  = await Holding.find({ portfolioId: holding.portfolioId });
    const totalValue   = allHoldings.reduce((sum, h) => sum + h.currentNav * h.units, 0);
    const holdingValue = holding.currentNav * holding.units;
    const weight = totalValue > 0 ? parseFloat(((holdingValue / totalValue) * 100).toFixed(1)) : 0;

    // Curated holding data — no extra fields
    const holdingData = {
      name:     holding.name,
      type:     holding.type,
      category: holding.category,
      capType:  holding.capType,
      weightPct: weight,
      investedRs: Math.round(holding.avgCost * holding.units),
      currentRs:  Math.round(holdingValue),
      gainPct: holding.avgCost > 0
        ? parseFloat((((holding.currentNav - holding.avgCost) / holding.avgCost) * 100).toFixed(1))
        : 0,
    };

    const portfolioSummary = {
      name:        portfolio.name,
      totalValueRs: Math.round(totalValue),
      riskProfile: portfolio.riskProfile,
      currency:    portfolio.currency,
    };

    const explanation = await explainHolding(holdingData, portfolioSummary);

    res.status(200).json({ success: true, data: { holdingData, explanation } });
  } catch (error) {
    console.error('Holding Explainer Error:', error.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Explanation failed. Please try again.',
    });
  }
};

// ── What-If Analysis ──────────────────────────────────────────────────────────
exports.whatIf = async (req, res) => {
  try {
    const { scenario } = req.body;

    if (!scenario || typeof scenario !== 'string' || scenario.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please describe a scenario (e.g. "increase my SIP from ₹20,000 to ₹30,000")',
      });
    }

    const portfolio = await Portfolio.findById(req.params.portfolioId);
    if (!portfolio || portfolio.userId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Portfolio not found or unauthorized' });
    }

    const [holdings, transactions, goals] = await Promise.all([
      Holding.find({ portfolioId: portfolio._id }),
      Transaction.find({ portfolioId: portfolio._id }),
      InvestmentGoal.find({ portfolioId: portfolio._id }),
    ]);

    const metrics = buildPortfolioMetrics(portfolio, holdings, transactions, goals);
    const portfolioContext = buildPortfolioContext(portfolio, metrics);

    const analysis = await analyzeWhatIf(portfolioContext, scenario.trim());

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('What-If Error:', error.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'What-if analysis failed. Please try again.',
    });
  }
};
