# Supplier Settlement System - Usage Examples

## Real-World Scenario: Rounak Enterprise

### Setup
You have a supplier "Rounak Enterprise" and have created 4 expense records:
1. Jan 5: Goods ₹40,000 (Invoice #ROU001)
2. Jan 10: Services ₹35,000 (Invoice #ROU002)
3. Jan 15: Materials ₹20,000 (Invoice #ROU003)
4. Jan 20: Repairs ₹5,000 (Invoice #ROU004)

**Total Outstanding: ₹1,00,000**

---

## Scenario 1: Record First Partial Payment

**Action:** Record payment of ₹25,000 on Jan 25

### Frontend Flow
1. Navigate to Sidebar → "Supplier Report"
2. System lists all suppliers in grid format
3. Find "Rounak Enterprise" card showing:
   ```
   Rounak Enterprise
   ─────────────────
   Expenses: ₹1,00,000 (4)
   Settled: ₹0
   Outstanding: ₹1,00,000
   ```
4. Click card → Ledger opens
5. Click "Record Settlement" button
6. Fill form:
   ```
   Settlement Amount: 25000
   Payment Date: 2024-01-25 (today)
   Payment Method: Bank
   Reference Number: TXN-20240125-ROU-001
   Notes: Partial payment for Jan invoices
   ```
7. Click "Record Settlement"

### Backend Flow
```javascript
POST /api/suppliers/settle
Authorization: Bearer eyJhbGc...

{
  "supplierName": "Rounak Enterprise",
  "settledAmount": 25000,
  "paymentDate": "2024-01-25",
  "paymentMethod": "bank",
  "referenceNumber": "TXN-20240125-ROU-001",
  "notes": "Partial payment for Jan invoices",
  "linkedExpenses": []  // optional - can link specific invoice IDs later
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "67a8f3c2b1d4e5f6g7h8i9j0",
    "userId": "user123abc",
    "supplierName": "Rounak Enterprise",
    "settledAmount": 25000,
    "paymentDate": "2024-01-25T00:00:00.000Z",
    "paymentMethod": "bank",
    "referenceNumber": "TXN-20240125-ROU-001",
    "notes": "Partial payment for Jan invoices",
    "linkedExpenses": [],
    "createdAt": "2024-01-25T10:30:00.000Z",
    "updatedAt": "2024-01-25T10:30:00.000Z"
  }
}
```

### UI Update
- Card updates immediately:
  ```
  Rounak Enterprise
  ─────────────────
  Expenses: ₹1,00,000 (4)
  Settled: ₹25,000
  Outstanding: ₹75,000 ← UPDATED
  ```
- Ledger detail shows:
  - Total Expenses: ₹1,00,000 (unchanged)
  - Total Settled: ₹25,000 (changed)
  - Outstanding Balance: ₹75,000 (changed)
- Settlement appears in history:
  ```
  SETTLEMENT HISTORY
  ──────────────────
  ₹25,000
  Jan 25, 2024 • Bank
  Ref: TXN-20240125-ROU-001
  Notes: Partial payment for Jan invoices
  [Delete button]
  ```

---

## Scenario 2: Record Another Partial Payment

**Action:** Record payment of ₹30,000 on Feb 5

### Frontend Flow
1. Back in ledger detail for "Rounak Enterprise"
2. Click "Record Settlement" again
3. Fill form:
   ```
   Settlement Amount: 30000
   Payment Date: 2024-02-05
   Payment Method: UPI
   Reference Number: UPI-ROU-20240205
   Notes: Second payment - Feb settlement
   ```
4. Submit

### Backend Query
```
GET /api/suppliers/ledger/Rounak%20Enterprise

Response:
{
  "success": true,
  "data": {
    "supplierName": "Rounak Enterprise",
    "expenses": [
      { _id, itemName: "Goods", totalAmount: 40000, date: "2024-01-05", ... },
      { _id, itemName: "Services", totalAmount: 35000, date: "2024-01-10", ... },
      { _id, itemName: "Materials", totalAmount: 20000, date: "2024-01-15", ... },
      { _id, itemName: "Repairs", totalAmount: 5000, date: "2024-01-20", ... }
    ],
    "settlements": [
      {
        _id: "67a8f3...",
        settledAmount: 25000,
        paymentDate: "2024-01-25T00:00:00.000Z",
        paymentMethod: "bank",
        referenceNumber: "TXN-20240125-ROU-001",
        notes: "Partial payment for Jan invoices"
      },
      {
        _id: "67a8f4...",
        settledAmount: 30000,
        paymentDate: "2024-02-05T00:00:00.000Z",
        paymentMethod: "upi",
        referenceNumber: "UPI-ROU-20240205",
        notes: "Second payment - Feb settlement"
      }
    ],
    "summary": {
      "totalExpenses": 100000,
      "totalSettled": 55000,    ← UPDATED (25k + 30k)
      "balance": 45000,          ← UPDATED (100k - 55k)
      "expenseCount": 4,
      "settlementCount": 2
    }
  }
}
```

### UI State
```
Ledger Detail View
─────────────────
ROUNAK ENTERPRISE

[Summary Cards]
Total Expenses: ₹1,00,000
Total Settled: ₹55,000
Outstanding Balance: ₹45,000 ← CHANGED

[Download Statement] [Record Settlement]

EXPENSES (4)
─────────────
Date     | Item      | Amount  | Status
---------|-----------|---------|-------
Jan 5    | Goods     | ₹40,000 | Paid
Jan 10   | Services  | ₹35,000 | Paid
Jan 15   | Materials | ₹20,000 | Paid
Jan 20   | Repairs   | ₹5,000  | Paid

SETTLEMENT HISTORY (2)
──────────────────────
₹25,000
Jan 25, 2024 • Bank
Ref: TXN-20240125-ROU-001
Notes: Partial payment for Jan invoices
[Delete]

₹30,000
Feb 5, 2024 • UPI
Ref: UPI-ROU-20240205
Notes: Second payment - Feb settlement
[Delete]
```

---

## Scenario 3: Download Statement

**Action:** Export full supplier statement to CSV

### Frontend Flow
1. In ledger detail for "Rounak Enterprise"
2. Click "Download Statement" button
3. File downloads: `Rounak-Enterprise-statement-2024-02-05.csv`

### CSV Content
```csv
SUPPLIER STATEMENT
Supplier: Rounak Enterprise
Generated: 2/5/2024

SUMMARY
Total Expenses,Total Settled,Outstanding Balance
100000,55000,45000

EXPENSES
Date,Item,Amount,Status
1/5/2024,Goods,"40000",Paid
1/10/2024,Services,"35000",Paid
1/15/2024,Materials,"20000",Paid
1/20/2024,Repairs,"5000",Paid

SETTLEMENTS
Date,Amount,Method,Reference
1/25/2024,"25000",bank,"TXN-20240125-ROU-001"
2/5/2024,"30000",upi,"UPI-ROU-20240205"
```

### Open in Excel
When opened in Excel/Google Sheets:
```
┌──────────────────────────────────────────┐
│ SUPPLIER STATEMENT                       │
│ Supplier: Rounak Enterprise              │
│ Generated: 2/5/2024                      │
├──────────────────────────────────────────┤
│ SUMMARY                                  │
│ Total Expenses    │ Total Settled │ Bal │
│ 100000            │ 55000         │45k  │
├──────────────────────────────────────────┤
│ EXPENSES                                 │
│ Date     │ Item      │ Amount  │ Status │
│ 1/5/2024 │ Goods     │ 40000   │ Paid   │
│ 1/10     │ Services  │ 35000   │ Paid   │
│ ...                                      │
├──────────────────────────────────────────┤
│ SETTLEMENTS                              │
│ Date     │ Amount │ Method │ Reference  │
│ 1/25     │ 25000  │ Bank   │ TXN-01    │
│ 2/5      │ 30000  │ UPI    │ UPI-001   │
└──────────────────────────────────────────┘
```

---

## Scenario 4: Delete Incorrect Settlement

**Action:** Oops, recorded ₹30,000 twice. Delete the second one.

### Frontend Flow
1. In Settlement History section
2. Click [Delete] button next to second ₹30,000 settlement
3. Confirm: "Delete this settlement record?"
4. Click "Delete"

### Backend Flow
```
DELETE /api/suppliers/settlements/67a8f4...
Authorization: Bearer eyJhbGc...

Response 200:
{
  "success": true,
  "message": "Settlement deleted"
}
```

### UI Update
- Settlement removed from history list
- Balance recalculated:
  - Settled: ₹55,000 → ₹25,000
  - Balance: ₹45,000 → ₹75,000
- Summary cards updated

---

## Scenario 5: View All Suppliers Dashboard

**Action:** See complete overview of all supplier spending

### API Call
```
GET /api/suppliers
Authorization: Bearer eyJhbGc...

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "supplierName": "Rounak Enterprise",
      "totalSpent": 100000,
      "totalSettled": 25000,
      "balance": 75000,
      "expenseCount": 4
    },
    {
      "supplierName": "ABC Trading",
      "totalSpent": 50000,
      "totalSettled": 50000,
      "balance": 0,
      "expenseCount": 3
    },
    {
      "supplierName": "XYZ Services",
      "totalSpent": 25000,
      "totalSettled": 0,
      "balance": 25000,
      "expenseCount": 2
    },
    {
      "supplierName": "Logistics Co",
      "totalSpent": 15000,
      "totalSettled": 10000,
      "balance": 5000,
      "expenseCount": 1
    },
    {
      "supplierName": "Office Supplies",
      "totalSpent": 8000,
      "totalSettled": 8000,
      "balance": 0,
      "expenseCount": 5
    }
  ]
}
```

### Frontend Grid Display
```
SUPPLIER REPORT - ALL SUPPLIERS
────────────────────────────────

┌─────────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│ Rounak Enterprise   │ │ ABC Trading     │ │ XYZ Services     │
│ ₹100,000 (4)        │ │ ₹50,000 (3)     │ │ ₹25,000 (2)      │
│                     │ │                 │ │                  │
│ Settled: ₹25,000    │ │ Settled: ₹50k   │ │ Settled: ₹0      │
│ Balance: ₹75,000 🔴 │ │ Balance: ₹0 🟢  │ │ Balance: ₹25k 🔴 │
└─────────────────────┘ └─────────────────┘ └──────────────────┘

┌─────────────────────┐ ┌─────────────────┐
│ Logistics Co        │ │ Office Supplies │
│ ₹15,000 (1)         │ │ ₹8,000 (5)      │
│                     │ │                 │
│ Settled: ₹10,000    │ │ Settled: ₹8k    │
│ Balance: ₹5,000 🟡  │ │ Balance: ₹0 🟢  │
└─────────────────────┘ └─────────────────┘

Total Outstanding Payable: ₹110,000
```

---

## API Cheat Sheet

```bash
# Get all suppliers with balances
curl -X GET http://localhost:5000/api/suppliers \
  -H "Authorization: Bearer TOKEN"

# Get summary for one supplier
curl -X GET "http://localhost:5000/api/suppliers/summary?supplierName=Rounak%20Enterprise" \
  -H "Authorization: Bearer TOKEN"

# Get full ledger
curl -X GET http://localhost:5000/api/suppliers/ledger/Rounak%20Enterprise \
  -H "Authorization: Bearer TOKEN"

# Record settlement
curl -X POST http://localhost:5000/api/suppliers/settle \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierName": "Rounak Enterprise",
    "settledAmount": 25000,
    "paymentDate": "2024-01-25",
    "paymentMethod": "bank",
    "referenceNumber": "TXN-001"
  }'

# Get settlement history
curl -X GET http://localhost:5000/api/suppliers/Rounak%20Enterprise/settlements \
  -H "Authorization: Bearer TOKEN"

# Delete settlement
curl -X DELETE http://localhost:5000/api/suppliers/settlements/SETTLEMENT_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Summary

This system enables you to:
- ✅ Track total spending per supplier
- ✅ Record partial payments as they're made
- ✅ See outstanding balance at a glance
- ✅ View complete payment history
- ✅ Export statements for record-keeping

**Example:** Rounak Enterprise shows ₹1,00,000 spent, after recording ₹25,000 + ₹30,000 payments, balance drops to ₹45,000.
