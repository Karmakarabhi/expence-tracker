import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function Budget() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch (error) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetStatus = (project) => {
    const totalSpent = project.totalExpenses || 0;
    const percentage = project.budget > 0 ? (totalSpent / project.budget) * 100 : 0;
    const remaining = project.budget - totalSpent;
    
    let colorClass = 'bg-green-500';
    let textClass = 'text-green-600';
    if (percentage > 90) {
      colorClass = 'bg-red-500';
      textClass = 'text-red-600';
    } else if (percentage > 75) {
      colorClass = 'bg-yellow-500';
      textClass = 'text-yellow-600';
    }

    return { percentage, remaining, colorClass, textClass, totalSpent };
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading budgets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Budget Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const { percentage, remaining, colorClass, textClass, totalSpent } = calculateBudgetStatus(project);
          
          return (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.status}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  Total Budget: ${project.budget.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Spent: ${totalSpent.toLocaleString()}</span>
                    <span className={`font-medium ${textClass}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${colorClass}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Remaining Balance:</span>
                  <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                    ${remaining.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}