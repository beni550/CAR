import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogIn, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'בית', path: '/' },
    { label: 'תמחור', path: '/pricing' },
    { label: 'אודות', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl theme-nav border-b" data-testid="navbar">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group" data-testid="logo-btn">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)]/20 flex items-center justify-center group-hover:bg-[var(--accent-blue)]/30 transition-colors">
              <Car className="w-5 h-5 text-[var(--accent-blue)]" />
            </div>
            <span className="font-rubik font-bold text-lg theme-text">רכב IL</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className={`text-sm transition-colors ${isActive(l.path) ? 'theme-text font-medium' : 'theme-text-secondary hover:theme-text'}`}
                data-testid={`nav-${l.path.replace('/', '') || 'home'}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right side: Theme + Auth */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg theme-btn-outline flex items-center justify-center transition-all hover:scale-105"
              data-testid="theme-toggle-btn"
              title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-4 h-4 text-blue-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2" data-testid="user-menu-trigger">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-[var(--border-glass)]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[var(--accent-blue)]" />
                    </div>
                  )}
                </button>
                <div className="absolute left-0 top-full mt-2 glass-card theme-dropdown p-2 min-w-[160px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all" data-testid="user-dropdown">
                  <div className="px-3 py-2 border-b theme-divider mb-1">
                    <div className="text-sm font-medium truncate theme-text">{user.name}</div>
                    <div className="text-xs theme-text-muted truncate">{user.email}</div>
                  </div>
                  <button onClick={() => navigate('/account')} className="w-full text-right px-3 py-2 text-sm theme-text-secondary hover:bg-[var(--btn-outline-hover)] rounded-lg transition-colors" data-testid="nav-account">חשבון</button>
                  <button onClick={() => navigate('/history')} className="w-full text-right px-3 py-2 text-sm theme-text-secondary hover:bg-[var(--btn-outline-hover)] rounded-lg transition-colors" data-testid="nav-history">היסטוריה</button>
                  <button onClick={() => navigate('/favorites')} className="w-full text-right px-3 py-2 text-sm theme-text-secondary hover:bg-[var(--btn-outline-hover)] rounded-lg transition-colors" data-testid="nav-favorites">מועדפים</button>
                  <button onClick={async () => { await logout(); navigate('/'); }} className="w-full text-right px-3 py-2 text-sm text-red-500 hover:bg-red-500/5 rounded-lg transition-colors" data-testid="nav-logout">התנתק</button>
                </div>
              </div>
            ) : (
              <Button data-testid="nav-login-btn" onClick={() => navigate('/login')} size="sm" className="theme-btn-outline theme-text rounded-lg text-sm border">
                <LogIn className="w-4 h-4 ml-1" /> התחבר
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 theme-text-secondary" data-testid="mobile-menu-btn">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 theme-dropdown backdrop-blur-xl border-b theme-divider p-4 md:hidden"
            data-testid="mobile-menu"
          >
            {links.map(l => (
              <button
                key={l.path}
                onClick={() => { navigate(l.path); setMobileOpen(false); }}
                className={`block w-full text-right py-3 text-sm border-b theme-divider ${isActive(l.path) ? 'theme-text font-medium' : 'theme-text-secondary'}`}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
