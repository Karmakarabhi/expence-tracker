import apiClient from './client.js';

export const getExpenses = async (params = {}) => {
  const res = await apiClient.get('/expenses', { params });
  return res.data;
};

export const getExpense = async (id) => {
  const res = await apiClient.get(`/expenses/${id}`);
  return res.data;
};

export const createExpense = async (data) => {
  const res = await apiClient.post('/expenses', data);
  return res.data;
};

export const updateExpense = async (id, data) => {
  const res = await apiClient.put(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id) => {
  const res = await apiClient.delete(`/expenses/${id}`);
  return res.data;
};

export const getExpenseDashboardSummary = async () => {
  const res = await apiClient.get('/expenses/summary/dashboard');
  return res.data;
};

export const getProjects = async () => {
  const res = await apiClient.get('/projects');
  return res.data;
};

export const getCategories = async () => {
  const res = await apiClient.get('/categories');
  return res.data;
};
