import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FundWiseTable({ holdings, xirrData }) {
  const getGainColor = (gain) => gain >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Fund-wise Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-3">Fund Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Cap Type</th>
              <th className="px-6 py-3 text-right">Invested (₹)</th>
              <th className="px-6 py-3 text-right">Current (₹)</th>
              <th className="px-6 py-3 text-right">Gain (₹)</th>
              <th className="px-6 py-3 text-right">Gain %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 divide-x-0">
            {holdings?.map((holding) => {
              const invested = holding.units * holding.avgCost;
              const current = holding.units * holding.currentNav;
              const gain = current - invested;
              const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
              const isPositive = gain >= 0;

              return (
                <tr key={holding._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {holding.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {holding.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{holding.capType || '-'}</td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    ₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">
                    ₹{current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      ₹{Math.abs(gain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded border font-medium text-xs
                      ${isPositive ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-rose-200 text-rose-700 bg-rose-50'}`}
                    >
                      {gainPct>0 ? '+' : ''}{gainPct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!holdings || holdings.length === 0) && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No holding data to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
