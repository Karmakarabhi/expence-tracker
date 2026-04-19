import ProfileSwitcher from "../portfolio/ProfileSwitcher";
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Receipt,
  Tags,
  Wallet,
  PieChart,
  LogOut,
  TrendingUp,
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, shortName: 'Dash' },
    { name: 'Projects', path: '/projects', icon: Briefcase, shortName: 'Projects' },
    { name: 'Expenses', path: '/expenses', icon: Receipt, shortName: 'Expenses' },
    { name: 'Categories', path: '/categories', icon: Tags, shortName: 'Categories' },
    { name: 'Budget', path: '/budget', icon: Wallet, shortName: 'Budget' },
    { name: 'Reports', path: '/reports', icon: PieChart, shortName: 'Reports' },
    { name: 'Investments', path: '/portfolio', icon: TrendingUp, shortName: 'Invest' },
    { name: 'Holdings', path: '/portfolio/holdings', icon: TrendingUp, shortName: 'Holdings' },
    { name: 'Analytics', path: '/portfolio/analytics', icon: PieChart, shortName: 'Analytics' },
    { name: 'History', path: '/portfolio/transactions', icon: TrendingUp, shortName: 'History' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 border-b px-4">
            <h1 className="text-xl font-bold text-blue-600">BuildTracker</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-50 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full py-1 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] leading-tight">{item.shortName}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col flex-1 w-full md:w-0 overflow-hidden pb-16 md:pb-0">
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-4"><div className="text-lg font-semibold truncate sm:mr-4 hidden sm:block">Expense Tracker</div><ProfileSwitcher /></div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <span className="text-sm md:text-base hidden sm:inline-block font-medium text-gray-700">
              {user?.name || 'Admin'}
            </span>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-sm px-3 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}