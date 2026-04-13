import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Crown, LogOut, BarChart3, CreditCard, Loader2, Sun, Moon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function ThemeToggleRow() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="w-full text-right p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3" data-testid="theme-toggle-account">
      {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-500" />}
      <span className="text-sm flex-1">{theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}</span>
      <span className="text-xs text-white/30">{theme === 'dark' ? 'כהה' : 'בהיר'}</span>
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
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="account-page">
      <div className="max-w-2xl mx-auto">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
          {/* Profile Card */}
          <motion.div variants={fadeUp} className="glass-card p-6 mb-6 text-center hover:translate-y-0" data-testid="profile-card">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-400" />
              </div>
            )}
            <h2 className="font-rubik font-bold text-xl mb-1">{user.name}</h2>
            <p className="text-sm text-white/50 mb-3">{user.email}</p>
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${user.plan === 'pro' ? 'bg-blue-600/20 text-blue-400' : 'bg-white/10 text-white/50'}`}>
              {user.plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </motion.div>

          {/* Info */}
          <motion.div variants={fadeUp} className="glass-card p-5 mb-4 hover:translate-y-0" data-testid="account-info">
            <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">פרטי חשבון</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white/30" />
                <div>
                  <div className="text-xs text-white/40">אימייל</div>
                  <div className="text-sm">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-white/30" />
                <div>
                  <div className="text-xs text-white/40">סוג מנוי</div>
                  <div className="text-sm flex items-center gap-2">
                    <span className={user.plan === 'pro' ? 'text-blue-400 font-medium' : ''}>{user.plan === 'pro' ? 'Pro' : 'Free'}</span>
                    {user.subscription_end && user.plan === 'pro' && (
                      <span className="text-xs text-white/30">עד {new Date(user.subscription_end).toLocaleDateString('he-IL')}</span>
                    )}
                  </div>
                </div>
              </div>
              {user.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-white/30" />
                  <div>
                    <div className="text-xs text-white/40">תאריך הצטרפות</div>
                    <div className="text-sm">{new Date(user.created_at).toLocaleDateString('he-IL')}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Subscription Management */}
          <motion.div variants={fadeUp} className="glass-card p-5 mb-4 hover:translate-y-0" data-testid="subscription-section">
            <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">
              <CreditCard className="w-4 h-4 inline ml-2" />
              ניהול מנוי
            </h3>
            {user.plan === 'pro' ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">מנוי Pro פעיל</span>
                </div>
                {user.subscription_end && (
                  <p className="text-xs text-white/40 mb-4">מתחדש ב-{new Date(user.subscription_end).toLocaleDateString('he-IL')}</p>
                )}
                <Button
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
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 rounded-xl text-xs"
                >
                  {cancelLoading ? <Loader2 className="w-3 h-3 ml-1 animate-spin" /> : null}
                  בטל מנוי
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-white/50 mb-4">שדרג ל-Pro כדי לקבל גישה מלאה לכל התכונות</p>
                <Button
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
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm"
                >
                  {upgradeLoading ? <><Loader2 className="w-3 h-3 ml-1 animate-spin" /> מעבד...</> : 'שדרג ל-Pro — $5/חודש'}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeUp} className="glass-card p-5 mb-4 hover:translate-y-0" data-testid="account-links">
            <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">הגדרות</h3>
            <div className="space-y-2">
              <ThemeToggleRow />
              <button onClick={() => navigate('/history')} className="w-full text-right p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3" data-testid="go-history">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-sm">היסטוריית חיפושים</span>
              </button>
              <button onClick={() => navigate('/favorites')} className="w-full text-right p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3" data-testid="go-favorites">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">רכבים שמורים</span>
              </button>
              <button onClick={() => navigate('/pricing')} className="w-full text-right p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3" data-testid="go-pricing">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="text-sm">ניהול מנוי</span>
              </button>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div variants={fadeUp}>
            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <LogOut className="w-4 h-4 ml-2" />
              התנתק
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
