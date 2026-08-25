import api from './axios';

/**
 * Request a full AI portfolio review.
 * @param {string} portfolioId
 * @returns {Promise<{ review, metrics }>}
 */
export const getPortfolioReview = (portfolioId) =>
  api.post(`/ai/portfolio-review/${portfolioId}`).then(r => r.data.data);

/**
 * Get an AI explanation for a specific holding.
 * @param {string} holdingId
 * @returns {Promise<{ whatItIs, portfolioRole, riskNote, concentration }>}
 */
export const getHoldingExplanation = (holdingId) =>
  api.post(`/ai/explain-holding/${holdingId}`).then(r => r.data.data);

/**
 * Run a what-if scenario analysis.
 * @param {string} portfolioId
 * @param {string} scenario - natural language e.g. "increase SIP by ₹10,000"
 * @returns {Promise<{ scenarioSummary, likelyImpact, allocationEffect, reasoning, recommendation }>}
 */
export const runWhatIf = (portfolioId, scenario) =>
  api.post(`/ai/what-if/${portfolioId}`, { scenario }).then(r => r.data.data);
