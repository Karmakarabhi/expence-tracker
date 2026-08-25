import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@finlight/shared';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@finlight/ui';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading Wealth Management...</p>
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
                <Route index element={<PortfolioDashboard />} />
                <Route path="holdings" element={<HoldingsList />} />
                <Route path="transactions" element={<TransactionHistory />} />
                <Route path="analytics" element={<PortfolioAnalytics />} />
                {/* Legacy redirect aliases */}
                <Route path="portfolio" element={<Navigate to="/" replace />} />
                <Route path="portfolio/holdings" element={<Navigate to="/holdings" replace />} />
                <Route path="portfolio/transactions" element={<Navigate to="/transactions" replace />} />
                <Route path="portfolio/analytics" element={<Navigate to="/analytics" replace />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
