import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MarketCapChart({ holdings }) {
  const equityHoldings = holdings?.filter(h => h.category === 'Equity' || h.type === 'MF' || h.type === 'Stock');
  
  const capData = equityHoldings?.reduce((acc, holding) => {
    const value = holding.units * holding.currentNav;
    const cap = holding.capType || 'Multi';
    acc[cap] = (acc[cap] || 0) + value;
    return acc;
  }, {});

  const labels = Object.keys(capData || {});
  const dataValues = Object.values(capData || {});

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: [
          '#3b82f6', // Large (blue)
          '#10b981', // Mid (emerald)
          '#f59e0b', // Small (amber)
          '#8b5cf6', // Multi (violet)
          '#64748b', // None (slate)
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            const total = context.chart._metasets[context.datasetIndex].total;
            const percentage = ((value / total) * 100).toFixed(1) + '%';
            return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${percentage})`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Equity Market Cap</h3>
      <div className="h-64 flex justify-center items-center">
        {labels.length > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div className="text-slate-500">No equity holdings</div>
        )}
      </div>
    </div>
  );
}
