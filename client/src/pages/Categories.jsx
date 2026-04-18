import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '📁', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const seedCategories = async () => {
    try {
      await api.post('/categories/seed');
      toast.success('Default categories added!');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', formData);
      toast.success('Category added successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', icon: '📁', description: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted!');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading categories...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <div className="space-x-3">
          {categories.length === 0 && (
            <button onClick={seedCategories} className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 shadow-sm transition-colors">
              Seed Defaults
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            + Add Category
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Permits" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji Icon</label>
                <input type="text" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 📄" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Category description..." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {categories.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
          <p className="text-gray-500 mb-4">No categories found. Add your first category or seed the defaults.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4 relative group">
              <button 
                onClick={() => handleDeleteCategory(category._id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Category"
              >
                &times;
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl">
                  {category.icon || '📁'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{category.subcategories?.length || 0} Subcategories</p>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}