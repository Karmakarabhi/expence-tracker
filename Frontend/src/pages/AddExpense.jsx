import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function AddExpense() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    projectId: '',
    categoryId: '',
    itemName: '',
    quantity: 1,
    rate: '',
    date: new Date().toISOString().split('T')[0],
    paymentStatus: 'paid'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, projsRes] = await Promise.all([
          api.get('/categories/flat'),
          api.get('/projects')
        ]);
        setCategories(catsRes.data.data);
        setProjects(projsRes.data.data);
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', formData);
      toast.success('Expense added successfully!');
      navigate('/expenses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading form...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select name="projectId" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.projectId}>
              <option value="">Select a project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="categoryId" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.categoryId}>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name / Description</label>
          <input type="text" name="itemName" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.itemName} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" name="quantity" required min="1" step="0.01" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.quantity} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rate / Unit Price</label>
            <input type="number" name="rate" required min="0" step="0.01" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.rate} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <div className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-bold">
              ${((parseFloat(formData.quantity) || 0) * (parseFloat(formData.rate) || 0)).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.date} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select name="paymentStatus" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={formData.paymentStatus}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/expenses')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">Save Expense</button>
        </div>
      </form>
    </div>
  );
}