import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/expenses/summary/dashboard');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center justify-between">
            Total Spent
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{data?.totalExpenses || 0} items</span>
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">${data?.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center justify-between">
            This Month
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">${data?.monthSpent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase flex items-center justify-between">
            Pending Payments
            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{data?.pendingCount || 0} bills</span>
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">${data?.pendingAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Recent Expenses</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.recentExpenses?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No expenses recorded yet.</td>
                  </tr>
                ) : (
                  data?.recentExpenses?.slice(0, 5).map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.itemName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 font-medium text-blue-800 rounded-full text-xs">
                          {expense.categoryId?.icon} {expense.categoryId?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${expense.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Top Categories</h2>
          <div className="space-y-4">
            {data?.categoryTotals?.length === 0 ? (
               <p className="text-gray-500 text-sm text-center py-4">No data available</p>
            ) : (
              data?.categoryTotals?.map((cat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${cat.total.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}