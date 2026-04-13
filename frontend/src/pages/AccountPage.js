import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Crown, Moon, Sun, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
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
                    {user.plan === 'pro' ? 'Pro' : 'Free'}
                    {user.plan !== 'pro' && (
                      <button onClick={() => navigate('/pricing')} className="text-blue-400 text-xs hover:underline">שדרג</button>
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

          {/* Quick Links */}
          <motion.div variants={fadeUp} className="glass-card p-5 mb-4 hover:translate-y-0" data-testid="account-links">
            <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">ניווט מהיר</h3>
            <div className="space-y-2">
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
