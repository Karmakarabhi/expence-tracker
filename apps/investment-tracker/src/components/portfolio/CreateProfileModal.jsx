import React, { useState, useContext } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PRESET_COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
const RELATIONS = ['Self', 'Father', 'Mother', 'Spouse', 'Child', 'Other'];

export default function CreateProfileModal({ isOpen, onClose }) {
    const { createPortfolio, setActivePortfolio } = useContext(PortfolioContext);
    
    const [memberName, setMemberName] = useState('');
    const [relation, setRelation] = useState('Self');
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [isDefault, setIsDefault] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!memberName.trim()) {
            setError('Member Name is required.');
            return;
        }

        const fallbackName = name.trim() ? name : `${memberName}'s Portfolio`;
        
        setLoading(true);
        try {
            const newPortfolio = await createPortfolio({ 
                name: fallbackName, 
                memberName, 
                relation, 
                color, 
                isDefault,
                currency: 'INR'
            });
            
            toast.success('Family member added successfully!');
            setActivePortfolio(newPortfolio);
            onClose();
            
            // Reset state
            setMemberName('');
            setRelation('Self');
            setName('');
            setColor(PRESET_COLORS[0]);
            setIsDefault(false);
        } catch (err) {
            console.error("Failed to create portfolio", err);
            setError(err?.response?.data?.error || 'Failed to create profile. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-slate-800">Add Family Member</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Family Member Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required
                            value={memberName} 
                            onChange={(e) => setMemberName(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            placeholder="e.g., Priya"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Relation</label>
                            <select 
                                value={relation} 
                                onChange={(e) => setRelation(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-white"
                            >
                                {RELATIONS.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio Title (Optional)</label>
                            <input 
                                type="text"
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                placeholder="e.g., Retirement"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Color Theme</label>
                        <div className="flex gap-3">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                                    style={{ backgroundColor: c }}
                                >
                                    {color === c && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center mt-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="isDefault" 
                            checked={isDefault} 
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                            Set as my default dashboard view
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition" disabled={loading}>Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}