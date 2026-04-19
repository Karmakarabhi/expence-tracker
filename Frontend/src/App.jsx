import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ExpenseList from './pages/ExpenseList';
import Login from './pages/Login';
import AddExpense from './pages/AddExpense';
import Categories from './pages/Categories';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import ProjectDetails from './pages/ProjectDetails';
import { PortfolioProvider } from './context/PortfolioContext';
import PortfolioDashboard from './pages/Portfolio/PortfolioDashboard';
import HoldingsList from './pages/Portfolio/HoldingsList';
import TransactionHistory from './pages/Portfolio/TransactionHistory';
import PortfolioAnalytics from './pages/Portfolio/PortfolioAnalytics';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center gap-3 bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PortfolioProvider>
        <TooltipProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="expenses" element={<ExpenseList />} />
            <Route path="expenses/new" element={<AddExpense />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budget" element={<Budget />} />
            <Route path="reports" element={<Reports />} />
            <Route path="portfolio" element={<PortfolioDashboard />} />
            <Route path="portfolio/holdings" element={<HoldingsList />} />
            <Route path="portfolio/transactions" element={<TransactionHistory />} />
            <Route path="portfolio/analytics" element={<PortfolioAnalytics />} />
          </Route>
        </Routes>
        </TooltipProvider>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;