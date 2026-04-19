import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export default function Budget() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

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
    return { percentage, remaining, totalSpent };
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading budgets...</div>;

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.totalExpenses || 0), 0);
  const overall = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Budget" description="Stay on top of project spending." />

      <Card className="p-6 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall across projects</p>
            <p className="text-2xl font-semibold mt-1">
              ₹{totalSpent.toLocaleString()} <span className="text-base text-muted-foreground font-normal">of ₹{totalBudget.toLocaleString()}</span>
            </p>
          </div>
          <Badge variant={overall > 100 ? "destructive" : "secondary"} className="font-normal">
            {overall.toFixed(0)}% used
          </Badge>
        </div>
        <Progress value={Math.min(overall, 100)} className="h-2" />
      </Card>

      <div className="space-y-3">
        {projects.map((project) => {
          const { percentage, remaining, totalSpent: spent } = calculateBudgetStatus(project);
          const over = percentage > 100;
          return (
            <Card key={project._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium">
                    {project.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{spent.toLocaleString()} / ₹{project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={cn("text-sm font-semibold flex items-center gap-1", over ? "text-destructive" : "text-foreground")}>
                  {over && <AlertTriangle className="h-3.5 w-3.5" />}
                  {percentage.toFixed(0)}%
                </div>
              </div>
              <Progress
                value={Math.min(percentage, 100)}
                className={cn("h-2", over && "[&>div]:bg-destructive")}
              />
              <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                <span>Remaining: ₹{remaining.toLocaleString()}</span>
                <Badge variant="secondary" className="font-normal capitalize">{project.status}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}