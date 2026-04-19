import React, { useState, useEffect, useContext } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { getTransactionsByPortfolio, deleteTransaction } from '../../api/transactionApi';
import { Trash2 } from 'lucide-react';

const TransactionHistory = () => {
    const { activePortfolio } = useContext(PortfolioContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activePortfolio) {
            fetchTransactions(activePortfolio._id);
        }
    }, [activePortfolio]);

    const fetchTransactions = async (portfolioId) => {
        try {
            setLoading(true);
            const res = await getTransactionsByPortfolio(portfolioId);
            setTransactions(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tx", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Delete this transaction? It will automatically recalculate the holding units and average cost.')){
            try {
                await deleteTransaction(id);
                fetchTransactions(activePortfolio._id);
            } catch(e) {
                console.error(e);
            }
        }
    }

    if (!activePortfolio) return <div className="p-4 text-center">Select a portfolio</div>;

    const renderBadge = (type) => {
        const colorMap = {
            'BUY': 'bg-green-100 text-green-800',
            'SIP': 'bg-blue-100 text-blue-800',
            'DIVIDEND': 'bg-purple-100 text-purple-800',
            'SELL': 'bg-red-100 text-red-800',
            'SWITCH_IN': 'bg-indigo-100 text-indigo-800',
            'SWITCH_OUT': 'bg-orange-100 text-orange-800'
        };
        const defaultColor = 'bg-gray-100 text-gray-800';
        return <span className={`px-2 py-1 text-xs rounded-full font-medium ${colorMap[type] || defaultColor}`}>{type}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading history...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No transactions recorded yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Type</th>
                                    <th className="p-4 font-medium">Units</th>
                                    <th className="p-4 font-medium">NAV</th>
                                    <th className="p-4 font-medium">Value (₹)</th>
                                    <th className="p-4 font-medium text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-600">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {renderBadge(tx.type)}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {['SELL', 'SWITCH_OUT'].includes(tx.type) ? '-' : '+'}{tx.units.toFixed(4)}
                                        </td>
                                        <td className="p-4 text-gray-600">₹{tx.nav.toFixed(2)}</td>
                                        <td className="p-4 font-medium text-gray-800">₹{tx.amount.toFixed(2)}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDelete(tx._id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4 ml-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;