import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import NetWorthWidget from '../components/dashboard/NetWorthWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Receipt, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/expenses/summary/dashboard');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your money today.</p>
        </div>
        <Button asChild>
          <Link to="/expenses/new">
            <Receipt className="h-4 w-4" /> Add expense
          </Link>
        </Button>
      </div>

      <div className="w-full">
        <NetWorthWidget expenseSummary={{ remaining: data?.totalAmount || 0 }} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total Spent"
          value={`₹${data?.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          deltaLabel={`${data?.totalExpenses || 0} items`}
          icon={Wallet}
          accent="info"
        />
        <MetricCard
          label="This Month"
          value={`₹${data?.monthSpent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={Receipt}
          accent="success"
        />
        <MetricCard
          label="Pending Payments"
          value={`₹${data?.pendingAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          deltaLabel={`${data?.pendingCount || 0} bills`}
          icon={Clock}
          accent="warning"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Expenses</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/expenses">View all <ArrowUpRight className="h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="space-y-1">
            {data?.recentExpenses?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses recorded yet.</p>
            ) : (
              data?.recentExpenses?.slice(0, 5).map((expense) => (
                <div key={expense._id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium">
                      {expense.categoryId?.icon || '📁'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{expense.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.categoryId?.name} · {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">₹{expense.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top Categories</h3>
          <div className="space-y-4">
            {data?.categoryTotals?.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No data available</p>
            ) : (
              data?.categoryTotals?.map((cat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold">₹{cat.total.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}