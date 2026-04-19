import React, { useState, useContext, useEffect } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { addTransaction } from '../../api/transactionApi';
import { X } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, holding, onSuccess }) => {
    const { activePortfolio } = useContext(PortfolioContext);
    
    // State form
    const [type, setType] = useState('BUY');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [units, setUnits] = useState('');
    const [nav, setNav] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (holding) {
            setNav(holding.currentNav || '');
        }
    }, [holding]);

    if (!isOpen || !holding) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const amount = parseFloat(units) * parseFloat(nav);
            await addTransaction({
                holdingId: holding._id,
                portfolioId: holding.portfolioId, // fallback
                type,
                units: parseFloat(units),
                nav: parseFloat(nav),
                amount,
                date: new Date(date).toISOString(),
                notes
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save tx", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Transaction</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Holding: <span className="font-semibold text-gray-700">{holding.name}</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                            <option value="SIP">SIP</option>
                            <option value="DIVIDEND">Dividend (Reinvest)</option>
                            <option value="SWITCH_IN">Switch In</option>
                            <option value="SWITCH_OUT">Switch Out</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                            <input 
                                type="number" 
                                step="0.0001"
                                required
                                value={units} 
                                onChange={(e) => setUnits(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NAV / Price (₹)</label>
                            <input 
                                type="number" 
                                step="0.0001"
                                required
                                value={nav} 
                                onChange={(e) => setNav(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            required
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2"
                        />
                    </div>

                    <div className="pt-2 bg-gray-50 p-3 rounded text-sm text-gray-600 flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-bold text-gray-800">
                            {units && nav ? `₹${(parseFloat(units) * parseFloat(nav)).toFixed(2)}` : '₹0.00'}
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;