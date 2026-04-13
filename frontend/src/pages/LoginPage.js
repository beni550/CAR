import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Car, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function formatApiError(detail) {
  if (!detail) return 'שגיאה. נסה שוב.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function LoginPage() {
  const { login: googleLogin, setUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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

  return (
    <div className="min-h-screen ambient-bg flex items-center justify-center px-4" data-testid="login-page">
      <div className="absolute top-0 right-[-10%] w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none" />

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="glass-card p-8 sm:p-10 max-w-sm w-full hover:translate-y-0">
        <motion.div variants={fadeUp} className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="font-rubik font-bold text-2xl mb-1">רכב IL</h1>
          <p className="text-white/50 text-sm">
            {mode === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </p>
        </motion.div>

        {/* Google Login */}
        <motion.div variants={fadeUp}>
          <Button
            data-testid="google-login-btn"
            onClick={googleLogin}
            type="button"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-all mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {mode === 'login' ? 'התחבר עם Google' : 'הירשם עם Google'}
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">או</span>
          <div className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Email/Password Form */}
        <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                data-testid="register-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="שם מלא"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition-all"
                dir="rtl"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="אימייל"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition-all"
              dir="ltr"
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              data-testid="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-10 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition-all"
              dir="ltr"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50" data-testid="toggle-password">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center" data-testid="auth-error">
              {error}
            </motion.p>
          )}

          <Button
            data-testid="submit-auth-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'התחבר' : 'הירשם'}
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Toggle mode */}
        <motion.div variants={fadeUp} className="text-center mt-4">
          {mode === 'login' ? (
            <p className="text-sm text-white/40">
              אין לך חשבון?{' '}
              <button onClick={() => { setMode('register'); setError(''); }} className="text-blue-400 hover:underline" data-testid="switch-to-register">
                הירשם
              </button>
            </p>
          ) : (
            <p className="text-sm text-white/40">
              כבר יש לך חשבון?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-blue-400 hover:underline" data-testid="switch-to-login">
                התחבר
              </button>
            </p>
          )}
        </motion.div>

        {/* Demo Pro hint */}
        <motion.div variants={fadeUp} className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-xs text-blue-400/60 text-center">
            חשבון Pro לבדיקה: <span className="font-mono text-blue-400/80" dir="ltr">pro@rechev.il</span> / <span className="font-mono text-blue-400/80" dir="ltr">pro123456</span>
          </p>
        </motion.div>

        <motion.p variants={fadeUp} className="text-xs text-white/20 mt-4 text-center">
          בהמשך אתה מסכים לתנאי השימוש ומדיניות הפרטיות
        </motion.p>
      </motion.div>
    </div>
  );
}
