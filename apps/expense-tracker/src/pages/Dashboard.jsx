import { useState, useEffect } from 'react';
import { api, formatCurrency, formatDate } from '@finlight/shared';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, Skeleton, MetricCard } from '@finlight/ui';
import { Wallet, Receipt, Clock, Building2, ArrowUpRight } from 'lucide-react';
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Expense Overview</h1>
          <p className="text-sm text-muted-foreground">Monitor operating expenses, project budgets, and vendor settlements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/reports/suppliers">
              <Building2 className="h-4 w-4 mr-1.5" /> Supplier Report
            </Link>
          </Button>
          <Button asChild>
            <Link to="/expenses/new">
              <Receipt className="h-4 w-4 mr-1.5" /> Add expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(data?.totalAmount || 0)}
          icon={Wallet}
          description="Lifetime recorded spend"
        />
        <MetricCard
          title="Total Invoices"
          value={(data?.totalCount || 0).toString()}
          icon={Receipt}
          description="Processed transactions"
        />
        <MetricCard
          title="Pending Payments"
          value={formatCurrency(data?.pendingAmount || 0)}
          icon={Clock}
          description="Awaiting settlement"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Expenses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Expenses</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/expenses">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {data?.recentExpenses?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No expenses recorded yet.</p>
            ) : (
              data?.recentExpenses?.map((exp) => (
                <div key={exp._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exp.date)} · {exp.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-semibold">{formatCurrency(exp.totalAmount)}</p>
                    <Badge variant={exp.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                      {exp.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Top Categories</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/categories">Manage</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {data?.categoryBreakdown?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No category data available.</p>
            ) : (
              data?.categoryBreakdown?.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(cat.amount)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
