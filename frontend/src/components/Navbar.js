import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'בית', path: '/' },
    { label: 'תמחור', path: '/pricing' },
    { label: 'אודות', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/5" data-testid="navbar">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group" data-testid="logo-btn">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-rubik font-bold text-lg">רכב IL</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className={`text-sm transition-colors ${isActive(l.path) ? 'text-white font-medium' : 'text-white/50 hover:text-white/80'}`}
                data-testid={`nav-${l.path.replace('/', '') || 'home'}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2" data-testid="user-menu-trigger">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </button>
                <div className="absolute left-0 top-full mt-2 glass-card p-2 min-w-[160px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all" data-testid="user-dropdown">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-white/40 truncate">{user.email}</div>
                  </div>
                  <button onClick={() => navigate('/account')} className="w-full text-right px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors" data-testid="nav-account">חשבון</button>
                  <button onClick={() => navigate('/history')} className="w-full text-right px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors" data-testid="nav-history">היסטוריה</button>
                  <button onClick={() => navigate('/favorites')} className="w-full text-right px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors" data-testid="nav-favorites">מועדפים</button>
                  <button onClick={async () => { await logout(); navigate('/'); }} className="w-full text-right px-3 py-2 text-sm text-red-400 hover:bg-red-400/5 rounded-lg transition-colors" data-testid="nav-logout">התנתק</button>
                </div>
              </div>
            ) : (
              <Button data-testid="nav-login-btn" onClick={() => navigate('/login')} size="sm" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-lg text-sm">
                <LogIn className="w-4 h-4 ml-1" /> התחבר
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/70" data-testid="mobile-menu-btn">
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
            className="fixed top-16 left-0 right-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/5 p-4 md:hidden"
            data-testid="mobile-menu"
          >
            {links.map(l => (
              <button
                key={l.path}
                onClick={() => { navigate(l.path); setMobileOpen(false); }}
                className={`block w-full text-right py-3 text-sm border-b border-white/5 ${isActive(l.path) ? 'text-white font-medium' : 'text-white/50'}`}
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
