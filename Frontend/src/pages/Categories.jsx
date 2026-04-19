import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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

  useEffect(() => { fetchCategories(); }, []);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading categories...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Categories"
        description="Organize your spending."
        actions={
          <>
            {categories.length === 0 && (
              <Button variant="outline" size="sm" onClick={seedCategories}>Seed Defaults</Button>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4" /> New category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Permits" />
                  </div>
                  <div className="space-y-2">
                    <Label>Emoji Icon</Label>
                    <Input value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} placeholder="e.g. 📄" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Category description..." />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No categories found. Add your first category or seed the defaults.</p>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category._id} className="p-5 group hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                    {category.icon || '📁'}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.subcategories?.length || 0} subcategories</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {category.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}