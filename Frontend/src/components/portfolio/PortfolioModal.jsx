import React, { useState, useContext } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { createPortfolio } from '../../api/portfolioApi';
import { X } from 'lucide-react';

const PortfolioModal = ({ isOpen, onClose }) => {
    const { refreshPortfolios } = useContext(PortfolioContext);
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [color, setColor] = useState('#6366f1');
    const [isDefault, setIsDefault] = useState(true);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPortfolio({ name, currency, color, isDefault });
            await refreshPortfolios();
            onClose();
        } catch (error) {
            console.error("Failed to create portfolio", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create Portfolio</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Name</label>
                        <input 
                            type="text" 
                            required
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2"
                            placeholder="e.g., Personal, Wife's Portfolio, Retirement"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select 
                                value={currency} 
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                            <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full border border-gray-300 rounded p-1 h-10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center mt-2">
                        <input 
                            type="checkbox" 
                            id="isDefault" 
                            checked={isDefault} 
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                            Set as default portfolio
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50" disabled={loading}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
                            {loading ? 'Saving...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortfolioModal;