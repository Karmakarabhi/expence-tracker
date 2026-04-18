import fs from 'fs';
import path from 'path';

const basePath = '/home/abhijitkarmakar/Desktop/projects/expence-tracker/client';

const files = {
  'src/pages/AddExpense.jsx': `
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddExpense() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    amount: '',
    category: '',
    date: '',
    status: 'paid'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sumbit
    navigate('/expenses');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input type="text" name="itemName" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
            <input type="number" name="amount" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange}>
              <option value="">Select a category</option>
              <option value="materials">Materials</option>
              <option value="labour">Labour</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select name="status" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.status}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/expenses')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Expense</button>
        </div>
      </form>
    </div>
  );
}
  `,
  'src/pages/Categories.jsx': `
export default function Categories() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
          + Add Category
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl">🧱</div>
          <div>
            <h3 className="font-bold text-gray-900">Materials</h3>
            <p className="text-sm text-gray-500">14 Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-2xl">👷</div>
          <div>
            <h3 className="font-bold text-gray-900">Labour</h3>
            <p className="text-sm text-gray-500">8 Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-2xl">⚡</div>
          <div>
            <h3 className="font-bold text-gray-900">Electrical</h3>
            <p className="text-sm text-gray-500">5 Items</p>
          </div>
        </div>
      </div>
    </div>
  );
}
  `,
  'src/pages/Budget.jsx': `
export default function Budget() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Budget Management</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-4">Overall Budget Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-8">
          <span>Spent: $162,500</span>
          <span>Total: $250,000</span>
        </div>
        
        <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Materials</span>
              <span>$45,000 / $60,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Labour</span>
              <span>$38,000 / $40,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Electrical</span>
              <span className="text-red-500">$12,000 / $10,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-red-500 mt-1">Over budget by $2,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
  `,
  'src/pages/Reports.jsx': `
export default function Reports() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
        <div className="space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">Export PDF</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Export Excel</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 py-20">
        <p className="text-lg">Select a report type to generate statistics and charts.</p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Monthly Expenses</button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Category Distribution</button>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-medium rounded-lg">Supplier Summary</button>
        </div>
      </div>
    </div>
  );
}
  `
};

for (const [file, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(basePath, file)), { recursive: true });
  fs.writeFileSync(path.join(basePath, file), content.trim() + '\\n');
}

console.log('Remaining frontend pages created successfully.');
