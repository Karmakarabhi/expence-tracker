/**
 * rulesEngine.js
 *
 * Deterministic portfolio intelligence layer.
 * Receives pre-computed metrics and produces structured findings.
 *
 * Rules engine NEVER calls AI. It decides:
 *   - what the problem is
 *   - how severe it is
 *   - how confident we are (based on how hard the evidence is)
 *   - what the evidence is (numbers, not words)
 *
 * AI receives these findings and produces only natural-language explanations.
 */

// ── Thresholds ────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  // Allocation deviation from target (percentage points)
  ALLOCATION_WARNING:  5,   // 5pp over/under target → warning
  ALLOCATION_CAUTION: 15,   // 15pp → caution

  // Concentration (single holding % of total portfolio)
  CONCENTRATION_WARNING: 15,  // >15% → warning
  CONCENTRATION_CAUTION: 25,  // >25% → caution

  // Diversification (minimum holding count by type)
  MIN_HOLDINGS_WARNING:  3,   // fewer than 3 holdings → warning
  MIN_ASSET_TYPES:       2,   // fewer than 2 asset categories → warning

  // Goal progress
  GOAL_ON_TRACK_PCT:    80,   // >80% on track
  GOAL_AT_RISK_PCT:     50,   // <50% → caution

  // Maturity alert window (days)
  MATURITY_WINDOW_WARNING: 90,
  MATURITY_WINDOW_CAUTION: 30,
};

/**
 * Run all rules against computed metrics.
 * Returns an array of structured Finding objects.
 *
 * @param {Object} metrics - Output of portfolioMetricsService.buildPortfolioMetrics()
 * @returns {Object} { findings, healthMatrix }
 */
function runRules(metrics) {
  const findings = [];

  // ── 1. Equity allocation ─────────────────────────────────────────────────
  {
    const { actual, target, delta, excessValue } = metrics.rebalancing.equity;
    const absDeviation = Math.abs(delta);

    if (absDeviation >= THRESHOLDS.ALLOCATION_CAUTION) {
      findings.push({
        type:       'EQUITY_ALLOCATION',
        category:   'Allocation',
        severity:   'caution',
        confidence: 'high',
        direction:  delta > 0 ? 'over' : 'under',
        evidence: {
          actualPct:    actual,
          targetPct:    target,
          deviationPct: delta,
          excessValue:  excessValue ?? null,
        },
      });
    } else if (absDeviation >= THRESHOLDS.ALLOCATION_WARNING) {
      findings.push({
        type:       'EQUITY_ALLOCATION',
        category:   'Allocation',
        severity:   'warning',
        confidence: 'high',
        direction:  delta > 0 ? 'over' : 'under',
        evidence: {
          actualPct:    actual,
          targetPct:    target,
          deviationPct: delta,
          excessValue:  excessValue ?? null,
        },
      });
    }
  }

  // ── 2. Debt allocation ───────────────────────────────────────────────────
  {
    const { actual, target, delta } = metrics.rebalancing.debt;
    const absDeviation = Math.abs(delta);

    if (absDeviation >= THRESHOLDS.ALLOCATION_WARNING) {
      findings.push({
        type:       'DEBT_ALLOCATION',
        category:   'Allocation',
        severity:   absDeviation >= THRESHOLDS.ALLOCATION_CAUTION ? 'caution' : 'warning',
        confidence: 'high',
        direction:  delta > 0 ? 'over' : 'under',
        evidence: {
          actualPct:    actual,
          targetPct:    target,
          deviationPct: delta,
        },
      });
    }
  }

  // ── 3. Gold allocation ───────────────────────────────────────────────────
  {
    const { actual, target, delta } = metrics.rebalancing.gold;
    const absDeviation = Math.abs(delta);

    if (absDeviation >= THRESHOLDS.ALLOCATION_WARNING) {
      findings.push({
        type:       'GOLD_ALLOCATION',
        category:   'Allocation',
        severity:   absDeviation >= THRESHOLDS.ALLOCATION_CAUTION ? 'caution' : 'warning',
        confidence: 'high',
        direction:  delta > 0 ? 'over' : 'under',
        evidence: {
          actualPct:    actual,
          targetPct:    target,
          deviationPct: delta,
        },
      });
    }
  }

  // ── 4. Concentration risk ─────────────────────────────────────────────────
  if (metrics.highConcentration && metrics.highConcentration.length > 0) {
    for (const holding of metrics.highConcentration) {
      findings.push({
        type:       'CONCENTRATION_RISK',
        category:   'Concentration',
        severity:   holding.weight >= THRESHOLDS.CONCENTRATION_CAUTION ? 'caution' : 'warning',
        confidence: 'high',
        evidence: {
          holdingName: holding.name,
          weightPct:   holding.weight,
          category:    holding.category,
        },
      });
    }
  }

  // ── 5. Largest single holding ─────────────────────────────────────────────
  if (
    metrics.largestHolding &&
    metrics.largestHolding.weight >= THRESHOLDS.CONCENTRATION_WARNING &&
    !metrics.highConcentration?.find(h => h.name === metrics.largestHolding.name)
  ) {
    findings.push({
      type:       'LARGEST_HOLDING',
      category:   'Concentration',
      severity:   'info',
      confidence: 'high',
      evidence: {
        holdingName: metrics.largestHolding.name,
        weightPct:   metrics.largestHolding.weight,
      },
    });
  }

  // ── 6. Diversification ────────────────────────────────────────────────────
  {
    const totalHoldings = metrics.summary.holdingCount;
    const assetTypeCount = Object.keys(metrics.assetAllocation || {}).length;

    if (totalHoldings < THRESHOLDS.MIN_HOLDINGS_WARNING) {
      findings.push({
        type:       'LOW_DIVERSIFICATION',
        category:   'Diversification',
        severity:   'warning',
        confidence: 'high',
        evidence: {
          holdingCount:   totalHoldings,
          assetTypeCount: assetTypeCount,
        },
      });
    } else if (assetTypeCount < THRESHOLDS.MIN_ASSET_TYPES) {
      findings.push({
        type:       'LOW_ASSET_DIVERSITY',
        category:   'Diversification',
        severity:   'warning',
        confidence: 'high',
        evidence: {
          assetTypeCount:   assetTypeCount,
          assetTypesPresent: Object.keys(metrics.assetAllocation || {}),
        },
      });
    }
  }

  // ── 7. Goal progress ──────────────────────────────────────────────────────
  if (metrics.goalProgress && metrics.goalProgress.length > 0) {
    for (const goal of metrics.goalProgress) {
      if (goal.progressPct < THRESHOLDS.GOAL_AT_RISK_PCT && goal.daysLeft > 0) {
        findings.push({
          type:       'GOAL_AT_RISK',
          category:   'Goal Progress',
          severity:   'caution',
          confidence: 'medium', // projection involves assumptions
          evidence: {
            goalName:    goal.name,
            progressPct: goal.progressPct,
            targetAmount: goal.target,
            currentValue: goal.current,
            daysLeft:    goal.daysLeft,
          },
        });
      } else if (goal.progressPct < THRESHOLDS.GOAL_ON_TRACK_PCT && goal.daysLeft > 0) {
        findings.push({
          type:       'GOAL_NEEDS_ATTENTION',
          category:   'Goal Progress',
          severity:   'info',
          confidence: 'medium',
          evidence: {
            goalName:    goal.name,
            progressPct: goal.progressPct,
            targetAmount: goal.target,
            currentValue: goal.current,
            daysLeft:    goal.daysLeft,
          },
        });
      }
    }
  }

  // ── 8. Upcoming maturities ────────────────────────────────────────────────
  if (metrics.upcomingMaturities && metrics.upcomingMaturities.length > 0) {
    for (const m of metrics.upcomingMaturities) {
      findings.push({
        type:       'UPCOMING_MATURITY',
        category:   'Maturity Alert',
        severity:   m.daysLeft <= THRESHOLDS.MATURITY_WINDOW_CAUTION ? 'caution' : 'info',
        confidence: 'high',
        evidence: {
          holdingName: m.name,
          daysLeft:    m.daysLeft,
          value:       m.value,
        },
      });
    }
  }

  // ── Build health matrix ───────────────────────────────────────────────────
  const healthMatrix = buildHealthMatrix(findings, metrics);

  return { findings, healthMatrix };
}

/**
 * Build a deterministic health matrix per category.
 * Status is the worst finding in each category.
 */
function buildHealthMatrix(findings, metrics) {
  const SEVERITY_ORDER = { caution: 3, warning: 2, info: 1, good: 0 };
  const STATUS_FOR_EMPTY = {
    'Allocation':     allocationStatus(metrics),
    'Concentration':  'good',
    'Diversification':'good',
    'Goal Progress':  metrics.goalProgress?.length > 0 ? 'good' : 'info',
    'Maturity Alert': metrics.upcomingMaturities?.length > 0 ? 'info' : 'good',
  };

  const matrix = { ...STATUS_FOR_EMPTY };

  for (const f of findings) {
    const current = SEVERITY_ORDER[matrix[f.category]] ?? 0;
    const incoming = SEVERITY_ORDER[f.severity] ?? 0;
    if (incoming > current) {
      matrix[f.category] = f.severity;
    }
  }

  // Ensure all categories exist
  for (const cat of Object.keys(STATUS_FOR_EMPTY)) {
    if (!matrix[cat]) matrix[cat] = 'good';
  }

  return matrix;
}

function allocationStatus(metrics) {
  const reb = metrics.rebalancing;
  const maxDev = Math.max(
    Math.abs(reb.equity.delta),
    Math.abs(reb.debt.delta),
    Math.abs(reb.gold.delta)
  );
  if (maxDev >= THRESHOLDS.ALLOCATION_CAUTION) return 'caution';
  if (maxDev >= THRESHOLDS.ALLOCATION_WARNING) return 'warning';
  return 'good';
}

module.exports = { runRules, THRESHOLDS };
