import apiClient from './client.js';

/**
 * Request a full AI portfolio review.
 * @param {string} portfolioId
 * @returns {Promise<{ portfolioSummary, healthMatrix, findings, metrics }>}
 */
export const getPortfolioReview = (portfolioId) =>
  apiClient.post(`/ai/portfolio-review/${portfolioId}`).then(r => r.data.data);

/**
 * Get an AI explanation for a specific holding.
 * @param {string} holdingId
 * @returns {Promise<{ holdingData, explanation }>}
 */
export const getHoldingExplanation = (holdingId) =>
  apiClient.post(`/ai/explain-holding/${holdingId}`).then(r => r.data.data);

/**
 * Run a what-if scenario analysis.
 * @param {string} portfolioId
 * @param {string} scenario - natural language e.g. "increase SIP by ₹10,000"
 * @returns {Promise<{ scenarioSummary, likelyImpact, allocationEffect, considerations }>}
 */
export const runWhatIf = (portfolioId, scenario) =>
  apiClient.post(`/ai/what-if/${portfolioId}`, { scenario }).then(r => r.data.data);
