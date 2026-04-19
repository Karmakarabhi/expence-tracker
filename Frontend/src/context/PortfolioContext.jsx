import { createContext, useState, useEffect, useContext } from 'react';
import { getPortfolios } from '../api/portfolioApi';
import { useAuth } from './AuthContext';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    const { user } = useAuth();
    const [portfolios, setPortfolios] = useState([]);
    const [activePortfolio, setActivePortfolio] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPortfolios = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getPortfolios();
            setPortfolios(data.data || []);
            
            if (data.data?.length > 0) {
                const def = data.data.find(p => p.isDefault) || data.data[0];
                setActivePortfolio(def);
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

    return (
        <PortfolioContext.Provider value={{
            portfolios,
            setPortfolios,
            activePortfolio,
            setActivePortfolio,
            loading,
            refreshPortfolios: fetchPortfolios
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => useContext(PortfolioContext);
