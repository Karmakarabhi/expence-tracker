import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Link } from 'react-router-dom';
import { TrendingUp, Activity, ExternalLink } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function NetWorthWidget({ expenseSummary }) {
  const { portfolios, loading } = usePortfolio();
  
  if (loading) {
    return <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>;
  }

  // Calculate Net Worth: Total Investments + Cash Balance
  let totalInvestments = 0;
  portfolios.forEach(p => {
    // We would ideally fetch the true summary value, but for the widget, 
    // a quick aggregate or latest fetched value is helpful. 
    // Assuming portfolios array might soon carry summary totals from backend 
    // (if not, we rely on activePortfolio or summary endpoints).
    totalInvestments += (p.currentValue || 0);
  });

  const cashBalance = expenseSummary?.remaining || 0; // From budget vs actual
  const netWorth = totalInvestments + cashBalance;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-24 h-24" />
      </div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase mb-1">Total Net Worth</p>
          <h2 className="text-3xl font-bold tracking-tight">
            ₹{netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h2>
        </div>
        <Link 
          to="/portfolio" 
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          title="View Investments"
        >
          <ExternalLink className="w-5 h-5 text-white" />
        </Link>
      </div>

      <div className="mt-6 flex gap-6 relative z-10 w-full pt-4 border-t border-white/20">
        <div className="flex-1">
          <p className="text-xs text-indigo-200 mb-1">Investments</p>
          <p className="text-lg font-semibold">₹{totalInvestments.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex-1 border-l border-white/20 pl-6">
          <p className="text-xs text-indigo-200 mb-1">Cash / Bank</p>
          <p className="text-lg font-semibold">₹{cashBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}