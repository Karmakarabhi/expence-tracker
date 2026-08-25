import apiClient from './client.js';

export const loginUser = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await apiClient.post('/auth/register', userData);
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
  }
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};
