import axios from './axios';

export const getPortfolios = async () => {
    const res = await axios.get('/portfolios');
    return res.data;
};

export const createPortfolio = async (data) => {
    const res = await axios.post('/portfolios', data);
    return res.data;
};

export const updatePortfolio = async (id, data) => {
    const res = await axios.put(`/portfolios/${id}`, data);
    return res.data;
};

export const deletePortfolio = async (id) => {
    const res = await axios.delete(`/portfolios/${id}`);
    return res.data;
};

export const setDefaultPortfolio = async (id) => {
    const res = await axios.patch(`/portfolios/${id}/set-default`);
    return res.data;
};

export const getHoldings = async (portfolioId) => {
    const res = await axios.get(`/holdings/portfolio/${portfolioId}`);
    return res.data;
};

export const addHolding = async (data) => {
    const res = await axios.post('/holdings', data);
    return res.data;
};

export const updateHolding = async (id, data) => {
    const res = await axios.put(`/holdings/${id}`, data);
    return res.data;
};

export const deleteHolding = async (id) => {
    const res = await axios.delete(`/holdings/${id}`);
    return res.data;
};
