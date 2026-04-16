import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogIn, Sun, Moon, Calculator, BookOpen, GitCompare, DollarSign, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const RoadLogoSVG = ({ className }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L6 28h4l2-6h8l2 6h4L16 2z" fill="url(#roadGrad)" opacity="0.9" />
    <path d="M16 10l-1.5 6h3L16 10z" fill="url(#centerLine)" opacity="0.6" />
    <defs>
      <linearGradient id="roadGrad" x1="16" y1="2" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--accent-blue, #3b82f6)" />
        <stop offset="1" stopColor="var(--accent-purple, #8b5cf6)" />
      </linearGradient>
      <linearGradient id="centerLine" x1="16" y1="10" x2="16" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff" stopOpacity="0.8" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
);

const toolsItems = [
  { label: 'מחשבונים', path: '/calculators', icon: Calculator },
  { label: 'מדריכים', path: '/guides', icon: BookOpen },
  { label: 'השוואה', path: '/compare', icon: GitCompare },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toolsRef = useRef(null);
  const userMenuRef = useRef(null);
  const toolsTimeout = useRef(null);

  const mainLinks = [
    { label: 'בית', path: '/' },
    { label: 'אנציקלופדיה', path: '/encyclopedia' },
    { label: 'סטטיסטיקות', path: '/statistics' },
    { label: 'כלים', path: null, hasDropdown: true },
    { label: 'תמחור', path: '/pricing' },
  ];

  const isActive = (path) => location.pathname === path;
  const isToolsActive = toolsItems.some(t => isActive(t.path));

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToolsEnter = () => {
    clearTimeout(toolsTimeout.current);
    setToolsOpen(true);
  };
  const handleToolsLeave = () => {
    toolsTimeout.current = setTimeout(() => setToolsOpen(false), 200);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: 'var(--nav-bg, rgba(255,255,255,0.72))',
          borderColor: 'var(--nav-border, rgba(0,0,0,0.06))',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
          height: 64,
        }}
        data-testid="navbar"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo / Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group relative"
            data-testid="logo-btn"
          >
            {/* Glow on hover */}
            <span
              className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, var(--accent-blue, #3b82f6) 0%, transparent 70%)',
                opacity: undefined, // controlled by group-hover
                filter: 'blur(16px)',
              }}
              aria-hidden
            />
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6)15%, var(--accent-purple, #8b5cf6)15%)' }}
            >
              <RoadLogoSVG className="w-6 h-6" />
            </div>
            <span className="relative font-rubik font-bold text-lg theme-text select-none">
              רכב{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                IL
              </span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((l) => {
              if (l.hasDropdown) {
                // Tools dropdown
                return (
                  <div
                    key="tools"
                    ref={toolsRef}
                    className="relative"
                    onMouseEnter={handleToolsEnter}
                    onMouseLeave={handleToolsLeave}
                  >
                    <button
                      className="relative px-3.5 py-1.5 text-sm rounded-[14px] transition-all duration-300 overflow-hidden"
                      style={isToolsActive ? {
                        background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                        color: '#fff',
                      } : {}}
                      data-testid="nav-tools"
                    >
                      <span className={`relative z-10 flex items-center gap-1 ${isToolsActive ? 'font-medium text-white' : 'theme-text-secondary'}`}>
                        <Wrench className="w-3.5 h-3.5" />
                        {l.label}
                      </span>
                      {/* Hover underline animation */}
                      {!isToolsActive && (
                        <span className="absolute bottom-1 right-3.5 left-3.5 h-[1.5px] rounded-full origin-right scale-x-0 hover-underline transition-transform duration-300"
                          style={{ background: 'var(--accent-blue, #3b82f6)' }}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {toolsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute left-0 top-full mt-2 min-w-[200px] p-1.5 rounded-[16px] border z-50"
                          style={{
                            background: 'var(--nav-bg, rgba(255,255,255,0.85))',
                            borderColor: 'var(--nav-border, rgba(0,0,0,0.06))',
                            backdropFilter: 'blur(24px) saturate(1.4)',
                            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                          }}
                          data-testid="tools-dropdown"
                        >
                          {toolsItems.map((t, idx) => {
                            const Icon = t.icon;
                            return (
                              <motion.button
                                key={t.path}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.2 }}
                                onClick={() => { navigate(t.path); setToolsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                                  isActive(t.path)
                                    ? 'theme-text font-medium'
                                    : 'theme-text-secondary hover:theme-text'
                                }`}
                                style={{
                                  background: isActive(t.path)
                                    ? 'linear-gradient(135deg, var(--accent-blue, #3b82f6)12%, var(--accent-purple, #8b5cf6)08%)'
                                    : undefined,
                                }}
                                data-testid={`nav-${t.path.replace('/', '')}`}
                              >
                                <span className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ background: 'var(--accent-blue, #3b82f6)', opacity: 0.1 }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: 'var(--accent-blue, #3b82f6)', opacity: 10 }} />
                                </span>
                                {t.label}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // Regular link
              return (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className="relative px-3.5 py-1.5 text-sm rounded-[14px] transition-all duration-300 group/link"
                  style={isActive(l.path) ? {
                    background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                  } : {}}
                  data-testid={`nav-${l.path.replace('/', '') || 'home'}`}
                >
                  <span className={`relative z-10 ${isActive(l.path) ? 'font-medium text-white' : 'theme-text-secondary'}`}>
                    {l.label}
                  </span>
                  {/* Hover underline - slides right to left (RTL) */}
                  {!isActive(l.path) && (
                    <span
                      className="absolute bottom-1 right-3.5 left-3.5 h-[1.5px] rounded-full origin-right scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300"
                      style={{ background: 'var(--accent-blue, #3b82f6)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side: Theme + Auth + Mobile */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--btn-outline-bg, transparent)',
                border: '1px solid var(--nav-border, rgba(0,0,0,0.08))',
              }}
              data-testid="theme-toggle-btn"
              title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
            >
              {/* Glow behind icon */}
              <span
                className="absolute inset-0 rounded-xl transition-opacity duration-300"
                style={{
                  background: theme === 'dark'
                    ? 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                }}
                aria-hidden
              />
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
                    <Moon className="w-4 h-4 text-blue-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 group"
                  data-testid="user-menu-trigger"
                >
                  {user.picture ? (
                    <div className="p-[2px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))' }}>
                      <img src={user.picture} alt="" className="w-9 h-9 rounded-full border-2" style={{ borderColor: 'var(--nav-bg, #fff)' }} />
                    </div>
                  ) : (
                    <div className="p-[2px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--nav-bg, #fff)' }}>
                        <User className="w-4 h-4" style={{ color: 'var(--accent-blue, #3b82f6)' }} />
                      </div>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute left-0 top-full mt-2 min-w-[200px] p-2 rounded-[16px] border z-50"
                      style={{
                        background: 'var(--nav-bg, rgba(255,255,255,0.9))',
                        borderColor: 'var(--nav-border, rgba(0,0,0,0.06))',
                        backdropFilter: 'blur(24px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                      }}
                      data-testid="user-dropdown"
                    >
                      <div className="px-3 py-2.5 mb-1">
                        <div className="text-sm font-semibold truncate theme-text">{user.name}</div>
                        <div className="text-xs theme-text-muted truncate mt-0.5">{user.email}</div>
                      </div>
                      {/* Gradient divider */}
                      <div className="h-px mx-2 mb-1 rounded-full" style={{ background: 'linear-gradient(to left, transparent, var(--accent-blue, #3b82f6)40%, transparent)' }} />
                      {[
                        { label: 'חשבון', path: '/account', testId: 'nav-account' },
                        { label: 'היסטוריה', path: '/history', testId: 'nav-history' },
                        { label: 'מועדפים', path: '/favorites', testId: 'nav-favorites' },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => { navigate(item.path); setUserMenuOpen(false); }}
                          className="w-full text-right px-3 py-2.5 text-sm theme-text-secondary hover:theme-text rounded-xl transition-colors"
                          style={{ ':hover': { background: 'var(--btn-outline-hover)' } }}
                          data-testid={item.testId}
                        >
                          {item.label}
                        </button>
                      ))}
                      {/* Gradient divider */}
                      <div className="h-px mx-2 my-1 rounded-full" style={{ background: 'linear-gradient(to left, transparent, rgba(239,68,68,0.3), transparent)' }} />
                      <button
                        onClick={async () => { await logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="w-full text-right px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5 rounded-xl transition-colors"
                        data-testid="nav-logout"
                      >
                        התנתק
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                data-testid="nav-login-btn"
                onClick={() => navigate('/login')}
                size="sm"
                className="rounded-[14px] text-sm border px-4 py-1.5 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                  color: '#fff',
                  border: 'none',
                }}
              >
                <LogIn className="w-4 h-4 ml-1.5" /> התחבר
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: mobileOpen ? 'var(--accent-blue, #3b82f6)' : 'transparent',
                border: mobileOpen ? 'none' : '1px solid var(--nav-border, rgba(0,0,0,0.08))',
              }}
              data-testid="mobile-menu-btn"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5 theme-text-secondary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden overflow-hidden"
            style={{
              background: 'var(--nav-bg, rgba(255,255,255,0.92))',
              borderBottom: '1px solid var(--nav-border, rgba(0,0,0,0.06))',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            }}
            data-testid="mobile-menu"
          >
            <div className="p-4 space-y-1">
              {/* Main links */}
              {[
                { label: 'בית', path: '/' },
                { label: 'אנציקלופדיה', path: '/encyclopedia' },
                { label: 'סטטיסטיקות', path: '/statistics' },
                { label: 'תמחור', path: '/pricing' },
              ].map((l, idx) => (
                <motion.button
                  key={l.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25, ease: 'easeOut' }}
                  onClick={() => { navigate(l.path); setMobileOpen(false); }}
                  className="block w-full text-right py-3 px-4 text-sm rounded-xl transition-all"
                  style={isActive(l.path) ? {
                    background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                    color: '#fff',
                    fontWeight: 500,
                  } : {}}
                >
                  <span className={isActive(l.path) ? '' : 'theme-text-secondary'}>{l.label}</span>
                </motion.button>
              ))}

              {/* Tools section divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="pt-2 pb-1"
              >
                <div className="h-px mx-2 rounded-full" style={{ background: 'linear-gradient(to left, transparent, var(--nav-border, rgba(0,0,0,0.1)), transparent)' }} />
                <div className="px-4 pt-2 pb-1 text-xs font-medium theme-text-muted flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" /> כלים
                </div>
              </motion.div>

              {/* Tool links */}
              {toolsItems.map((t, idx) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + 4) * 0.05, duration: 0.25, ease: 'easeOut' }}
                    onClick={() => { navigate(t.path); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 py-3 px-4 text-sm rounded-xl transition-all"
                    style={isActive(t.path) ? {
                      background: 'linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6))',
                      color: '#fff',
                      fontWeight: 500,
                    } : {}}
                    data-testid={`mobile-nav-${t.path.replace('/', '')}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive(t.path) ? 'text-white' : ''}`} style={!isActive(t.path) ? { color: 'var(--accent-blue, #3b82f6)' } : {}} />
                    <span className={isActive(t.path) ? '' : 'theme-text-secondary'}>{t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
