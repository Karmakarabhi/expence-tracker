import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "@finlight/shared";
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from "@finlight/ui";
import { Button } from "@finlight/ui";
import { Input } from "@finlight/ui";
import { Label } from "@finlight/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@finlight/ui";
import AttachmentUpload from '@/components/common/AttachmentUpload';

export default function AddExpense() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdExpenseId, setCreatedExpenseId] = useState(null);

  const [formData, setFormData] = useState({
    projectId: '',
    categoryId: '',
    itemName: '',
    supplierName: '',
    quantity: 1,
    unit: 'pieces',
    rate: '',
    date: new Date().toISOString().split('T')[0],
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    notes: '',
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
      setSubmitting(true);
      const response = await api.post('/expenses', formData);
      const expenseId = response.data.data._id;
      setCreatedExpenseId(expenseId);
      toast.success('Expense created! Now you can upload an invoice (optional)');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading form...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Add expense" description="Record a new transaction." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
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

              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier / Provider</Label>
                <Input id="supplierName" name="supplierName" placeholder="e.g. vendor, contractor, broker name" value={formData.supplierName} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" required min="0" step="0.01" value={formData.quantity} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={formData.unit} onValueChange={(v) => handleSelectChange('unit', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pieces','kg','bags','sqft','sqm','cft','rft','liters','tons','trips','days','hours','boxes','bundles','rolls','sheets','sets','units','other'].map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(v) => handleSelectChange('paymentMethod', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" name="notes" placeholder="Any additional notes…" value={formData.notes} onChange={handleChange} />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/expenses')}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save expense'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Upload Section - Appears on the Right When Expense is Created */}
        {createdExpenseId && (
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold text-base mb-4">📎 Upload Invoice</h3>
              <p className="text-xs text-muted-foreground mb-4">Optional: Attach invoice or receipt to this expense</p>
              <AttachmentUpload
                relatedModel="Expense"
                relatedId={createdExpenseId}
                category="purchase_invoice"
                onUploadSuccess={() => {
                  toast.success('Invoice uploaded!');
                }}
              />
              <Button 
                onClick={() => {
                  setCreatedExpenseId(null);
                  setFormData({
                    projectId: '',
                    categoryId: '',
                    itemName: '',
                    supplierName: '',
                    quantity: 1,
                    unit: 'pieces',
                    rate: '',
                    date: new Date().toISOString().split('T')[0],
                    paymentStatus: 'paid',
                    paymentMethod: 'cash',
                    notes: '',
                  });
                }}
                className="w-full mt-4"
                variant="outline"
              >
                Add Another Expense
              </Button>
              <Button 
                onClick={() => navigate('/expenses')}
                className="w-full mt-2"
                variant="ghost"
              >
                Go to Expenses List
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}