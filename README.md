# Finlight - Monorepo (Expense & Wealth Management)

**Architecture:** Monorepo with Turborepo & Workspaces (npm / pnpm)  
**Status:** ✅ Production Ready  

---

## 📁 Repository Structure

```
expense-tracker/
│
├── apps/
│   ├── expense-tracker/       # Expense Management Web App (Port 5173)
│   ├── investment-tracker/    # Wealth Management & Portfolio AI App (Port 5174)
│   └── api/                   # Express + MongoDB API Server (Port 5000)
│
├── packages/
│   ├── shared/                # @finlight/shared (AuthContext, formatters, utils)
│   ├── ui/                    # @finlight/ui (Radix UI & Tailwind components, MetricCard)
│   └── api-client/            # @finlight/api-client (Configured axios client & typed endpoints)
│
├── package.json               # Monorepo root configuration & scripts
├── pnpm-workspace.yaml        # pnpm workspace definition
├── turbo.json                 # Turborepo task pipeline configuration
└── README.md
```

---

## 📦 Packages Breakdown

| Package | Purpose |
|---|---|
| **`apps/expense-tracker`** | Standalone Vite app for operating expenses, vendor settlements, project budgets, and receipts. |
| **`apps/investment-tracker`** | Standalone Vite app for family portfolios, mutual funds, stock holdings, and **AI Portfolio Intelligence**. |
| **`apps/api`** | Central Node.js / Express API with MongoDB, deterministic rules engine, and Gemini AI endpoints. |
| **`packages/api-client`** | `@finlight/api-client`: Unified API client with automatic JWT token management and endpoint functions. |
| **`packages/shared`** | `@finlight/shared`: Shared Auth state (`useAuth`), number & date formatters, and Tailwind utilities. |
| **`packages/ui`** | `@finlight/ui`: Shared design system components (`Button`, `Card`, `Dialog`, `Table`, `MetricCard`, etc.). |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure API Environment
Make sure `apps/api/.env` exists:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Development Commands

```bash
# Run all services with Turborepo (Fast & parallel)
npm run dev

# Or run individual apps:
npm run dev:api         # API Server on http://localhost:5000
npm run dev:expense     # Expense Management on http://localhost:5173
npm run dev:wealth      # Wealth Management on http://localhost:5174

# Build all packages & apps for production:
npm run build
```
