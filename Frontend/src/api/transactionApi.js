import axios from './axios';

export const addTransaction = async (data) => {
    const res = await axios.post('/transactions', data);
    return res.data;
};

export const getTransactionsByHolding = async (holdingId) => {
    const res = await axios.get(`/transactions?holdingId=${holdingId}`);
    return res.data;
};

export const getTransactionsByPortfolio = async (portfolioId) => {
    const res = await axios.get(`/transactions?portfolioId=${portfolioId}`);
    return res.data;
};

export const deleteTransaction = async (id) => {
    const res = await axios.delete(`/transactions/${id}`);
    return res.data;
};

export const getPortfolioAnalytics = async (portfolioId) => {
    const res = await axios.get(`/portfolios/${portfolioId}/analytics`);
    return res.data;
};
