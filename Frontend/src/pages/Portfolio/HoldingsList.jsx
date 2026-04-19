import React, { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { getHoldings } from '../../api/portfolioApi';
import { refreshPortfolioPrices } from '../../api/mfApi';
import { Plus, Trash2, Edit, FileText, RefreshCw } from 'lucide-react';
import TransactionModal from '../../components/portfolio/TransactionModal';
import AddHoldingModal from '../../components/portfolio/AddHoldingModal';

const HoldingsList = () => {
    const { activePortfolio } = useContext(PortfolioContext);
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedHoldingForTx, setSelectedHoldingForTx] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (activePortfolio) {
            fetchHoldings(activePortfolio._id);
        }
    }, [activePortfolio]);

    const fetchHoldings = async (portfolioId) => {
        try {
            setLoading(true);
            const res = await getHoldings(portfolioId);
            setHoldings(res.data || []);
        } catch (error) {
            console.error("Failed to fetch holdings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshPrices = async () => {
        try {
            setRefreshing(true);
            await refreshPortfolioPrices(activePortfolio._id);
            await fetchHoldings(activePortfolio._id);
        } catch (error) {
            console.error("Failed to refresh prices", error);
        } finally {
            setRefreshing(false);
        }
    };

    if (!activePortfolio) {
        return <div className="p-4 text-center text-gray-500">Select a portfolio to view holdings</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Your Holdings</h1>
                <div className="flex gap-3">
                    <button 
                        onClick={handleRefreshPrices} 
                        disabled={refreshing}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
                        {refreshing ? 'Updating...' : 'Refresh Nav'}
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Add Holding
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading holdings...</div>
                ) : holdings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No investments found in this portfolio.</p>
                        <p className="text-sm mt-2">Click "Add Holding" to start tracking.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Type</th>
                                    <th className="p-4 font-medium">Units</th>
                                    <th className="p-4 font-medium">Avg Cost</th>
                                    <th className="p-4 font-medium">Current NAV</th>
                                    <th className="p-4 font-medium">Value</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {holdings.map((holding) => {
                                    const value = holding.units * holding.currentNav;
                                    return (
                                        <tr key={holding._id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-800">{holding.name}</td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{holding.type}</span>
                                            </td>
                                            <td className="p-4 text-gray-600">{holding.units.toFixed(2)}</td>
                                            <td className="p-4 text-gray-600">₹{holding.avgCost.toFixed(2)}</td>
                                            <td className="p-4 text-gray-600">₹{holding.currentNav.toFixed(2)}</td>
                                            <td className="p-4 font-medium text-gray-800">₹{value.toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setSelectedHoldingForTx(holding)} className="text-green-600 hover:text-green-800 ml-2" title="Add Transaction">
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-red-500 hover:text-red-700 ml-2">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <TransactionModal 
                isOpen={!!selectedHoldingForTx}
                holding={selectedHoldingForTx}
                onClose={() => setSelectedHoldingForTx(null)}
                onSuccess={() => fetchHoldings(activePortfolio._id)}
            />
            
            <AddHoldingModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => fetchHoldings(activePortfolio._id)}
            />
        </div>
    );
};

export default HoldingsList;