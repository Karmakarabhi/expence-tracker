# Expense Tracker

A full-stack expense tracking and investment portfolio management application built with React.js (Vite) frontend and Node.js/Express backend with MongoDB.

## Features

### Expense Management
- Track expenses by project and category
- Multiple payment methods (Cash, UPI, Bank Transfer, Cheque, Credit)
- Payment status tracking (Paid/Pending)
- Receipt upload support
- Search and filter expenses
- Automatic total calculation (Quantity × Rate)

### Project Management
- Create and manage multiple projects
- Set project budgets and category-wise budgets
- Track project status (Active, Completed, On-Hold)
- Project location and date tracking

### Investment Portfolio
- Manage multiple family member portfolios
- Track various investment types (Mutual Funds, ETFs, Stocks, FDs, PPF, NPS, Savings)
- Transaction history (BUY, SELL, SIP, DIVIDEND, SWITCH)
- Real-time portfolio valuation
- Investment analytics and insights

### Dashboard & Reports
- Net worth overview
- Monthly spending trends
- Category-wise expense breakdown
- Recent expenses summary
- Export reports to PDF/Excel

### Authentication & Security
- JWT-based authentication
- Protected routes
- User-specific data isolation

## Tech Stack

### Frontend
- **React 19** with Vite 8
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router v7** for navigation
- **Axios** for API calls
- **Chart.js / Recharts** for data visualization
- **jsPDF** for PDF generation
- **xlsx** for Excel export

### Backend
- **Node.js** with Express 5
- **MongoDB** with Mongoose 9
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **express-validator** for input validation

## Project Structure

```
expense-tracker/
├── Frontend/
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   ├── components/   # Reusable UI components
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   ├── portfolio/
│   │   │   └── ui/
│   │   ├── context/      # React contexts (Auth, Portfolio)
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   │   └── Portfolio/
│   │   └── assets/
│   └── package.json
│
├── Backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth, error handling, uploads
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── server.js
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/dashboard` - Dashboard summary

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Portfolio
- `GET /api/portfolios` - List portfolios
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/:id` - Get portfolio details

### Holdings
- `GET /api/holdings` - List holdings
- `POST /api/holdings` - Add holding
- `GET /api/holdings/:id` - Get holding details

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Add transaction

### Reports
- `GET /api/reports/summary` - Expense summary
- `GET /api/reports/category` - Category-wise report
- `GET /api/reports/export/pdf` - Export to PDF
- `GET /api/reports/export/excel` - Export to Excel

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000/api |

## License

ISC
