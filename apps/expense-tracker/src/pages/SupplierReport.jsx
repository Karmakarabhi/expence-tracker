import React, { useState, useEffect } from 'react';
import { api } from '@finlight/api-client';
import { Trash2, Plus, Download } from 'lucide-react';

export default function SupplierReport() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [showSettleForm, setShowSettleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settlementForm, setSettlementForm] = useState({
    settledAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank',
    referenceNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierLedger = async (supplierName) => {
    try {
      setLoading(true);
      const res = await api.get(`/suppliers/ledger/${supplierName}`);
      setLedger(res.data.data);
      setSelectedSupplier(supplierName);
      setShowSettleForm(false);
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettlementChange = (e) => {
    const { name, value } = e.target;
    setSettlementForm({ ...settlementForm, [name]: value });
  };

  const handleRecordSettlement = async (e) => {
    e.preventDefault();
    if (!settlementForm.settledAmount || isNaN(settlementForm.settledAmount) || Number(settlementForm.settledAmount) <= 0) {
      alert('Please enter a valid settled amount');
      return;
    }
    try {
      setLoading(true);
      await api.post('/suppliers/settle', {
        ...settlementForm,
        supplierName: selectedSupplier,
        settledAmount: parseFloat(settlementForm.settledAmount),
      });

      // Refresh data
      await fetchSuppliers();
      await fetchSupplierLedger(selectedSupplier);
      setSettlementForm({
        settledAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank',
        referenceNumber: '',
        notes: '',
      });
      setShowSettleForm(false);
      alert('Settlement recorded successfully!');
    } catch (err) {
      alert('Error recording settlement: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSettlement = async (settlementId) => {
    if (window.confirm('Delete this settlement record?')) {
      try {
        setLoading(true);
        await api.delete(`/suppliers/settlements/${settlementId}`);
        await fetchSupplierLedger(selectedSupplier);
        await fetchSuppliers();
      } catch (err) {
        alert('Error deleting settlement: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadSupplierStatement = () => {
    if (!ledger) return;

    let csv = `SUPPLIER STATEMENT\n`;
    csv += `Supplier: ${ledger.supplierName}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    csv += `SUMMARY\n`;
    csv += `Total Expenses,Total Settled,Outstanding Balance\n`;
    csv += `${ledger.summary.totalExpenses},${ledger.summary.totalSettled},${ledger.summary.balance}\n\n`;

    csv += `EXPENSES\n`;
    csv += `Date,Item,Amount,Status\n`;
    ledger.expenses.forEach((exp) => {
      csv += `${new Date(exp.date).toLocaleDateString()},${exp.itemName},"${exp.totalAmount}",${exp.paymentStatus}\n`;
    });

    csv += `\nSETTLEMENTS\n`;
    csv += `Date,Amount,Method,Reference\n`;
    ledger.settlements.forEach((set) => {
      csv += `${new Date(set.paymentDate).toLocaleDateString()},"${set.settledAmount}",${set.paymentMethod},"${set.referenceNumber || '-'}"\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ledger.supplierName}-statement-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading suppliers...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Supplier Settlements</h1>

      {!selectedSupplier ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Suppliers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.length === 0 ? (
              <p className="text-gray-500">No suppliers found. Create an expense with a supplier name.</p>
            ) : (
              suppliers.map((supplier) => (
                <div
                  key={supplier.supplierName}
                  className="p-4 border rounded-lg hover:shadow-lg cursor-pointer transition"
                  onClick={() => fetchSupplierLedger(supplier.supplierName)}
                >
                  <h3 className="font-semibold text-lg mb-2">{supplier.supplierName}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Expenses:</strong> ₹{supplier.totalSpent.toFixed(2)} ({supplier.expenseCount})
                    </p>
                    <p>
                      <strong>Settled:</strong> ₹{supplier.totalSettled.toFixed(2)}
                    </p>
                    <p className={`font-semibold ${supplier.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Outstanding: ₹{supplier.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setSelectedSupplier(null);
              setLedger(null);
              setShowSettleForm(false);
            }}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Suppliers
          </button>

          {ledger && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{ledger.supplierName}</h2>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Total Expenses</p>
                        <p className="text-xl font-bold">₹{ledger.summary.totalExpenses.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Total Settled</p>
                        <p className="text-xl font-bold text-green-600">₹{ledger.summary.totalSettled.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Outstanding Balance</p>
                        <p className="text-xl font-bold text-red-600">₹{ledger.summary.balance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadSupplierStatement}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Download size={16} />
                    Download Statement
                  </button>
                  <button
                    onClick={() => setShowSettleForm(!showSettleForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Record Settlement
                  </button>
                </div>
              </div>

              {showSettleForm && (
                <form onSubmit={handleRecordSettlement} className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Settlement Amount *</label>
                      <input
                        type="number"
                        name="settledAmount"
                        value={settlementForm.settledAmount}
                        onChange={handleSettlementChange}
                        placeholder="Enter amount"
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Date *</label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={settlementForm.paymentDate}
                        onChange={handleSettlementChange}
                        required
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={settlementForm.paymentMethod}
                        onChange={handleSettlementChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reference Number</label>
                      <input
                        type="text"
                        name="referenceNumber"
                        value={settlementForm.referenceNumber}
                        onChange={handleSettlementChange}
                        placeholder="Cheque #, UPI ref, etc"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={settlementForm.notes}
                      onChange={handleSettlementChange}
                      placeholder="Optional notes"
                      rows="2"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                      Record Settlement
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettleForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Expenses Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Expenses ({ledger.expenses.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.expenses.map((exp, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{exp.itemName}</td>
                          <td className="px-4 py-2 text-right font-medium">₹{exp.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                exp.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {exp.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Settlements Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Settlement History ({ledger.settlements.length})</h3>
                <div className="space-y-2">
                  {ledger.settlements.length === 0 ? (
                    <p className="text-gray-500 text-sm">No settlements recorded yet.</p>
                  ) : (
                    ledger.settlements.map((settlement, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded flex justify-between items-start border">
                        <div>
                          <p className="font-medium">₹{settlement.settledAmount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(settlement.paymentDate).toLocaleDateString()} • {settlement.paymentMethod}
                          </p>
                          {settlement.referenceNumber && (
                            <p className="text-xs text-gray-500">Ref: {settlement.referenceNumber}</p>
                          )}
                          {settlement.notes && <p className="text-xs text-gray-600 mt-1">{settlement.notes}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteSettlement(settlement._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete settlement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
