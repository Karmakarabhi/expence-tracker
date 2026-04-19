import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data.data);
      } catch (err) {
        toast.error('Failed to load project details');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading project...</div>;
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <button onClick={() => navigate('/projects')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Back to Projects
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 uppercase">Status</p>
            <p className="font-medium text-gray-900 capitalize">{project.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase">Location</p>
            <p className="font-medium text-gray-900">{project.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase">Budget</p>
            <p className="font-medium text-gray-900">${project.budget?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase">Total Spent</p>
            <p className="font-medium text-gray-900">${project.totalSpent?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={() => navigate('/expenses/new', { state: { projectId: project._id } })} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
          + Add Expense to Project
        </button>
        <button onClick={() => navigate(`/expenses?project=${project._id}`)} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 shadow-sm transition-colors">
          View All Expenses
        </button>
      </div>
    </div>
  );
}
