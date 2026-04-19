import React, { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import CreateProfileModal from '../../components/portfolio/CreateProfileModal';
import { getPortfolioAnalytics } from '../../api/transactionApi';
import { getHoldings } from '../../api/portfolioApi';
import { Link } from 'react-router-dom';
import { PieChart, TrendingUp, Presentation, Plus, AlertTriangle } from 'lucide-react';

const PortfolioDashboard = () => {
    const { activePortfolio, loading, portfolios } = useContext(PortfolioContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [fetchingData, setFetchingData] = useState(false);
    const [holdings, setHoldings] = useState([]);

    useEffect(() => {
        if (activePortfolio) {
            setFetchingData(true);
            getPortfolioAnalytics(activePortfolio._id)
                .then(res => setAnalytics(res.data))
                .catch(err => console.error("Error fetching analytics", err));
            getHoldings(activePortfolio._id)
                .then(res => setHoldings(res.data || []))
                .catch(err => console.error("Error fetching analytics", err))
                .finally(() => setFetchingData(false));
        }
    }, [activePortfolio]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Portfolio...</div>;

    if (!activePortfolio) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 mt-6 max-w-2xl mx-auto">
                <Presentation className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Investments</h1>
                <p className="text-slate-500 mb-6">You don't have any investment portfolios yet. Create one to get started tracking your assets.</p>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 mx-auto font-medium">
                    <Plus className="w-4 h-4" /> Create Portfolio
                </button>
                <CreateProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        );
    }

    const { invested = 0, current = 0, absoluteGain = 0, gainPercent = 0 } = analytics || {};
    const isPositiveGain = absoluteGain >= 0;

    const upcomingMaturities = holdings.filter(h => {
        if (!h.maturityDate) return false;
        const daysLeft = (new Date(h.maturityDate) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft > 0 && daysLeft <= 90;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl w-full mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                   <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Portfolio Summary</h1>
                   <p className="text-slate-500 text-sm mt-1">Currently viewing <span className="font-semibold text-slate-700">{activePortfolio.name}</span> profile</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-white border border-slate-200 text-indigo-600 font-medium px-4 py-2 text-sm rounded-lg shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> New Portfolio
                </button>
            </div>
            
            {upcomingMaturities.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-amber-900 font-semibold">{upcomingMaturities.length} {upcomingMaturities.length === 1 ? 'Asset' : 'Assets'} Maturing Soon</h3>
                            <p className="text-amber-700 text-sm mt-0.5">
                                {upcomingMaturities.map(m => {
                                    const days = Math.ceil((new Date(m.maturityDate) - new Date()) / (1000 * 60 * 60 * 24));
                                    return `${m.name} in ${days} days (₹${(m.units * m.avgCost).toLocaleString('en-IN')})`;
                                }).join(', ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200 border-l-4 border-l-indigo-500">
                    <h2 className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">Total Invested</h2>
                    <p className="text-3xl font-bold text-slate-800">
                        {fetchingData ? "..." : `₹${invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </p>
                </div>
                <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200 border-l-4 border-l-emerald-500">
                    <h2 className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">Current Value</h2>
                    <p className="text-3xl font-bold text-slate-800">
                        {fetchingData ? "..." : `₹${current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </p>
                </div>
                <div className={`bg-white p-6 shadow-sm rounded-xl border border-slate-200 border-l-4 ${isPositiveGain ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                    <h2 className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">Gain / Loss</h2>
                    <p className={`text-3xl font-bold ${isPositiveGain ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fetchingData ? "..." : `₹${Math.abs(absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })} `}
                        <span className="text-lg font-medium opacity-80">
                           ({isPositiveGain?'+':''}{(gainPercent).toFixed(2)}%)
                        </span>
                    </p>
                </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                   <h3 className="text-xl font-bold text-indigo-950 mb-2">Dive Deeper into Your Analytics</h3>
                   <p className="text-indigo-800/80 max-w-lg mb-0 text-sm leading-relaxed">
                     Navigate to your Analytics Board to view rich visual data including Asset Allocation Charts, Market Capitalization distributions, XIRR calculations, and dynamic goal tracking estimations.
                   </p>
                </div>
                <Link to="/portfolio/analytics" className="whitespace-nowrap px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow flex items-center gap-2 transition-all">
                    <PieChart className="w-5 h-5" /> View Analytics Dashboard
                </Link>
            </div>
            
            <CreateProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PortfolioDashboard;
