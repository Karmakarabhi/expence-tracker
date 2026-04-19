import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 border-b px-4">
            <h1 className="text-xl font-bold text-blue-600">BuildTracker</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Dashboard</Link>
            <Link to="/projects" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Projects</Link>
            <Link to="/expenses" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Expenses</Link>
            <Link to="/categories" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Categories</Link>
            <Link to="/budget" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Budget</Link>
            <Link to="/reports" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Reports</Link>
          </nav>
        </div>
      </aside>
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="text-lg font-semibold">Expense Tracker</div>
          <div className="flex items-center gap-4">
            <span>{user?.name || 'Admin'}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-700">Logout</button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}