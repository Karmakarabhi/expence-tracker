import { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { getTransactionsByPortfolio, getPortfolioAnalytics } from '../../api/transactionApi';
import AssetAllocationChart from '../../components/portfolio/charts/AssetAllocationChart';
import MarketCapChart from '../../components/portfolio/charts/MarketCapChart';
import PerformanceTimeline from '../../components/portfolio/charts/PerformanceTimeline';
import FundWiseTable from '../../components/portfolio/FundWiseTable';
import GoalTracker from '../../components/portfolio/GoalTracker';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { Wallet, TrendingUp, Activity, Target, PieChart, Loader } from 'lucide-react';

export default function PortfolioAnalytics() {
  const { activePortfolio } = usePortfolio();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!activePortfolio) return;
      try {
        setLoading(true);
        const [portfolioData, txsData] = await Promise.all([
          getPortfolioAnalytics(activePortfolio._id),
          getTransactionsByPortfolio(activePortfolio._id)
        ]);
        setData(portfolioData.data);
        setTransactions(txsData.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activePortfolio]);

  if (!activePortfolio) {
    return (
      <Card className="p-12 text-center mt-6 max-w-md mx-auto">
        <PieChart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-1">No Portfolio Selected</h3>
        <p className="text-muted-foreground text-sm">Please select or create a portfolio first.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <Card className="p-4 bg-destructive-soft text-destructive-soft-foreground rounded-lg">{error}</Card>;
  }

  const { totalInvested: invested, currentValue: current, absoluteGain, xirr, holdings } = data || {};
  const isPositiveGain = absoluteGain >= 0;
  const gainPct = invested > 0 ? ((current - invested) / invested) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <PageHeader
        title="Portfolio Analytics"
        description={<>Detailed insights for <span className="font-medium text-foreground">{activePortfolio.name}</span></>}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Invested" value={formatCurrency(invested)} icon={Wallet} />
        <MetricCard label="Current Value" value={formatCurrency(current)} icon={Activity} accent="info" />
        <MetricCard
          label="Absolute Gain"
          value={`${isPositiveGain ? '+' : '-'}${formatCurrency(Math.abs(absoluteGain || 0))}`}
          delta={gainPct}
          accent={isPositiveGain ? "success" : "warning"}
          icon={TrendingUp}
        />
        <MetricCard label="Est. XIRR" value={`${(xirr * 100)?.toFixed(1)}%`} deltaLabel="annualized" icon={Target} accent="success" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AssetAllocationChart holdings={holdings} />
        </div>
        <div className="lg:col-span-1 border border-border rounded-xl">
           <GoalTracker currentValue={current || 0} xirr={xirr || 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketCapChart holdings={holdings} />
      </div>

      {/* Timeline Chart */}
      <div className="w-full">
        <PerformanceTimeline transactions={transactions} />
      </div>

      {/* FundWise Table */}
      <div className="pt-4">
        <FundWiseTable holdings={holdings} xirrData={[]} />
      </div>
    </div>
  );
}
