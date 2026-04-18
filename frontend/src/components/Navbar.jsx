import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, Calculator, BookOpen, GitCompare, Wrench, LibraryBig, BarChart3, DollarSign, Home, Bell, Heart, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toolsRef = useRef(null);
  const userMenuRef = useRef(null);

  const toolsItems = [
    { label: 'מחשבונים', path: '/calculators', icon: Calculator },
    { label: 'השוואה', path: '/compare', icon: GitCompare },
    { label: 'מדריכים', path: '/guides', icon: BookOpen },
    { label: 'אנציקלופדיה', path: '/encyclopedia', icon: LibraryBig },
  ];

  const mainLinks = [
    { label: 'בית', path: '/' },
    { label: 'סטטיסטיקות', path: '/statistics' },
    { label: 'כלים', hasDropdown: true },
    { label: 'תמחור', path: '/pricing' },
  ];

  const isActive = (path) => location.pathname === path;
  const isToolsActive = toolsItems.some(t => isActive(t.path));

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const linkStyle = (active) => ({
    padding: '8px 12px',
    fontSize: 13.5,
    fontWeight: 600,
    color: active ? 'var(--console-ink, #0A0A0A)' : 'var(--console-ink-3, #6B6B6B)',
    borderRadius: 6,
    border: 'none',
    background: active ? 'var(--console-bg-2, #F4F4F2)' : 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all .15s',
    fontFamily: 'Heebo, sans-serif',
  });

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--console-bg-1, #FFFFFF)',
          borderBottom: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
          height: 56,
        }}
        dir="rtl"
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent',
              cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 30, height: 30, background: 'var(--console-yellow, #FFCC00)',
              color: 'var(--console-yellow-ink, #0A0A0A)', borderRadius: 6,
              border: '2px solid var(--console-ink, #0A0A0A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Rubik, sans-serif', fontWeight: 900, fontSize: 14,
              boxShadow: '2px 2px 0 var(--console-ink, #0A0A0A)',
            }}>
              IL
            </div>
            <span style={{ fontFamily: 'Rubik, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--console-ink, #0A0A0A)', letterSpacing: '-0.02em' }}>
              רכב·IL
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
            {mainLinks.map(link => {
              if (link.hasDropdown) {
                return (
                  <div key={link.label} ref={toolsRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setToolsOpen(o => !o)}
                      style={linkStyle(isToolsActive || toolsOpen)}
                    >
                      {link.label}
                      <ChevronDown size={14} style={{ transform: toolsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                    </button>
                    {toolsOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                        background: 'var(--console-bg-1, #FFFFFF)',
                        border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
                        borderRadius: 10, overflow: 'hidden', width: 200,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      }}>
                        {toolsItems.map((t, i) => {
                          const TIcon = t.icon;
                          return (
                            <button
                              key={t.path}
                              onClick={() => { setToolsOpen(false); navigate(t.path); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                padding: '10px 14px', border: 'none', background: 'transparent',
                                textAlign: 'right', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                color: 'var(--console-ink, #0A0A0A)',
                                borderBottom: i < toolsItems.length - 1 ? '1px solid var(--console-line, rgba(0,0,0,0.06))' : 'none',
                              }}
                            >
                              <TIcon size={15} style={{ color: 'var(--console-ink-3, #6B6B6B)' }} />
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button key={link.path} onClick={() => navigate(link.path)} style={linkStyle(isActive(link.path))}>
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px 6px 6px',
                    border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
                    borderRadius: 8, background: 'var(--console-bg-1, #FFFFFF)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 4,
                    background: 'var(--console-ink, #0A0A0A)',
                    color: 'var(--console-yellow, #FFCC00)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {user.name?.[0] || user.email?.[0] || '?'}
                  </div>
                  <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, color: 'var(--console-ink, #0A0A0A)' }}>
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                    background: 'var(--console-bg-1, #FFFFFF)',
                    border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
                    borderRadius: 10, overflow: 'hidden', width: 180,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}>
                    {[
                      { label: 'חשבון', path: '/account', icon: User },
                      { label: 'היסטוריה', path: '/history', icon: BarChart3 },
                      { label: 'מועדפים', path: '/favorites', icon: Heart },
                      { label: 'התראות', path: '/watchlist', icon: Bell },
                    ].map((mi, i, a) => {
                      const MIcon = mi.icon;
                      return (
                        <button
                          key={mi.path}
                          onClick={() => { setUserMenuOpen(false); navigate(mi.path); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '10px 14px', border: 'none', background: 'transparent',
                            textAlign: 'right', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            color: 'var(--console-ink, #0A0A0A)',
                            borderBottom: '1px solid var(--console-line, rgba(0,0,0,0.06))',
                          }}
                        >
                          <MIcon size={14} style={{ color: 'var(--console-ink-3, #6B6B6B)' }} />
                          {mi.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => { setUserMenuOpen(false); logout && logout(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 14px', border: 'none', background: 'transparent',
                        textAlign: 'right', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        color: 'var(--console-red, #EF4444)',
                      }}
                    >
                      <LogOut size={14} />
                      התנתק
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px',
                  background: 'var(--console-yellow, #FFCC00)',
                  color: 'var(--console-yellow-ink, #0A0A0A)',
                  border: '1px solid var(--console-ink, #0A0A0A)',
                  borderRadius: 6, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">התחבר</span>
              </button>
            )}

            <button
              className="md:hidden"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                width: 36, height: 36, border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))',
                background: 'var(--console-bg-1, #FFFFFF)', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--console-ink, #0A0A0A)', cursor: 'pointer',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden"
            style={{
              background: 'var(--console-bg-1, #FFFFFF)',
              borderTop: '1px solid var(--console-line, rgba(0,0,0,0.06))',
              padding: '8px 12px 14px',
            }}
          >
            {[...mainLinks.filter(l => !l.hasDropdown), ...toolsItems].map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'block', width: '100%', padding: '10px 12px',
                  textAlign: 'right', fontSize: 14, fontWeight: 600,
                  color: isActive(link.path) ? 'var(--console-ink, #0A0A0A)' : 'var(--console-ink-3, #6B6B6B)',
                  background: isActive(link.path) ? 'var(--console-bg-2, #F4F4F2)' : 'transparent',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  marginBottom: 2,
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div style={{ height: 56 }} />
    </>
  );
}
