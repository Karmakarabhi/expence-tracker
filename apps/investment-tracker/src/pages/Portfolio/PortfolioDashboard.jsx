import { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import CreateProfileModal from '../../components/portfolio/CreateProfileModal';
import { getPortfolioAnalytics } from "@finlight/api-client";
import { getHoldings } from "@finlight/api-client";
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button, Badge, MetricCard, Progress, Skeleton } from "@finlight/ui";
import { formatCurrency, formatPct } from "@finlight/shared";
import { cn } from "@finlight/shared";
import { Wallet, TrendingUp, Target, Plus, AlertTriangle, PieChart, Presentation, Brain } from 'lucide-react';

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

            {/* CTA cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 bg-gradient-to-r from-secondary to-secondary/50">
                    <div className="flex flex-col h-full gap-4">
                        <div>
                            <h3 className="text-base font-semibold mb-1">Portfolio Analytics</h3>
                            <p className="text-sm text-muted-foreground">
                                Asset allocation charts, cap distribution, XIRR, and goal tracking.
                            </p>
                        </div>
                        <Button asChild className="w-full sm:w-auto mt-auto">
                            <Link to="/analytics">
                                <PieChart className="h-4 w-4" /> View Analytics
                            </Link>
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
                    <div className="flex flex-col h-full gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-semibold">Portfolio Intelligence</h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">AI Explained</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Get AI-powered rebalancing analysis, concentration alerts, and plain-English insights.
                            </p>
                        </div>
                        <Button asChild className="w-full sm:w-auto mt-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                            <Link to="/analytics">
                                <Brain className="h-4 w-4" /> Run Portfolio Review
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>

            <CreateProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default PortfolioDashboard;
