import { createContext, useState, useEffect, useContext } from 'react';
import { getPortfolios, createPortfolio as apiCreatePortfolio, setDefaultPortfolio as apiSetDefaultPortfolio } from '../api/portfolioApi';
import { useAuth } from './AuthContext';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    const { user } = useAuth();
    const [portfolios, setPortfolios] = useState([]);
    const [activePortfolio, setActivePortfolioState] = useState(null);
    const [loading, setLoading] = useState(true);

    const setActivePortfolio = (portfolio) => {
        setActivePortfolioState(portfolio);
        if (portfolio) {
            localStorage.setItem('activePortfolioId', portfolio._id);
        } else {
            localStorage.removeItem('activePortfolioId');
        }
    };

    const fetchPortfolios = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getPortfolios();
            const fetchedPortfolios = data.data || [];
            setPortfolios(fetchedPortfolios);
            
            if (fetchedPortfolios.length > 0) {
                const savedId = localStorage.getItem('activePortfolioId');
                let target = fetchedPortfolios.find(p => p._id === savedId);
                if (!target) {
                    target = fetchedPortfolios.find(p => p.isDefault) || fetchedPortfolios[0];
                }
                setActivePortfolio(target);
            } else {
                setActivePortfolio(null);
            }
        } catch (error) {
            console.error("Failed to fetch portfolios", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, [user]);

    const createPortfolio = async (formData) => {
        const response = await apiCreatePortfolio(formData);
        const newPortfolio = response.data;
        setPortfolios(prev => [...prev, newPortfolio]);
        return newPortfolio;
    };

    const setDefaultPortfolio = async (portfolioId) => {
        await apiSetDefaultPortfolio(portfolioId);
        await fetchPortfolios();
    };

    return (
        <PortfolioContext.Provider value={{
            portfolios,
            setPortfolios,
            activePortfolio,
            setActivePortfolio,
            createPortfolio,
            setDefaultPortfolio,
            loading,
            refreshPortfolios: fetchPortfolios
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => useContext(PortfolioContext);
