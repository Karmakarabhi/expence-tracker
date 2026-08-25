import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, parseISO, compareAsc } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PerformanceTimeline({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;

    // Sort transactions chronologically
    const sortedTxs = [...transactions].sort((a, b) => 
      compareAsc(parseISO(a.date), parseISO(b.date))
    );

    let cumulativeInvested = 0;
    const labels = [];
    const investedData = [];

    // Simple grouping by date
    sortedTxs.forEach(tx => {
      const dateStr = format(parseISO(tx.date), 'MMM dd, yyyy');
      
      if (['BUY', 'SIP', 'SWITCH_IN'].includes(tx.type)) {
        cumulativeInvested += tx.amount;
      } else if (['SELL', 'SWITCH_OUT'].includes(tx.type)) {
        cumulativeInvested -= tx.amount;
      }
      
      if (labels[labels.length - 1] === dateStr) {
        investedData[investedData.length - 1] = cumulativeInvested;
      } else {
        labels.push(dateStr);
        investedData.push(cumulativeInvested);
      }
    });

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Cumulative Invested (₹)',
          data: investedData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
        }
      ],
    };
  }, [transactions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Investment Timeline</h3>
      <div className="h-72 flex justify-center items-center">
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="text-slate-500">No transaction data available</div>
        )}
      </div>
    </div>
  );
}
