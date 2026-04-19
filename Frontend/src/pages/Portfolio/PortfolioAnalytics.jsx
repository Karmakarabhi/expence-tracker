import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { getTransactionsByPortfolio, getPortfolioAnalytics } from '../../api/transactionApi';
import AssetAllocationChart from '../../components/portfolio/charts/AssetAllocationChart';
import MarketCapChart from '../../components/portfolio/charts/MarketCapChart';
import PerformanceTimeline from '../../components/portfolio/charts/PerformanceTimeline';
import FundWiseTable from '../../components/portfolio/FundWiseTable';
import GoalTracker from '../../components/portfolio/GoalTracker';
import { TrendingUp, Activity, PieChart, Loader, HelpCircle } from 'lucide-react';

export default function PortfolioAnalytics() {
  const { activePortfolio } = usePortfolio();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!activePortfolio) return;
      try {
        setLoading(true);
        const [portfolioData, txsData] = await Promise.all([
          getPortfolioAnalytics(activePortfolio._id),
          getTransactionsByPortfolio(activePortfolio._id)
        ]);
        setData(portfolioData.data);
        setTransactions(txsData.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activePortfolio]);

  if (!activePortfolio) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-200 rounded-xl mt-6">
        <PieChart className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-800">No Portfolio Selected</h3>
        <p className="text-slate-500 mt-1">Please select or create a portfolio first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader className="w-8 h-8 text-slate-400 animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Gathering Analytics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-rose-50 text-rose-600 rounded-lg">{error}</div>;
  }

  const { totalInvested: invested, currentValue: current, absoluteGain, xirr, holdings } = data || {};
  const isPositiveGain = absoluteGain >= 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Portfolio Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Detailed insights, allocation breakdowns, and visual performance tracking for <span className="font-medium text-slate-700">{activePortfolio.name}</span>.
        </p>
      </div>

      {/* Top row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Total Invested</p>
           <h3 className="text-2xl font-bold text-slate-800">
            ₹{invested?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Current Value</p>
          <h3 className="text-2xl font-bold text-indigo-600">
            ₹{current?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Absolute Gain</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-bold ${isPositiveGain ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{Math.abs(absoluteGain || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <span className={`text-sm font-medium ${isPositiveGain ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPositiveGain ? '▲' : '▼'}
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 w-full">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Est. XIRR</p>
            <div className="relative group/tt">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover/tt:opacity-100 group-hover/tt:visible transition-all z-10 text-center">
                Annualized rate of return taking cashflows timing into account (via Newton-Raphson approximation).
              </div>
            </div>
            <div className="ml-auto">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
             {(xirr * 100)?.toFixed(1)}%
          </h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AssetAllocationChart holdings={holdings} />
        </div>
        <div className="lg:col-span-1 border border-slate-200 rounded-xl">
           <GoalTracker currentValue={current || 0} xirr={xirr || 0} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketCapChart holdings={holdings} />
      </div>

      {/* Timeline Chart */}
      <div className="w-full">
        <PerformanceTimeline transactions={transactions} />
      </div>

      {/* FundWise Table */}
      <div className="pt-4">
        <FundWiseTable holdings={holdings} xirrData={[]} />
      </div>
    </div>
  );
}
