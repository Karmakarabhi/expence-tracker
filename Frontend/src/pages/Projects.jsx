import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', budget: '', status: 'active' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', location: '', budget: '', status: 'active' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-center">
          + New Project
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg my-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Phase 2 Building" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 123 Main St" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input required type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
           <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
           <p className="text-gray-500 mb-6">Create your first construction project to start tracking expenses.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
             Create Project
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const percentUsed = project.budget > 0 ? Math.round((project.totalSpent / project.budget) * 100) : 0;
            const progressColor = percentUsed > 90 ? 'bg-red-500' : percentUsed > 75 ? 'bg-yellow-500' : 'bg-blue-600';
            
            return (
              <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 h-5 line-clamp-1">{project.location}</p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-gray-500 mb-4">{percentUsed}% of Budget Used</p>
                  
                  <div className="flex justify-between items-center text-sm border-t border-gray-50 mt-4 pt-4">
                    <div className="flex flex-col">
                       <span className="text-xs text-gray-500 uppercase tracking-wider">Spent</span>
                       <span className="font-bold text-gray-900">${project.totalSpent?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs text-gray-500 uppercase tracking-wider">Budget</span>
                       <span className="font-bold text-gray-900">${project.budget?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-700' : project.status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <button onClick={() => navigate(`/projects/${project._id}`)} className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">View Details →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}