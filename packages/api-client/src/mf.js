import apiClient from './client.js';

export const searchMfScheme = async (query) => {
  const res = await apiClient.get(`/mf/search?q=${query}`);
  return res.data;
};

export const refreshPortfolioPrices = async (portfolioId) => {
  const res = await apiClient.post(`/portfolios/${portfolioId}/refresh-prices`);
  return res.data;
};
