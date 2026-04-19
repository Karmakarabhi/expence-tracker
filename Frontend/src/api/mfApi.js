import axios from './axios';

export const searchMfScheme = async (query) => {
    const res = await axios.get(`/mf/search?q=${query}`);
    return res.data;
};

export const refreshPortfolioPrices = async (portfolioId) => {
    const res = await axios.post(`/portfolios/${portfolioId}/refresh-prices`);
    return res.data;
};
