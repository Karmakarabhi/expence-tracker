import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSwitcher() {
  const { portfolios, activePortfolio, setActivePortfolio } = usePortfolio();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!portfolios || portfolios.length === 0) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
      >
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: activePortfolio?.color || '#6366f1' }}
        />
        <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
          {activePortfolio?.name || 'Select Portfolio'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-56 right-0 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
            Your Portfolios
          </div>
          <div className="max-h-60 overflow-y-auto">
            {portfolios.map(p => (
              <button
                key={p._id}
                onClick={() => {
                  setActivePortfolio(p);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: p.color || '#6366f1' }}
                  />
                  <span className="text-sm text-slate-700 truncate">{p.name}</span>
                </div>
                {activePortfolio?._id === p._id && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/portfolio');
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}