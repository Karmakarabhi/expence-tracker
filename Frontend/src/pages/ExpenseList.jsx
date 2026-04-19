import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Download, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data.data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/flat");
      setCategories(res.data.data);
    } catch (err) {
      // safe to fail
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/expenses/${id}`, { paymentStatus: newStatus });
      setExpenses(
        expenses.map((exp) =>
          exp._id === id ? { ...exp, paymentStatus: newStatus } : exp
        )
      );
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filtered = expenses.filter((e) => {
    const matchQ = (e.itemName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchC = selectedCat === "all" || e.categoryId?._id === selectedCat;
    return matchQ && matchC;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Expenses"
        description={`${filtered.length} transactions`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button asChild size="sm"><Link to="/expenses/new"><Plus className="h-4 w-4" /> Add</Link></Button>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by item, supplier…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCat} onValueChange={setSelectedCat}>
            <SelectTrigger className="md:w-56">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>{cat.icon} {cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading expenses...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No expenses found. Click 'Add' to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exp) => (
                  <TableRow key={exp._id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(exp.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{exp.projectId?.name || "N/A"}</TableCell>
                    <TableCell>
                      <p className="font-medium">{exp.itemName}</p>
                      {exp.supplierName && (
                        <p className="text-xs text-muted-foreground">from {exp.supplierName}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exp.quantity} {exp.unit} @ ₹{exp.rate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal gap-1.5">
                        {exp.categoryId?.icon} {exp.categoryId?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{exp.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <select
                        value={exp.paymentStatus}
                        onChange={(e) => handleStatusChange(exp._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer focus:outline-none transition-colors ${
                          exp.paymentStatus === "paid"
                            ? "bg-accent-soft text-accent-soft-foreground"
                            : "bg-warning-soft text-warning-soft-foreground"
                        }`}
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      {!loading && filtered.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} expenses
        </div>
      )}
    </div>
  );
}
