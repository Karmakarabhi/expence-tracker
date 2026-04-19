import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
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

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading form...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Add expense" description="Record a new transaction." />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={formData.projectId} onValueChange={(v) => handleSelectChange('projectId', v)}>
                <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId} onValueChange={(v) => handleSelectChange('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name / Description</Label>
            <Input id="itemName" name="itemName" required value={formData.itemName} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" required min="1" step="0.01" value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate / Unit Price</Label>
              <Input id="rate" name="rate" type="number" required min="0" step="0.01" value={formData.rate} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="flex h-10 w-full items-center rounded-md border bg-muted px-3 text-sm font-semibold">
                ₹{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.rate) || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={formData.paymentStatus} onValueChange={(v) => handleSelectChange('paymentStatus', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/expenses')}>Cancel</Button>
            <Button type="submit">Save expense</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}