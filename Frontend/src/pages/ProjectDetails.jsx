import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Eye, MapPin, IndianRupee, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }
  if (!project) return null;

  const percentUsed = project.budget > 0 ? Math.round((project.totalSpent / project.budget) * 100) : 0;
  const over = percentUsed > 100;
  const remaining = (project.budget || 0) - (project.totalSpent || 0);

  const statusStyles = {
    active: "bg-accent-soft text-accent-soft-foreground",
    completed: "bg-secondary text-secondary-foreground",
    "on-hold": "bg-warning-soft text-warning-soft-foreground",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={project.name}
        description={project.location && `📍 ${project.location}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
          <Badge className={cn("font-normal capitalize mt-1", statusStyles[project.status] || "")}>
            {project.status}
          </Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Budget</p>
          <p className="text-xl font-semibold flex items-center gap-1"><IndianRupee className="h-4 w-4" />{project.budget?.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Spent</p>
          <p className={cn("text-xl font-semibold", over && "text-destructive")}>₹{(project.totalSpent || 0).toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Remaining</p>
          <p className={cn("text-xl font-semibold", remaining < 0 ? "text-destructive" : "text-accent")}>₹{remaining.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm font-medium">Budget utilization</p>
            <p className="text-xs text-muted-foreground">{percentUsed}% used</p>
          </div>
          <span className={cn("text-sm font-semibold", over ? "text-destructive" : "text-foreground")}>{percentUsed}%</span>
        </div>
        <Progress value={Math.min(percentUsed, 100)} className={cn("h-3", over && "[&>div]:bg-destructive")} />
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate('/expenses/new', { state: { projectId: project._id } })}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
        <Button variant="outline" onClick={() => navigate(`/expenses?project=${project._id}`)}>
          <Eye className="h-4 w-4" /> View All Expenses
        </Button>
      </div>
    </div>
  );
}
