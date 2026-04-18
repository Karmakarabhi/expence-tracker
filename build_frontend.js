import fs from 'fs';
import path from 'path';

const basePath = '/home/abhijitkarmakar/Desktop/projects/expence-tracker/client';

const directories = [
  'src/api',
  'src/components/common',
  'src/components/layout',
  'src/components/dashboard',
  'src/components/expenses',
  'src/components/projects',
  'src/components/categories',
  'src/components/budget',
  'src/components/reports',
  'src/context',
  'src/hooks',
  'src/pages',
  'src/styles',
  'src/utils',
];

const files = {
  'src/index.css': `
@import "tailwindcss";
@theme {
  --color-primary-500: #3b82f6;
  --color-surface-50: #f8fafc;
  --color-text-900: #0f172a;
}
body { background: var(--color-surface-50); color: var(--color-text-900); }
`,
  'vite.config.js': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`,
  'src/App.jsx': `
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ExpenseList from './pages/ExpenseList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="expenses" element={<ExpenseList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
  `,
  'src/main.jsx': `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
  `,
  'src/components/layout/Layout.jsx': `
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
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
          </nav>
        </div>
      </aside>
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="text-lg font-semibold">Expense Tracker</div>
          <div>Admin</div>
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
  `,
  'src/pages/Dashboard.jsx': `
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Spent</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$124,500</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Remaining Budget</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$50,500</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-purple-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Pending Payments</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$4,200</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4">Recent Expenses</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 24, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cement Bags (50)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className="px-2 py-1 bg-blue-100 font-medium text-blue-800 rounded-full text-xs">Materials</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">$450.00</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 23, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Electrician Labour</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className="px-2 py-1 bg-orange-100 font-medium text-orange-800 rounded-full text-xs">Labour</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">$1200.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  `,
  'src/pages/Projects.jsx': `
export default function Projects() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
          + New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sunrise Villa</h3>
            <p className="text-gray-500 text-sm mb-4">Beverly Hills, CA</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-right text-gray-500 mb-4">45% of Budget Used</p>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-600">Budget:</span>
              <span className="font-bold text-gray-900">$250,000</span>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-medium text-green-600 flex items-center">Active</span>
            <button className="text-blue-600 text-sm hover:underline">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
  `,
  'src/pages/ExpenseList.jsx': `
export default function ExpenseList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
          + Add Expense
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-4 mb-6">
          <input type="text" placeholder="Search expenses..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Categories</option>
            <option>Materials</option>
            <option>Labour</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 24, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cement Bags (50)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className="px-2 py-1 bg-blue-100 font-medium text-blue-800 rounded-full text-xs">Materials</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">$450.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">Paid</span></td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 23, 2026</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Electrician Labour</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span className="px-2 py-1 bg-orange-100 font-medium text-orange-800 rounded-full text-xs">Labour</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">$1200.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="text-yellow-600 text-xs font-medium px-2 py-1 bg-yellow-50 rounded-full">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  `
};

directories.forEach(dir => {
  fs.mkdirSync(path.join(basePath, dir), { recursive: true });
});

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(basePath, file), content.trim() + '\\n');
}

console.log('Frontend setup complete.');
