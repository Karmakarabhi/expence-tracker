import apiClient from './client.js';

export const addTransaction = async (data) => {
  const res = await apiClient.post('/transactions', data);
  return res.data;
};

export const getTransactionsByHolding = async (holdingId) => {
  const res = await apiClient.get(`/transactions?holdingId=${holdingId}`);
  return res.data;
};

export const getTransactionsByPortfolio = async (portfolioId) => {
  const res = await apiClient.get(`/transactions?portfolioId=${portfolioId}`);
  return res.data;
};

export const deleteTransaction = async (id) => {
  const res = await apiClient.delete(`/transactions/${id}`);
  return res.data;
};

export const getPortfolioAnalytics = async (portfolioId) => {
  const res = await apiClient.get(`/portfolios/${portfolioId}/analytics`);
  return res.data;
};
