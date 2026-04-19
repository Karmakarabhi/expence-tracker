import { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import CreateProfileModal from '../../components/portfolio/CreateProfileModal';
import { getPortfolioAnalytics } from '../../api/transactionApi';
import { getHoldings } from '../../api/portfolioApi';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatPct } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Wallet, TrendingUp, Target, Plus, AlertTriangle, PieChart, Presentation } from 'lucide-react';

const PortfolioDashboard = () => {
    const { activePortfolio, loading, portfolios } = useContext(PortfolioContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [fetchingData, setFetchingData] = useState(false);
    const [holdings, setHoldings] = useState([]);

    useEffect(() => {
        if (activePortfolio) {
            setFetchingData(true);
            getPortfolioAnalytics(activePortfolio._id)
                .then(res => setAnalytics(res.data))
                .catch(err => console.error("Error fetching analytics", err));
            getHoldings(activePortfolio._id)
                .then(res => setHoldings(res.data || []))
                .catch(err => console.error("Error fetching holdings", err))
                .finally(() => setFetchingData(false));
        }
    }, [activePortfolio]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
                </div>
            </div>
        );
    }

    if (!activePortfolio) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <Card className="p-10 text-center">
                    <Presentation className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold mb-2">Welcome to Investments</h1>
                    <p className="text-muted-foreground mb-6">
                        You don't have any investment portfolios yet. Create one to get started tracking your assets.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4" /> Create Portfolio
                    </Button>
                    <CreateProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                </Card>
            </div>
        );
    }

    const { invested = 0, current = 0, absoluteGain = 0, gainPercent = 0 } = analytics || {};
    const isPositiveGain = absoluteGain >= 0;

    const upcomingMaturities = holdings.filter(h => {
        if (!h.maturityDate) return false;
        const daysLeft = (new Date(h.maturityDate) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft > 0 && daysLeft <= 90;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Portfolio Summary"
                description={<>Currently viewing <span className="font-semibold text-foreground">{activePortfolio.name}</span> profile</>}
                actions={
                    <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4" /> New Portfolio
                    </Button>
                }
            />

            {upcomingMaturities.length > 0 && (
                <Card className="p-4 border-warning/30 bg-warning-soft">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-warning-soft-foreground" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-warning-soft-foreground">
                                {upcomingMaturities.length} {upcomingMaturities.length === 1 ? 'Asset' : 'Assets'} Maturing Soon
                            </h3>
                            <p className="text-xs text-warning-soft-foreground/80 mt-0.5">
                                {upcomingMaturities.map(m => {
                                    const days = Math.ceil((new Date(m.maturityDate) - new Date()) / (1000 * 60 * 60 * 24));
                                    return `${m.name} in ${days} days (₹${(m.units * m.avgCost).toLocaleString('en-IN')})`;
                                }).join(', ')}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    label="Total Invested"
                    value={fetchingData ? "..." : formatCurrency(invested)}
                    icon={Wallet}
                />
                <MetricCard
                    label="Current Value"
                    value={fetchingData ? "..." : formatCurrency(current)}
                    icon={TrendingUp}
                    accent="success"
                />
                <MetricCard
                    label="Gain / Loss"
                    value={fetchingData ? "..." : `${isPositiveGain ? '+' : '-'}${formatCurrency(Math.abs(absoluteGain))}`}
                    delta={gainPercent}
                    accent={isPositiveGain ? "success" : "warning"}
                    icon={Target}
                />
            </div>

            <Card className="p-6 bg-gradient-to-r from-secondary to-secondary/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Dive Deeper into Your Analytics</h3>
                        <p className="text-sm text-muted-foreground max-w-lg">
                            Navigate to your Analytics Board to view rich visual data including Asset Allocation Charts,
                            Market Capitalization distributions, XIRR calculations, and dynamic goal tracking.
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/portfolio/analytics">
                            <PieChart className="h-4 w-4" /> View Analytics
                        </Link>
                    </Button>
                </div>
            </Card>

            <CreateProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PortfolioDashboard;
