import React, { useContext, useState } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import PortfolioModal from '../../components/portfolio/PortfolioModal';

const PortfolioDashboard = () => {
    const { activePortfolio, loading } = useContext(PortfolioContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) return <div>Loading...</div>;

    if (!activePortfolio) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold">Investments Dashboard</h1>
                <p>Welcome to your investment portfolio. You don't have any portfolios yet.</p>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Create Portfolio</button>
                <PortfolioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Portfolio: {activePortfolio.name}</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-white border text-blue-600 px-3 py-1 text-sm rounded shadow-sm hover:bg-gray-50">+ New Portfolio</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 shadow rounded-lg border-l-4 border-blue-500">
                    <h2 className="text-sm text-gray-500 font-semibold mb-1">Total Invested</h2>
                    <p className="text-2xl font-bold">₹0</p>
                </div>
                <div className="bg-white p-4 shadow rounded-lg border-l-4 border-green-500">
                    <h2 className="text-sm text-gray-500 font-semibold mb-1">Current Value</h2>
                    <p className="text-2xl font-bold">₹0</p>
                </div>
                <div className="bg-white p-4 shadow rounded-lg border-l-4 border-purple-500">
                    <h2 className="text-sm text-gray-500 font-semibold mb-1">Gain / Loss</h2>
                    <p className="text-2xl font-bold text-gray-500">₹0 (0%)</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 shadow rounded-lg">
                <p className="text-gray-500 text-center">Charts and detailed analytics will appear here in Phase 4.</p>
            </div>
            
            <PortfolioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PortfolioDashboard;