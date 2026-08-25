import apiClient from './client.js';

export const getPortfolios = async () => {
  const res = await apiClient.get('/portfolios');
  return res.data;
};

export const createPortfolio = async (data) => {
  const res = await apiClient.post('/portfolios', data);
  return res.data;
};

export const updatePortfolio = async (id, data) => {
  const res = await apiClient.put(`/portfolios/${id}`, data);
  return res.data;
};

export const deletePortfolio = async (id) => {
  const res = await apiClient.delete(`/portfolios/${id}`);
  return res.data;
};

export const setDefaultPortfolio = async (id) => {
  const res = await apiClient.patch(`/portfolios/${id}/set-default`);
  return res.data;
};

export const getHoldings = async (portfolioId) => {
  const res = await apiClient.get(`/holdings/portfolio/${portfolioId}`);
  return res.data;
};

export const addHolding = async (data) => {
  const res = await apiClient.post('/holdings', data);
  return res.data;
};

export const updateHolding = async (id, data) => {
  const res = await apiClient.put(`/holdings/${id}`, data);
  return res.data;
};

export const deleteHolding = async (id) => {
  const res = await apiClient.delete(`/holdings/${id}`);
  return res.data;
};
