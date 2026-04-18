import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wrench, ScanLine, BarChart3, MoreHorizontal, BookOpen, LibraryBig, User, Heart, GitCompareArrows, Bell } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const moreItems = [
    { label: 'השוואה', path: '/compare', icon: GitCompareArrows },
    { label: 'אנציקלופדיה', path: '/encyclopedia', icon: LibraryBig },
    { label: 'מדריכים', path: '/guides', icon: BookOpen },
    { label: 'התראות', path: '/watchlist', icon: Bell },
    { label: 'מועדפים', path: '/favorites', icon: Heart },
    { label: 'חשבון', path: '/account', icon: User },
  ];

  const navItems = [
    { icon: Home, label: 'בית', path: '/' },
    { icon: Wrench, label: 'כלים', path: '/calculators' },
    { icon: ScanLine, label: 'סריקה', path: '/quick-search', center: true },
    { icon: BarChart3, label: 'סטטיסטיקות', path: '/statistics' },
    { icon: MoreHorizontal, label: 'עוד', path: null, isMore: true },
  ];

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--console-bg-1, #FFFFFF)',
        borderTop: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
      dir="rtl"
    >
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '6px 6px 0' }}>
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const active = item.path && isActive(item.path);

          if (item.isMore) {
            return (
              <div key={i} ref={moreRef} style={{ flex: 1, position: 'relative' }}>
                <button
                  onClick={() => setMoreOpen(o => !o)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: '8px 4px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: moreOpen ? 'var(--console-ink, #0A0A0A)' : 'var(--console-ink-3, #6B6B6B)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={20} strokeWidth={moreOpen ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: moreOpen ? 'var(--console-yellow, #FFCC00)' : 'transparent',
                    boxShadow: moreOpen ? '0 0 0 2px var(--console-ink, #0A0A0A)' : 'none',
                    marginTop: 2,
                  }} />
                </button>

                {moreOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      right: 8,
                      background: 'var(--console-bg-1, #FFFFFF)',
                      border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      width: 200,
                      overflow: 'hidden',
                    }}
                  >
                    {moreItems.map((mi, idx) => {
                      const MIcon = mi.icon;
                      return (
                        <button
                          key={mi.path}
                          onClick={() => { setMoreOpen(false); navigate(mi.path); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', padding: '10px 14px', border: 'none',
                            background: 'transparent', textAlign: 'right',
                            borderBottom: idx < moreItems.length - 1 ? '1px solid var(--console-line, rgba(0,0,0,0.06))' : 'none',
                            fontSize: 13, fontWeight: 500,
                            color: 'var(--console-ink, #0A0A0A)',
                            cursor: 'pointer',
                          }}
                        >
                          <MIcon size={15} style={{ color: 'var(--console-ink-3, #6B6B6B)' }} />
                          {mi.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (item.center) {
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: 'var(--console-yellow, #FFCC00)',
                    color: 'var(--console-yellow-ink, #0A0A0A)',
                    border: '2px solid var(--console-ink, #0A0A0A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '2px 2px 0 var(--console-ink, #0A0A0A)',
                    marginTop: -14,
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  color: 'var(--console-ink-3, #6B6B6B)', marginTop: 4,
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '8px 4px',
                fontSize: 10.5,
                fontWeight: 700,
                color: active ? 'var(--console-ink, #0A0A0A)' : 'var(--console-ink-3, #6B6B6B)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: active ? 'var(--console-yellow, #FFCC00)' : 'transparent',
                boxShadow: active ? '0 0 0 2px var(--console-ink, #0A0A0A)' : 'none',
                marginTop: 2,
              }} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
