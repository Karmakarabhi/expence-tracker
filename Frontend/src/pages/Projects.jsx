import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowUpRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', budget: '', status: 'active' });

  useEffect(() => { fetchProjects(); }, []);

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

  const statusStyles = {
    active: "bg-accent-soft text-accent-soft-foreground",
    completed: "bg-secondary text-secondary-foreground",
    "on-hold": "bg-warning-soft text-warning-soft-foreground",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects`}
        actions={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> New project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Phase 2 Building" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. 123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label>Budget (₹)</Label>
                  <Input required type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} placeholder="50000" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">Create your first project to start tracking expenses.</p>
          <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" /> Create Project</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const percentUsed = project.budget > 0 ? Math.round((project.totalSpent / project.budget) * 100) : 0;
            const over = percentUsed > 100;
            return (
              <Card key={project._id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/projects/${project._id}`)}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {project.location}
                        </p>
                      )}
                    </div>
                    <Badge className={cn("font-normal capitalize", statusStyles[project.status] || "")}>
                      {project.status}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Spent</span>
                      <span className={cn("font-medium", over && "text-destructive")}>
                        ₹{(project.totalSpent || 0).toLocaleString()} / ₹{project.budget?.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={Math.min(percentUsed, 100)} className={cn("h-2", over && "[&>div]:bg-destructive")} />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{percentUsed}% used</p>
                  </div>
                </div>
                <div className="bg-secondary/50 px-5 py-3 flex justify-end">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">
                    View details <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}