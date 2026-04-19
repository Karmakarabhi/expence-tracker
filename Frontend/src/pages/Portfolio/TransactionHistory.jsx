import { useState, useEffect, useContext } from 'react';
import { PortfolioContext } from '../../context/PortfolioContext';
import { getTransactionsByPortfolio, deleteTransaction } from '../../api/transactionApi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Trash2, Filter } from 'lucide-react';

const typeStyles = {
    BUY: "bg-info-soft text-info-soft-foreground",
    SIP: "bg-accent-soft text-accent-soft-foreground",
    DIVIDEND: "bg-accent-soft text-accent-soft-foreground",
    SELL: "bg-destructive-soft text-destructive-soft-foreground",
    SWITCH_IN: "bg-info-soft text-info-soft-foreground",
    SWITCH_OUT: "bg-warning-soft text-warning-soft-foreground",
};

const TransactionHistory = () => {
    const { activePortfolio } = useContext(PortfolioContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        if (activePortfolio) fetchTransactions(activePortfolio._id);
    }, [activePortfolio]);

    const fetchTransactions = async (portfolioId) => {
        try {
            setLoading(true);
            const res = await getTransactionsByPortfolio(portfolioId);
            setTransactions(res.data || []);
        } catch (error) {
            console.error("Failed to fetch tx", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this transaction? It will automatically recalculate the holding units and average cost.')) {
            try {
                await deleteTransaction(id);
                fetchTransactions(activePortfolio._id);
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (!activePortfolio) return <Card className="p-8 text-center text-muted-foreground">Select a portfolio</Card>;

    const filtered = transactions.filter(t => typeFilter === "all" || t.type === typeFilter);

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            <PageHeader
                title="Transaction History"
                description="Buy, sell and SIP order history."
            />

            <Card className="p-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="md:w-56">
                        <Filter className="h-4 w-4" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="SIP">SIP</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                        <SelectItem value="DIVIDEND">Dividend</SelectItem>
                        <SelectItem value="SWITCH_IN">Switch In</SelectItem>
                        <SelectItem value="SWITCH_OUT">Switch Out</SelectItem>
                    </SelectContent>
                </Select>
            </Card>

            <Card>
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading history...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No transactions recorded yet.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Units</TableHead>
                                <TableHead className="text-right">NAV</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((tx) => (
                                <TableRow key={tx._id}>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(tx.date)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("font-normal", typeStyles[tx.type] || "bg-secondary text-secondary-foreground")}>
                                            {tx.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {['SELL', 'SWITCH_OUT'].includes(tx.type) ? '-' : '+'}{tx.units.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">₹{tx.nav.toFixed(2)}</TableCell>
                                    <TableCell className={cn("text-right tabular-nums font-semibold", tx.type === 'SELL' ? "text-destructive" : "text-foreground")}>
                                        {tx.type === 'SELL' ? '−' : '+'}{formatCurrency(tx.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(tx._id)}>
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};

export default TransactionHistory;