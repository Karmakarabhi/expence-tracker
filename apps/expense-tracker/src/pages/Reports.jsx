import { useState, useEffect } from "react";
import api from "@finlight/shared";
import { toast } from "react-hot-toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@finlight/ui";
import { Button } from "@finlight/ui";
import { Badge } from "@finlight/ui";
import { Progress } from "@finlight/ui";
import { Skeleton } from "@finlight/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@finlight/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@finlight/ui";
import { Input } from "@finlight/ui";
import {
  FileDown, FileSpreadsheet, BarChart3, PieChart, Users,
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, Clock,
  Receipt, AlertTriangle,
} from "lucide-react";

// ─── Utility ──────────────────────────────────────────────
const fmt = (n) =>
  `₹${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Supplier Report View ─────────────────────────────────
function SupplierReport({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payout modal state
  const [payoutSupplier, setPayoutSupplier] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [loadingPayout, setLoadingPayout] = useState(false);

  const fetchSupplierReport = async () => {
    try {
      const res = await api.get("/reports/supplier");
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load supplier report");
    }
  };

  const submitPayout = async () => {
    const amt = Number(payoutAmount);
    if (!payoutSupplier || !amt || amt <= 0) return;

    try {
      setLoadingPayout(true);
      const res = await api.post("/expenses/payout", {
        supplierName: payoutSupplier._id,
        amount: amt,
      });
      toast.success(res.data.message || `Recorded payment of ${fmt(amt)}`);
      await fetchSupplierReport();
      setPayoutSupplier(null);
      setPayoutAmount("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit payout");
    } finally {
      setLoadingPayout(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSupplierReport();
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Card className="p-10 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No supplier data found. Add expenses with supplier names to see this report.</p>
        </Card>
      </div>
    );
  }

  const grandTotal = data.reduce((s, d) => s + d.totalAmount, 0);
  const totalPaid = data.reduce((s, d) => s + d.paidAmount, 0);
  const totalPending = data.reduce((s, d) => s + d.pendingAmount, 0);
  const totalCount = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Supplier Summary</h2>
          <p className="text-sm text-muted-foreground">Spending breakdown by vendor / contractor</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-info-soft flex items-center justify-center">
              <Users className="h-4 w-4 text-info-soft-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suppliers</p>
              <p className="text-xl font-semibold">{data.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Spent</p>
              <p className="text-xl font-semibold">{fmt(grandTotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent-soft flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-accent-soft-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paid</p>
              <p className="text-xl font-semibold">{fmt(totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-warning-soft flex items-center justify-center">
              <Clock className="h-4 w-4 text-warning-soft-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="text-xl font-semibold">{fmt(totalPending)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Supplier table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Supplier Name</TableHead>
              <TableHead className="text-center">Transactions</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead className="w-32">Share</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((supplier, idx) => {
              const share = grandTotal > 0 ? (supplier.totalAmount / grandTotal) * 100 : 0;
              return (
                <TableRow key={supplier._id}>
                  <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold uppercase">
                        {supplier._id?.charAt(0) || "?"}
                      </div>
                      <span className="font-medium">{supplier._id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{supplier.count}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{fmt(supplier.totalAmount)}</TableCell>
                  <TableCell className="text-right text-accent-soft-foreground">{fmt(supplier.paidAmount)}</TableCell>
                  <TableCell className="text-right">
                    {supplier.pendingAmount > 0 ? (
                      <span className="text-warning-soft-foreground font-medium">{fmt(supplier.pendingAmount)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={share} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{share.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {supplier.pendingAmount > 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPayoutSupplier(supplier);
                          setPayoutAmount(supplier.pendingAmount.toString());
                        }}
                        className="text-xs h-7 px-2 border-warning-soft text-warning-soft-foreground hover:bg-warning-soft hover:text-warning-soft-foreground"
                      >
                        Payout
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="bg-accent-soft text-accent-soft-foreground hover:bg-accent-soft text-xs font-normal">
                        Paid
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">
          Total: {totalCount} transactions across {data.length} suppliers
        </div>
      </Card>

      {/* Payout dialog modal */}
      {payoutSupplier && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Record Payout</h3>
                <p className="text-sm text-muted-foreground">Apply payment to pending invoices for this supplier.</p>
              </div>

              <div className="space-y-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-semibold">{payoutSupplier._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pending:</span>
                  <span className="font-semibold text-warning-soft-foreground">{fmt(payoutSupplier.pendingAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payout Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="pl-7"
                    max={payoutSupplier.pendingAmount}
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPayoutSupplier(null)}>Cancel</Button>
                <Button onClick={submitPayout} disabled={!payoutAmount || Number(payoutAmount) <= 0 || loadingPayout}>
                  {loadingPayout ? "Processing..." : "Submit Payment"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Monthly Report View ──────────────────────────────────
function MonthlyReport({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear().toString());
  const [month, setMonth] = useState((now.getMonth() + 1).toString());

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/monthly", { params: { year, month } });
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [year, month]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold tracking-tight">Monthly Report</h2>
          <p className="text-sm text-muted-foreground">Daily and category spending breakdown</p>
        </div>
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.slice(1).map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((offset) => {
                const y = now.getFullYear() - offset;
                return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Spent</p>
          <p className="text-2xl font-semibold mt-1">{fmt(data?.totalAmount)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entries</p>
          <p className="text-2xl font-semibold mt-1">{data?.totalEntries || 0}</p>
        </Card>
        <Card className="p-5 col-span-2 lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Average</p>
          <p className="text-2xl font-semibold mt-1">
            {fmt(data?.totalEntries > 0 ? data.totalAmount / (data.dailyBreakdown?.length || 1) : 0)}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Daily breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Daily Breakdown</h3>
          {data?.dailyBreakdown?.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No data for this month</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data?.dailyBreakdown?.map((d) => {
                const pct = data.totalAmount > 0 ? (d.total / data.totalAmount) * 100 : 0;
                return (
                  <div key={d._id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">
                      {MONTH_NAMES[parseInt(month)]} {d._id}
                    </span>
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-24 text-right">{fmt(d.total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Category breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Category Breakdown</h3>
          {data?.categoryBreakdown?.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No data for this month</p>
          ) : (
            <div className="space-y-3">
              {data?.categoryBreakdown?.map((cat) => {
                const pct = data.totalAmount > 0 ? (cat.total / data.totalAmount) * 100 : 0;
                return (
                  <div key={cat._id || cat.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat.icon} {cat.name}</span>
                      <span className="font-semibold">{fmt(cat.total)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Supplier breakdown (included in monthly report) */}
      {data?.supplierBreakdown?.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top Suppliers This Month</h3>
          <div className="space-y-2">
            {data.supplierBreakdown.map((s) => {
              const pct = data.totalAmount > 0 ? (s.total / data.totalAmount) * 100 : 0;
              return (
                <div key={s._id} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded bg-secondary flex items-center justify-center text-xs font-bold uppercase shrink-0">
                    {s._id?.charAt(0) || "?"}
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{s._id}</span>
                  <span className="text-xs text-muted-foreground">{s.count} items</span>
                  <Progress value={pct} className="h-2 w-20" />
                  <span className="text-sm font-semibold w-24 text-right">{fmt(s.total)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Category Report View ─────────────────────────────────
function CategoryReport({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/reports/category");
        setData(res.data.data);
      } catch (err) {
        toast.error("Failed to load category report");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
      </div>
    );
  }

  if (!data || !data.categories?.length) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Card className="p-10 text-center">
          <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No category data found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Category Distribution</h2>
          <p className="text-sm text-muted-foreground">Where your money goes</p>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Grand Total</h3>
          <span className="text-xl font-semibold">{fmt(data.grandTotal)}</span>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Avg</TableHead>
              <TableHead className="text-right">Min</TableHead>
              <TableHead className="text-right">Max</TableHead>
              <TableHead className="w-40">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.categoryIcon}</span>
                    <span className="font-medium">{cat.categoryName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{cat.count}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{fmt(cat.totalAmount)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmt(cat.avgAmount)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmt(cat.minAmount)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{fmt(cat.maxAmount)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={cat.percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-10 text-right">{cat.percentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ─── Main Reports Page ────────────────────────────────────
export default function Reports() {
  const [activeReport, setActiveReport] = useState(null);

  const handleExportPDF = () => {
    window.open(`http://localhost:5000/api/reports/export/pdf`);
  };

  const handleExportExcel = () => {
    window.open(`http://localhost:5000/api/reports/export/excel`);
  };

  const reportTypes = [
    {
      id: "monthly",
      name: "Monthly Expenses",
      description: "Breakdown of spending by month with daily and category splits",
      icon: BarChart3,
      accent: "bg-info-soft text-info-soft-foreground",
    },
    {
      id: "category",
      name: "Category Distribution",
      description: "Where your money goes — totals, averages, and share per category",
      icon: PieChart,
      accent: "bg-accent-soft text-accent-soft-foreground",
    },
    {
      id: "supplier",
      name: "Supplier Summary",
      description: "Top vendors and contractors with paid/pending breakdown",
      icon: Users,
      accent: "bg-warning-soft text-warning-soft-foreground",
    },
  ];

  // Render active report view
  if (activeReport === "supplier") {
    return (
      <div className="max-w-5xl mx-auto">
        <SupplierReport onBack={() => setActiveReport(null)} />
      </div>
    );
  }
  if (activeReport === "monthly") {
    return (
      <div className="max-w-5xl mx-auto">
        <MonthlyReport onBack={() => setActiveReport(null)} />
      </div>
    );
  }
  if (activeReport === "category") {
    return (
      <div className="max-w-5xl mx-auto">
        <CategoryReport onBack={() => setActiveReport(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Reports"
        description="Generate & export analytical reports."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button size="sm" onClick={handleExportExcel} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className="p-6 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
            onClick={() => setActiveReport(report.id)}
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${report.accent}`}>
              <report.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{report.name}</h3>
            <p className="text-sm text-muted-foreground">{report.description}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-10 text-center">
        <p className="text-muted-foreground text-sm">
          Select a report type above to generate charts and statistics.
          <br />
          Export portfolio reports using the PDF / Excel buttons.
        </p>
      </Card>
    </div>
  );
}