import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Car, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function formatApiError(detail) {
  if (!detail) return 'שגיאה. נסה שוב.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

/* Floating particle component */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 3 === 0 ? '#6390ff' : i % 3 === 1 ? '#22d3ee' : '#a78bfa',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.15 + Math.random() * 0.2,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.1, 0.35, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const { login: googleLogin, setUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const resp = await axios.post(`${API}/auth/register`, { name, email, password }, { withCredentials: true });
        setUser(resp.data);
        navigate('/', { replace: true });
      } else {
        const resp = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
        setUser(resp.data);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="min-h-screen ambient-bg flex items-center justify-center px-4 relative" data-testid="login-page">
      {/* Gradient orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[160px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #6390ff 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full mix-blend-screen filter blur-[140px] opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }} />

      {/* Particles */}
      <Particles />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="glass-card-elevated p-8 sm:p-10 max-w-[420px] w-full relative z-10"
        style={{ borderRadius: '20px' }}
      >
        {/* Brand logo */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative" style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.2), rgba(167,139,250,0.2))' }}>
            <Car className="w-8 h-8" style={{ color: '#6390ff' }} />
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.1), rgba(34,211,238,0.1))', filter: 'blur(8px)' }} />
          </div>
          <h1 className="font-rubik font-bold text-2xl mb-1">
            רכב <span className="gradient-text">IL</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>
            הדרך החכמה ביותר לבדוק רכב בישראל
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: 'var(--input-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-glass, rgba(255,255,255,0.08))' }}>
            <button
              onClick={() => switchMode('login')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative"
              style={mode === 'login' ? { background: 'linear-gradient(135deg, #6390ff, #a78bfa)', color: '#fff', boxShadow: '0 4px 15px rgba(99,144,255,0.3)' } : { color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}
              data-testid="tab-login"
            >
              התחברות
            </button>
            <button
              onClick={() => switchMode('register')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative"
              style={mode === 'register' ? { background: 'linear-gradient(135deg, #6390ff, #a78bfa)', color: '#fff', boxShadow: '0 4px 15px rgba(99,144,255,0.3)' } : { color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}
              data-testid="tab-register"
            >
              הרשמה
            </button>
          </div>
        </motion.div>

        {/* Google Login - disabled until Google OAuth is configured */}
        {/* To enable: set up Google Cloud Console OAuth credentials */}

        {/* Form with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'register' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'register' ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }} dir="rtl">
                  שם מלא
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.3))' }} />
                  <input
                    data-testid="register-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="השם שלך"
                    required
                    className="input-premium w-full pr-10 pl-4"
                    dir="rtl"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }} dir="rtl">
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.3))' }} />
                <input
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-premium w-full pr-10 pl-4"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }} dir="rtl">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.3))' }} />
                <input
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-premium w-full pr-10 pl-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary, rgba(255,255,255,0.3))' }}
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '14px',
                  }}
                  data-testid="auth-error"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              data-testid="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'התחבר' : 'הירשם'}
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Terms */}
        <motion.p variants={fadeUp} className="text-xs mt-6 text-center" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.2))' }}>
          בהמשך אתה מסכים לתנאי השימוש ומדיניות הפרטיות
        </motion.p>
      </motion.div>
    </div>
  );
}
