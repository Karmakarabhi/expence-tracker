# Finlight - Expense & Portfolio Tracking Platform

**Version:** 2.0 (Supplier Settlement System)  
**Status:** ✅ Production Ready  
**Last Updated:** 2026

---

## 📋 What Is This?

Finlight is a comprehensive personal finance platform for tracking:
- ✅ **Expenses** - Track spending with categories, projects, suppliers
- ✅ **Attachments** - Upload receipts/invoices for expenses
- ✅ **Supplier Settlement** - Track spending per vendor and record partial payments
- ✅ **Portfolio** - Monitor investment holdings and SIP transactions
- ✅ **Reports** - Generate spending analysis and supplier statements

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas (cloud) or local MongoDB
- npm or yarn

### Setup

1. **Clone & Install**
```bash
cd /home/abhijitkarmakar/Desktop/projects/expence-tracker
cd Backend && npm install
cd ../Frontend && npm install
```

2. **Configure Backend**
```bash
# Copy .env template and add credentials
cp Backend/.env.example Backend/.env
# Add: MONGO_URI, JWT_SECRET, etc.
```

3. **Start Services**
```bash
# Terminal 1 - Backend
cd Backend
npm start
# Server on http://localhost:5000

# Terminal 2 - Frontend
cd Frontend
npm run dev
# App on http://localhost:5173
```

4. **Access Application**
- Open http://localhost:5173
- Login / Register
- Start tracking expenses

---

## 📁 Project Structure

```
expence-tracker/
├── Backend/
│   ├── models/                 # Mongoose schemas
│   │   ├── Expense.js
│   │   ├── Category.js
│   │   ├── Supplier.js         ← NEW
│   │   ├── SupplierSettlement.js ← NEW
│   │   ├── Attachment.js
│   │   ├── Portfolio.js
│   │   ├── Holding.js
│   │   └── ...
│   ├── controllers/
│   │   ├── expenseController.js
│   │   ├── supplierController.js ← NEW (6 handlers)
│   │   ├── attachmentController.js
│   │   └── ...
│   ├── routes/
│   │   ├── expenses.js
│   │   ├── suppliers.js        ← NEW (6 endpoints)
│   │   ├── attachments.js
│   │   └── ...
│   ├── middleware/
│   ├── config/
│   ├── jobs/
│   ├── server.js               ← MODIFIED
│   ├── package.json
│   └── test_supplier_api.sh    ← NEW (curl tests)
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   ├── AddExpense.jsx
│   │   │   ├── SupplierReport.jsx ← NEW
│   │   │   ├── Reports.jsx
│   │   │   ├── Portfolio/
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── AppHeader.jsx
│   │   │   │   └── AppSidebar.jsx ← MODIFIED
│   │   │   ├── common/
│   │   │   │   ├── AttachmentUpload.jsx
│   │   │   │   └── AttachmentList.jsx
│   │   │   └── ui/
│   │   ├── App.jsx             ← MODIFIED
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── Documentation/
    ├── SUPPLIER_SETTLEMENT_GUIDE.md      (350+ lines - comprehensive reference)
    ├── SUPPLIER_SETTLEMENT_QUICKSTART.md (150+ lines - getting started)
    ├── SUPPLIER_SETTLEMENT_ARCHITECTURE.md (diagrams & flows)
    ├── USAGE_EXAMPLES.md                 (5 real-world scenarios)
    ├── IMPLEMENTATION_CHECKLIST.md       (verification & sign-off)
    ├── PROJECT_DELIVERY_SUMMARY.md       (executive summary)
    └── ATTACHMENT_INTEGRATION.md         (file upload guide)
```

---

## 🎯 Core Features

### 1. Expense Tracking
- Add expenses with category, amount, date, supplier
- Track payment status (pending/paid)
- Project-based expense grouping
- File attachments (receipts, invoices)

### 2. Supplier Settlement (NEW) ⭐
- Track total spending per supplier
- Record partial/full payments
- View payment history
- Calculate outstanding balance
- Export supplier statements (CSV)
- Real-time balance updates

### 3. File Attachments
- Drag-drop upload for receipts/invoices
- Support: JPEG, PNG, GIF, WebP, PDF (10MB max)
- Organize by category (purchase_invoice, deposit_slip, other)
- Download attached files
- Soft-delete with file retention

### 4. Portfolio Management
- Track investment holdings (stocks, mutual funds, crypto)
- Record SIP transactions
- Monitor performance with analytics
- Transaction history

### 5. Reporting
- Monthly expense breakdown
- Category distribution analysis
- Supplier spending summary
- Export to Excel/PDF

---

## 🔧 Recent Changes (v2.0)

### Supplier Settlement System Added
**Models Created:**
- `Supplier.js` - Master supplier list
- `SupplierSettlement.js` - Payment tracking

**Backend API:**
- 6 new endpoints in `supplierController.js`
- User-scoped data access
- Flexible settlement recording (partial/full)

**Frontend Component:**
- `SupplierReport.jsx` - Full-featured settlement UI
- Supplier list view with balance summary
- Ledger detail with expense & payment history
- Settlement form with validation
- CSV export button

**Navigation:**
- Added "Supplier Report" link to sidebar
- Integrated into Reports section

**Documentation:**
- 5 comprehensive guides
- Real-world usage examples
- API reference with curl examples
- Architecture diagrams

---

## 📚 Documentation

### Quick Access
- **Getting Started:** [SUPPLIER_SETTLEMENT_QUICKSTART.md](./SUPPLIER_SETTLEMENT_QUICKSTART.md)
- **Full Reference:** [SUPPLIER_SETTLEMENT_GUIDE.md](./SUPPLIER_SETTLEMENT_GUIDE.md)
- **Architecture:** [SUPPLIER_SETTLEMENT_ARCHITECTURE.md](./SUPPLIER_SETTLEMENT_ARCHITECTURE.md)
- **Examples:** [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
- **Verification:** [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- **Summary:** [PROJECT_DELIVERY_SUMMARY.md](./PROJECT_DELIVERY_SUMMARY.md)

### API Testing
```bash
# Use provided curl test script
bash Backend/test_supplier_api.sh
```

---

## 🧪 Testing

### Unit Testing Backend
```bash
cd Backend
npm test
```

### Manual Testing
1. Create expenses with `supplierName: "Test Company"`
2. Navigate to Sidebar → "Supplier Report"
3. Verify supplier card displays totals
4. Click supplier → ledger opens
5. Record settlement → verify balance updates
6. Download CSV → verify export

### API Testing
```bash
# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"user@test.com","password":"pass"}'

# Test supplier endpoints (see Backend/test_supplier_api.sh)
```

---

## 🔐 Security

- ✅ JWT authentication on all protected routes
- ✅ User-scoped data queries (no cross-user data access)
- ✅ Input validation on all API endpoints
- ✅ Password hashing with bcrypt
- ✅ CORS configured for local development
- ✅ Environment variables for sensitive data

---

## 🚢 Deployment

### Development
```bash
# Terminal 1
cd Backend && npm start

# Terminal 2
cd Frontend && npm run dev
```

### Production
```bash
# Backend
npm run build
node server.js

# Frontend
npm run build
# Deploy dist/ folder to CDN/static host
```

---

## 📊 Tech Stack

**Backend:**
- Node.js + Express 5.2.1
- MongoDB (Atlas cloud database)
- Mongoose 9.4.1
- JWT authentication
- Multer file upload

**Frontend:**
- React 19.2.4
- Vite build tool
- Tailwind CSS 3.4.17
- Radix UI components
- React Router 7.14.1
- Axios HTTP client

---

## 🤝 Contributing

### To Add Features
1. Create branch: `git checkout -b feature/my-feature`
2. Follow spec-driven development (see `.github/agents/expense-tracker.agent.md`)
3. Implement backend (models → controller → routes)
4. Implement frontend (components → page integration)
5. Document changes in appropriate guide
6. Test end-to-end
7. Submit PR

### Coding Standards
- Use consistent naming conventions
- Add JSDoc comments on functions
- Include input validation
- User-scope all queries with userId
- Handle errors gracefully
- Create tests for critical paths

---

## 🐛 Troubleshooting

### Backend Issues
- **Port 5000 in use:** Kill process or change PORT in .env
- **MongoDB connection timeout:** Check Atlas IP whitelist
- **Module not found:** Run `npm install`

### Frontend Issues
- **Page blank:** Check browser console for errors
- **Styles not loading:** Verify Tailwind config
- **API not responding:** Ensure backend is running

### Supplier Report Issues
- **"Supplier Report" not visible:** Refresh page (Ctrl+Shift+R)
- **No suppliers appearing:** Create expenses with `supplierName` field
- **Settlement not updating:** Check network tab in DevTools

---

## 📝 Known Limitations

- **Supplier Master:** Suppliers auto-created from expense names (no UI to pre-create)
- **PDF Export:** Only CSV available (PDF enhancement planned)
- **Settlement Linking:** linkedExpenses array exists but UI not implemented yet
- **Aging Analysis:** Not included in current version

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Expense tracking
- ✅ Supplier settlement
- ✅ File attachments
- ✅ Portfolio management

### Phase 2 (Planned)
- [ ] Multi-invoice settlement
- [ ] PDF statement generation
- [ ] Settlement aging analysis
- [ ] Automatic reconciliation
- [ ] Email reminders

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Multi-user households
- [ ] Budget goals & alerts
- [ ] AI spending insights

---

## 📧 Support

For issues or questions:
1. Check documentation in this folder
2. Review [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for scenarios
3. See [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for verification

---

## 📄 License

Private project - All rights reserved.

---

## 🎉 Summary

Finlight v2.0 includes a complete **Supplier Settlement System** enabling:
- Track spending per supplier
- Record partial/full payments
- Calculate outstanding balance
- View full payment history
- Export statements

**Ready for development testing!**

```bash
# Quick start
cd Backend && npm start &
cd Frontend && npm run dev
# Then navigate to http://localhost:5173
```

---

**Last Updated:** 2026  
**Status:** ✅ Production Ready  
**Next Step:** Deploy & test in development environment
