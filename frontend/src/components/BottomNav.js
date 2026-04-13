import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ScanLine, Clock, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: <Home className="w-5 h-5" />, label: 'בית', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'חיפוש', path: '/' },
    { icon: <ScanLine className="w-5 h-5" />, label: 'סריקה', path: '/quick-search', accent: true },
    { icon: <Clock className="w-5 h-5" />, label: 'היסטוריה', path: '/history' },
    { icon: <User className="w-5 h-5" />, label: 'חשבון', path: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden theme-nav backdrop-blur-xl border-t" data-testid="bottom-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16">
        {items.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] transition-colors ${
                item.accent
                  ? 'text-[var(--accent-blue)]'
                  : active ? 'theme-text' : 'theme-text-muted'
              }`}
              data-testid={`bottom-nav-${item.path.replace('/', '') || 'home'}`}
            >
              {item.accent ? (
                <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)] flex items-center justify-center -mt-4 shadow-lg text-white">
                  {item.icon}
                </div>
              ) : (
                item.icon
              )}
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
