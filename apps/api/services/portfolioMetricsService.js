/**
 * portfolioMetricsService.js
 *
 * Pure computation — no AI calls here.
 * Aggregates holdings + transactions into a structured facts object
 * that the AI service will reason over.
 */

/**
 * Build a full metrics payload for a given portfolio.
 * @param {Object} portfolio   - Mongoose Portfolio document
 * @param {Array}  holdings    - Array of Holding documents
 * @param {Array}  transactions - Array of Transaction documents
 * @param {Array}  goals       - Array of InvestmentGoal documents
 * @returns {Object} structured metrics
 */
function buildPortfolioMetrics(portfolio, holdings, transactions, goals) {
  // ── Core value calculations ──────────────────────────────────────────────
  let totalInvested = 0;
  let currentValue  = 0;

  for (const h of holdings) {
    totalInvested += h.avgCost    * h.units;
    currentValue  += h.currentNav * h.units;
  }

  const absoluteGain = currentValue - totalInvested;
  const gainPercent  = totalInvested > 0
    ? ((absoluteGain / totalInvested) * 100).toFixed(2)
    : 0;

  // ── Asset allocation by category ─────────────────────────────────────────
  const categoryBuckets = {};
  for (const h of holdings) {
    const cat = h.category || 'Other';
    if (!categoryBuckets[cat]) categoryBuckets[cat] = 0;
    categoryBuckets[cat] += h.currentNav * h.units;
  }

  const assetAllocation = {};
  for (const [cat, val] of Object.entries(categoryBuckets)) {
    assetAllocation[cat] = currentValue > 0
      ? parseFloat(((val / currentValue) * 100).toFixed(1))
      : 0;
  }

  // Map into broad Equity / Debt / Gold / Other for rebalancing comparison
  const equityCategories = ['Equity'];
  const debtCategories   = ['Debt', 'Liquid', 'FD', 'Savings'];
  const goldCategories   = ['Gold'];

  const actualEquityPct = sumPcts(assetAllocation, equityCategories);
  const actualDebtPct   = sumPcts(assetAllocation, debtCategories);
  const actualGoldPct   = sumPcts(assetAllocation, goldCategories);

  // ── Cap-type breakdown ───────────────────────────────────────────────────
  const capBuckets = {};
  for (const h of holdings) {
    if (h.category !== 'Equity') continue; // cap type only relevant for equity
    const cap = h.capType || 'None';
    if (!capBuckets[cap]) capBuckets[cap] = 0;
    capBuckets[cap] += h.currentNav * h.units;
  }

  const equityValue = categoryBuckets['Equity'] || 0;
  const capAllocation = {};
  for (const [cap, val] of Object.entries(capBuckets)) {
    capAllocation[cap] = equityValue > 0
      ? parseFloat(((val / equityValue) * 100).toFixed(1))
      : 0;
  }

  // ── Concentration analysis ───────────────────────────────────────────────
  const holdingWeights = holdings.map(h => ({
    name:     h.name,
    type:     h.type,
    category: h.category,
    value:    h.currentNav * h.units,
    weight:   currentValue > 0
      ? parseFloat(((h.currentNav * h.units / currentValue) * 100).toFixed(1))
      : 0,
    gain: parseFloat((((h.currentNav - h.avgCost) / (h.avgCost || 1)) * 100).toFixed(1)),
  })).sort((a, b) => b.value - a.value);

  const largestHolding = holdingWeights[0] || null;
  const highConcentration = holdingWeights.filter(h => h.weight > 15);

  // ── Recent transactions (last 30 days) ───────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTxs = transactions
    .filter(tx => new Date(tx.date) >= thirtyDaysAgo)
    .map(tx => ({
      type:   tx.type,
      amount: tx.amount,
      date:   tx.date,
    }));

  // ── Upcoming maturities ───────────────────────────────────────────────────
  const upcomingMaturities = holdings
    .filter(h => {
      if (!h.maturityDate) return false;
      const daysLeft = (new Date(h.maturityDate) - new Date()) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft <= 90;
    })
    .map(h => {
      const daysLeft = Math.ceil((new Date(h.maturityDate) - new Date()) / (1000 * 60 * 60 * 24));
      return { name: h.name, daysLeft, value: h.avgCost * h.units };
    });

  // ── Goal progress ─────────────────────────────────────────────────────────
  const goalProgress = goals.map(g => {
    const progressPct = g.targetAmount > 0
      ? parseFloat(((currentValue / g.targetAmount) * 100).toFixed(1))
      : 0;
    const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return {
      name:       g.name,
      target:     g.targetAmount,
      current:    currentValue,
      progressPct,
      daysLeft:   daysLeft > 0 ? daysLeft : 0,
    };
  });

  // ── Rebalancing deltas ────────────────────────────────────────────────────
  const equityDelta  = parseFloat((actualEquityPct - (portfolio.targetEquityPct ?? 60)).toFixed(1));
  const debtDelta    = parseFloat((actualDebtPct   - (portfolio.targetDebtPct   ?? 30)).toFixed(1));
  const goldDelta    = parseFloat((actualGoldPct   - (portfolio.targetGoldPct   ?? 10)).toFixed(1));

  // excessValue > 0  → overweight (should reduce)
  // excessValue < 0  → underweight (should increase)
  const toRupees = (deltaPct) =>
    currentValue > 0 ? Math.round((deltaPct / 100) * currentValue) : 0;

  const rebalancing = {
    equity: {
      actual:      actualEquityPct,
      target:      portfolio.targetEquityPct ?? 60,
      delta:       equityDelta,
      excessValue: toRupees(equityDelta),
    },
    debt: {
      actual:      actualDebtPct,
      target:      portfolio.targetDebtPct ?? 30,
      delta:       debtDelta,
      excessValue: toRupees(debtDelta),
    },
    gold: {
      actual:      actualGoldPct,
      target:      portfolio.targetGoldPct ?? 10,
      delta:       goldDelta,
      excessValue: toRupees(goldDelta),
    },
  };

  return {
    portfolio: {
      name:        portfolio.name,
      memberName:  portfolio.memberName,
      riskProfile: portfolio.riskProfile ?? 'Moderate',
      currency:    portfolio.currency ?? 'INR',
    },
    summary: {
      totalInvested:  Math.round(totalInvested),
      currentValue:   Math.round(currentValue),
      absoluteGain:   Math.round(absoluteGain),
      gainPercent:    parseFloat(gainPercent),
      holdingCount:   holdings.length,
    },
    assetAllocation,
    rebalancing,
    capAllocation,
    largestHolding,
    highConcentration,
    holdingWeights: holdingWeights.slice(0, 10), // top 10 by value
    recentTxs,
    upcomingMaturities,
    goalProgress,
  };
}

function sumPcts(allocationMap, categories) {
  return parseFloat(
    categories
      .reduce((sum, cat) => sum + (allocationMap[cat] || 0), 0)
      .toFixed(1)
  );
}

module.exports = { buildPortfolioMetrics };
