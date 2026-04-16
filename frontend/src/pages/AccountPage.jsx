import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Crown, LogOut, BarChart3, CreditCard, Loader2, Sun, Moon, Heart, Eye, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function ThemeToggleRow() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="w-full text-right p-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 group"
      style={{ background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--input-bg, rgba(255,255,255,0.05))'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      data-testid="theme-toggle-account"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme === 'dark' ? 'rgba(251,191,36,0.1)' : 'rgba(99,144,255,0.1)' }}>
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" style={{ color: '#6390ff' }} />}
      </div>
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary, rgba(255,255,255,0.9))' }}>{theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}</span>
      {/* Preview circles */}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full border-2 transition-all" style={{
          background: theme === 'dark' ? '#1a1a2e' : 'transparent',
          borderColor: theme === 'dark' ? '#6390ff' : 'var(--border-glass, rgba(255,255,255,0.15))',
        }} />
        <div className="w-5 h-5 rounded-full border-2 transition-all" style={{
          background: theme !== 'dark' ? '#f8f9fa' : 'transparent',
          borderColor: theme !== 'dark' ? '#6390ff' : 'var(--border-glass, rgba(255,255,255,0.15))',
        }} />
      </div>
    </button>
  );
}

function NavRow({ icon: Icon, iconColor, label, onClick, testId }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-right p-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 group"
      style={{ background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--input-bg, rgba(255,255,255,0.05))'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      data-testid={testId}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}15` }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary, rgba(255,255,255,0.9))' }}>{label}</span>
      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.25))' }} />
    </button>
  );
}

export default function AccountPage() {
  const { user, logout, loading: authLoading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6390ff', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isPro = user.plan === 'pro';

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="account-page">
      <div className="max-w-2xl mx-auto">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>

          {/* Profile Header */}
          <motion.div variants={fadeUp} className="glass-card-elevated p-8 mb-6 text-center" style={{ borderRadius: '20px' }} data-testid="profile-card">
            {/* Avatar with gradient border ring */}
            <div className="relative w-[72px] h-[72px] mx-auto mb-4">
              <div className="absolute inset-0 rounded-full p-[3px]" style={{ background: 'linear-gradient(135deg, #6390ff, #22d3ee, #a78bfa)' }}>
                <div className="w-full h-full rounded-full" style={{ background: 'var(--input-bg, #0f0f1a)' }} />
              </div>
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="absolute inset-[3px] rounded-full object-cover" />
              ) : (
                <div className="absolute inset-[3px] rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.2), rgba(167,139,250,0.2))' }}>
                  <User className="w-8 h-8" style={{ color: '#6390ff' }} />
                </div>
              )}
            </div>

            <h2 className="font-rubik font-bold text-xl mb-1" style={{ color: 'var(--text-primary, #fff)' }}>{user.name}</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>{user.email}</p>

            {/* Plan badge */}
            {isPro ? (
              <span className="inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full font-medium" style={{ background: 'linear-gradient(135deg, #6390ff, #a78bfa)', color: '#fff', boxShadow: '0 4px 15px rgba(99,144,255,0.3)' }}>
                <Sparkles className="w-3 h-3" />
                Pro
              </span>
            ) : (
              <span className="inline-flex items-center text-xs px-4 py-1.5 rounded-full font-medium" style={{ border: '1px solid var(--border-glass, rgba(255,255,255,0.15))', color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>
                Free
              </span>
            )}

            {/* Member since */}
            {user.created_at && (
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.3))' }}>
                חבר מאז {new Date(user.created_at).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
              </p>
            )}
          </motion.div>

          {/* Subscription Card */}
          <motion.div variants={fadeUp} className="glass-card p-6 mb-4" style={{ borderRadius: '20px' }} data-testid="subscription-section">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4" style={{ color: '#6390ff' }} />
              <h3 className="font-rubik font-semibold text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>ניהול מנוי</h3>
            </div>

            {isPro ? (
              <div>
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-400 font-medium">מנוי Pro פעיל</span>
                </div>

                {/* Plan benefits */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['זיהוי AI ללא הגבלה', 'ייצוא PDF', 'השוואת רכבים', 'ללא פרסומות'].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: '#22d3ee' }} />
                      {b}
                    </div>
                  ))}
                </div>

                {user.subscription_end && (
                  <p className="text-xs mb-4" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>
                    מתחדש ב-{new Date(user.subscription_end).toLocaleDateString('he-IL')}
                  </p>
                )}
                <button
                  data-testid="cancel-subscription-btn"
                  onClick={async () => {
                    setCancelLoading(true);
                    try {
                      await axios.post(`${API}/subscription/cancel`, {}, { withCredentials: true });
                      await checkAuth();
                    } catch { /* ignore */ }
                    finally { setCancelLoading(false); }
                  }}
                  disabled={cancelLoading}
                  className="text-xs font-medium px-4 py-2 rounded-xl transition-all duration-300"
                  style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#f87171' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                >
                  {cancelLoading ? <Loader2 className="w-3 h-3 animate-spin inline ml-1" /> : null}
                  בטל מנוי
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>
                  שדרג ל-Pro כדי לקבל גישה מלאה לכל התכונות
                </p>
                <button
                  data-testid="upgrade-from-account-btn"
                  onClick={async () => {
                    setUpgradeLoading(true);
                    try {
                      const originUrl = window.location.origin;
                      const resp = await axios.post(`${API}/checkout/create`, { origin_url: originUrl }, { withCredentials: true });
                      if (resp.data.url) window.location.href = resp.data.url;
                    } catch { setUpgradeLoading(false); }
                  }}
                  disabled={upgradeLoading}
                  className="btn-primary py-2.5 px-6 text-sm font-medium flex items-center gap-2"
                >
                  {upgradeLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> מעבד...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> שדרג ל-Pro — $5/חודש</>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Settings Section */}
          <motion.div variants={fadeUp} className="glass-card p-5 mb-4" style={{ borderRadius: '20px' }} data-testid="account-links">
            <h3 className="font-rubik font-semibold text-xs uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.35))' }}>הגדרות</h3>

            <ThemeToggleRow />

            <div className="my-2 mx-3 h-px" style={{ background: 'var(--border-glass, rgba(255,255,255,0.06))' }} />

            <NavRow icon={BarChart3} iconColor="#6390ff" label="היסטוריה" onClick={() => navigate('/history')} testId="go-history" />
            <NavRow icon={Heart} iconColor="#f472b6" label="מועדפים" onClick={() => navigate('/favorites')} testId="go-favorites" />
            <NavRow icon={Eye} iconColor="#22d3ee" label="רשימת מעקב" onClick={() => navigate('/watchlist')} testId="go-watchlist" />

            <div className="my-2 mx-3 h-px" style={{ background: 'var(--border-glass, rgba(255,255,255,0.06))' }} />

            <NavRow icon={Crown} iconColor="#a78bfa" label="ניהול מנוי" onClick={() => navigate('/pricing')} testId="go-pricing" />
          </motion.div>

          {/* Danger Zone - Logout */}
          <motion.div variants={fadeUp} className="mt-6 mb-8">
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                border: '1px solid rgba(239,68,68,0.15)',
                background: 'rgba(239,68,68,0.04)',
                color: '#f87171',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
