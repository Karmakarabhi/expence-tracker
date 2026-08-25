import { useState, useEffect, useCallback } from "react";
import api from "@finlight/shared";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@finlight/ui";
import { Button } from "@finlight/ui";
import { Input } from "@finlight/ui";
import { Badge } from "@finlight/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@finlight/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@finlight/ui";
import { Search, Plus, Download, Filter, Users, X, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkSupplierName, setBulkSupplierName] = useState("");

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCat !== "all") params.categoryId = selectedCat;
      if (selectedSupplier !== "all") params.supplierName = selectedSupplier;
      if (selectedStatus !== "all") params.paymentStatus = selectedStatus;
      params.limit = 100;

      const res = await api.get("/expenses", { params });
      setExpenses(res.data.data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCat, selectedSupplier, selectedStatus]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/flat");
      setCategories(res.data.data);
    } catch (err) {
      // safe to fail
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/reports/supplier");
      const supplierNames = (res.data.data || []).map((s) => s._id).filter(Boolean);
      setSuppliers(supplierNames);
    } catch (err) {
      // safe to fail — supplier report endpoint might not be available
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // Debounced fetch on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchExpenses]);

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

  const handleSupplierSave = async (id) => {
    const trimmed = editValue.trim();
    try {
      await api.put(`/expenses/${id}`, { supplierName: trimmed });
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? { ...exp, supplierName: trimmed } : exp))
      );
      // Refresh suppliers list to include the newly typed one
      fetchSuppliers();
      toast.success("Supplier updated successfully");
    } catch (err) {
      toast.error("Failed to update supplier");
    } finally {
      setEditingId(null);
    }
  };

  const handleBulkSupplierApply = async () => {
    const trimmed = bulkSupplierName.trim();
    if (!trimmed || selectedIds.length === 0) return;

    try {
      const res = await api.put("/expenses/bulk-update", {
        ids: selectedIds,
        supplierName: trimmed
      });
      toast.success(res.data.message || `Assigned supplier to ${selectedIds.length} expenses.`);
      setExpenses((prev) =>
        prev.map((exp) =>
          selectedIds.includes(exp._id) ? { ...exp, supplierName: trimmed } : exp
        )
      );
      setSelectedIds([]);
      setBulkSupplierName("");
      fetchSuppliers(); // Refresh filter options
    } catch (err) {
      toast.error("Failed to batch update expenses.");
    }
  };

  const activeFilterCount = [selectedCat, selectedSupplier, selectedStatus].filter(v => v !== "all").length;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCat("all");
    setSelectedSupplier("all");
    setSelectedStatus("all");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Expenses"
        description={`${expenses.length} transactions`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button asChild size="sm"><Link to="/expenses/new"><Plus className="h-4 w-4" /> Add</Link></Button>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by item, supplier, notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={selectedCat} onValueChange={setSelectedCat}>
              <SelectTrigger className="sm:w-48">
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

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="sm:w-48">
                <Users className="h-4 w-4" />
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {selectedIds.length > 0 && (
        <Card className="p-4 mb-4 bg-accent-soft border border-accent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Badge className="bg-accent text-accent-foreground font-semibold px-2 py-0.5">
              {selectedIds.length} selected
            </Badge>
            <span className="text-sm font-medium text-accent-soft-foreground">
              Bulk update supplier name
            </span>
          </div>
          <div className="flex flex-1 sm:justify-end items-center gap-3 w-full sm:w-auto">
            <Input
              placeholder="Enter supplier name..."
              value={bulkSupplierName}
              onChange={(e) => setBulkSupplierName(e.target.value)}
              className="max-w-xs bg-background h-9"
            />
            <Button size="sm" onClick={handleBulkSupplierApply} disabled={!bulkSupplierName.trim()}>
              Apply Supplier
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading expenses...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-ring h-4 w-4 cursor-pointer"
                    checked={expenses.length > 0 && selectedIds.length === expenses.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(expenses.map((exp) => exp._id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No expenses found. Click 'Add' to create one.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => (
                  <TableRow key={exp._id} className={selectedIds.includes(exp._id) ? "bg-muted/30" : ""}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-ring h-4 w-4 cursor-pointer"
                        checked={selectedIds.includes(exp._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, exp._id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== exp._id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(exp.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{exp.projectId?.name || "N/A"}</TableCell>
                    <TableCell>
                      <p className="font-medium">{exp.itemName}</p>
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:bg-muted/50 group/cell min-w-[140px] relative transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(exp._id);
                        setEditValue(exp.supplierName || "");
                      }}
                    >
                      {editingId === exp._id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSupplierSave(exp._id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSupplierSave(exp._id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full text-sm px-2 py-1 border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          {exp.supplierName ? (
                            <span className="text-sm font-medium">{exp.supplierName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Click to add...</span>
                          )}
                          <Edit2 className="h-3.5 w-3.5 opacity-0 group-hover/cell:opacity-40 hover:!opacity-100 transition-opacity text-muted-foreground shrink-0" />
                        </div>
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
      {!loading && expenses.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {expenses.length} expenses
        </div>
      )}
    </div>
  );
}
