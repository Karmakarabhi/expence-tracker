import React, { useState, useContext } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { addHolding } from '../../api/portfolioApi';
import FundSearchInput from './FundSearchInput';
import { X } from 'lucide-react';

const AddHoldingModal = ({ isOpen, onClose, onSuccess }) => {
    const { activePortfolio } = useContext(PortfolioContext);
    
    const [type, setType] = useState('MF');
    const [name, setName] = useState('');
    const [amfiCode, setAmfiCode] = useState('');
    const [symbol, setSymbol] = useState('');
    const [category, setCategory] = useState('Equity');
    const [capType, setCapType] = useState('None');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !activePortfolio) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addHolding({
                portfolioId: activePortfolio._id,
                type,
                name,
                amfiCode: type === 'MF' ? amfiCode : undefined,
                symbol: type === 'ETF' || type === 'Stock' ? symbol : undefined,
                category,
                capType: type === 'MF' || type === 'Stock' || type === 'ETF' ? capType : 'None'
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to add holding", error);
        } finally {
             setLoading(false);
        }
    };

    const handleFundSelect = (scheme) => {
        setName(scheme.name);
        setAmfiCode(scheme.amfiCode);
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Holding</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Type</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2"
                        >
                            <option value="MF">Mutual Fund</option>
                            <option value="ETF">ETF</option>
                            <option value="Stock">Stock</option>
                            <option value="FD">Fixed Deposit</option>
                            <option value="Savings">Savings Account</option>
                            <option value="PPF">PPF</option>
                        </select>
                    </div>

                    {type === 'MF' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Fund</label>
                            <FundSearchInput onSelect={handleFundSelect} />
                            {amfiCode && <p className="text-xs text-green-600 mt-1">✓ AMFI Code Linked: {amfiCode}</p>}
                        </div>
                    ) : (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input 
                                type="text" 
                                required
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            />
                        </div>
                    )}
                    
                    {(type === 'ETF' || type === 'Stock') && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Symbol (Optional)</label>
                            <input 
                                type="text" 
                                value={symbol} 
                                onChange={(e) => setSymbol(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="Equity">Equity</option>
                                <option value="Debt">Debt</option>
                                <option value="Liquid">Liquid</option>
                                <option value="Gold">Gold</option>
                                <option value="FD">FD</option>
                                <option value="Savings">Savings</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Market Cap</label>
                            <select 
                                value={capType} 
                                onChange={(e) => setCapType(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="None">None / Nav</option>
                                <option value="Large">Large Cap</option>
                                <option value="Mid">Mid Cap</option>
                                <option value="Small">Small Cap</option>
                                <option value="Multi">Multi Cap</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHoldingModal;