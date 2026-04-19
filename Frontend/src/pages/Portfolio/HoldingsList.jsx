import { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { getHoldings, deleteHolding } from '../../api/portfolioApi';
import { refreshPortfolioPrices } from '../../api/mfApi';
import TransactionModal from '../../components/portfolio/TransactionModal';
import AddHoldingModal from '../../components/portfolio/AddHoldingModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { Plus, RefreshCw, Trash2, FileText, Search } from 'lucide-react';

const HoldingsList = () => {
    const { activePortfolio } = useContext(PortfolioContext);
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedHoldingForTx, setSelectedHoldingForTx] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (activePortfolio) fetchHoldings(activePortfolio._id);
    }, [activePortfolio]);

    const fetchHoldings = async (portfolioId) => {
        try {
            setLoading(true);
            const res = await getHoldings(portfolioId);
            setHoldings(res.data || []);
        } catch (error) {
            console.error("Failed to fetch holdings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (holdingId) => {
        if (!window.confirm("Are you sure you want to delete this holding? This will permanently remove all associated transactions.")) return;
        try {
            await deleteHolding(holdingId);
            fetchHoldings(activePortfolio._id);
        } catch (error) {
            console.error("Failed to delete holding", error);
            alert("Error deleting holding. Please try again.");
        }
    };

    const handleRefreshPrices = async () => {
        try {
            setRefreshing(true);
            await refreshPortfolioPrices(activePortfolio._id);
            await fetchHoldings(activePortfolio._id);
        } catch (error) {
            console.error("Failed to refresh prices", error);
        } finally {
            setRefreshing(false);
        }
    };

    if (!activePortfolio) {
        return <Card className="p-8 text-center text-muted-foreground">Select a portfolio to view holdings</Card>;
    }

    const filtered = holdings.filter(h =>
        (h.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            <PageHeader
                title="Holdings"
                description={`${filtered.length} active holdings`}
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={handleRefreshPrices} disabled={refreshing}>
                            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                            {refreshing ? 'Updating…' : 'Refresh NAV'}
                        </Button>
                        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="h-4 w-4" /> Add Holding
                        </Button>
                    </>
                }
            />

            <Card className="p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search holdings…"
                        className="pl-9"
                    />
                </div>
            </Card>

            <Card>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading holdings...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No investments found in this portfolio.</p>
                        <p className="text-sm mt-2">Click "Add Holding" to start tracking.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fund</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Units</TableHead>
                                <TableHead className="text-right">Avg Cost</TableHead>
                                <TableHead className="text-right">Current NAV</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead className="text-right">Returns</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((holding) => {
                                const value = holding.units * holding.currentNav;
                                const invested = holding.units * holding.avgCost;
                                const returnsPct = invested > 0 ? ((value - invested) / invested) * 100 : 0;
                                return (
                                    <TableRow key={holding._id}>
                                        <TableCell>
                                            <p className="font-medium">{holding.name}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">{holding.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{holding.units.toFixed(2)}</TableCell>
                                        <TableCell className="text-right tabular-nums">₹{holding.avgCost.toFixed(2)}</TableCell>
                                        <TableCell className="text-right tabular-nums">₹{holding.currentNav.toFixed(2)}</TableCell>
                                        <TableCell className="text-right tabular-nums font-medium">{formatCurrency(value)}</TableCell>
                                        <TableCell className={cn("text-right tabular-nums font-semibold", returnsPct >= 0 ? "text-accent" : "text-destructive")}>
                                            {returnsPct >= 0 ? '+' : ''}{returnsPct.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedHoldingForTx(holding)} title="Add Transaction">
                                                    <FileText className="h-3.5 w-3.5 text-accent" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(holding._id)} title="Delete">
                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <TransactionModal
                isOpen={!!selectedHoldingForTx}
                holding={selectedHoldingForTx}
                onClose={() => setSelectedHoldingForTx(null)}
                onSuccess={() => fetchHoldings(activePortfolio._id)}
            />
            <AddHoldingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => fetchHoldings(activePortfolio._id)}
            />
        </div>
    );
};

export default HoldingsList;