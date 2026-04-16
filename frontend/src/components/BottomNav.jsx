import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Wrench, ScanLine, BarChart3, MoreHorizontal, BookOpen, LibraryBig, User, Heart } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close "more" popup on outside click
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
    { label: 'מדריכים', path: '/guides', icon: BookOpen },
    { label: 'אנציקלופדיה', path: '/encyclopedia', icon: LibraryBig },
    { label: 'חשבון', path: '/account', icon: User },
    { label: 'מועדפים', path: '/favorites', icon: Heart },
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
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      data-testid="bottom-nav"
    >
      {/* Glass background layer */}
      <div
        className="absolute inset-0 border-t"
        style={{
          background: 'var(--nav-bg, rgba(255,255,255,0.78))',
          borderColor: 'var(--nav-border, rgba(0,0,0,0.06))',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        }}
      />

      <div className="relative flex items-center justify-around h-16">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const active = item.path && isActive(item.path);

          // Center scan button
          if (item.center) {
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px]"
                data-testid={`bottom-nav-${item.path.replace('/', '') || 'home'}`}
              >
                {/* Pulse glow */}
                <span
                  className="absolute -top-3 w-14 h-14 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, var(--accent-blue, #3b82f6)30%, transparent 70%)',
                    opacity: 0.3,
                    filter: 'blur(6px)',
                  }}
                  aria-hidden
                />
                {/* Main button */}
                <div
                  className="relative w-12 h-12 rounded-full flex items-center justify-center -mt-5 shadow-xl transition-transform duration-300 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.35), 0 2px 8px rgba(59,130,246,0.2)',
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--accent-blue, #3b82f6)' }}>{item.label}</span>
              </button>
            );
          }

          // "More" button with popup
          if (item.isMore) {
            return (
              <div key={i} ref={moreRef} className="relative flex flex-col items-center">
                <button
                  onClick={() => setMoreOpen(prev => !prev)}
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] transition-colors"
                  data-testid="bottom-nav-more"
                >
                  <Icon className={`w-5 h-5 transition-colors ${moreOpen ? 'theme-text' : 'theme-text-muted'}`} />
                  <span className={`text-[10px] transition-colors ${moreOpen ? 'theme-text' : 'theme-text-muted'}`}>{item.label}</span>
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.92 }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 min-w-[180px] p-1.5 rounded-[16px] border z-50"
                      style={{
                        background: 'var(--nav-bg, rgba(255,255,255,0.92))',
                        borderColor: 'var(--nav-border, rgba(0,0,0,0.06))',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow: '0 -8px 32px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.06)',
                      }}
                      data-testid="bottom-nav-more-popup"
                    >
                      {moreItems.map((m, idx) => {
                        const MIcon = m.icon;
                        return (
                          <motion.button
                            key={m.path}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04, duration: 0.2 }}
                            onClick={() => { navigate(m.path); setMoreOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors"
                            style={isActive(m.path) ? {
                              background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6)12%, var(--accent-purple, #8b5cf6)08%)',
                            } : {}}
                          >
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{
                                background: isActive(m.path)
                                  ? 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))'
                                  : 'var(--accent-blue, #3b82f6)',
                                opacity: isActive(m.path) ? 1 : 0.1,
                              }}
                            >
                              <MIcon
                                className="w-3.5 h-3.5"
                                style={{
                                  color: isActive(m.path) ? '#fff' : 'var(--accent-blue, #3b82f6)',
                                  opacity: isActive(m.path) ? 1 : 10,
                                }}
                              />
                            </span>
                            <span className={isActive(m.path) ? 'theme-text font-medium' : 'theme-text-secondary'}>
                              {m.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Regular nav item
          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] transition-colors"
              data-testid={`bottom-nav-${item.path.replace('/', '') || 'home'}`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-200 ${active ? 'theme-text' : 'theme-text-muted'}`} />
              <span className={`text-[10px] transition-colors duration-200 ${active ? 'theme-text font-medium' : 'theme-text-muted'}`}>{item.label}</span>
              {/* Active gradient dot indicator */}
              {active && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
