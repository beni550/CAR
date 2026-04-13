import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Car } from 'lucide-react';
import { Button } from '../components/ui/button';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen ambient-bg flex items-center justify-center px-4" data-testid="login-page">
      <div className="absolute top-0 right-[-10%] w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none" />

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="glass-card p-8 sm:p-10 max-w-sm w-full text-center hover:translate-y-0">
        <motion.div variants={fadeUp} className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <Car className="w-8 h-8 text-blue-400" />
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-rubik font-bold text-2xl mb-2">רכב IL</motion.h1>
        <motion.p variants={fadeUp} className="text-white/50 text-sm mb-8">התחבר כדי לגשת להיסטוריה, מועדפים ועוד</motion.p>

        <motion.div variants={fadeUp}>
          <Button
            data-testid="google-login-btn"
            onClick={login}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            התחבר עם Google
          </Button>
        </motion.div>

        <motion.p variants={fadeUp} className="text-xs text-white/25 mt-6">
          בהמשך אתה מסכים לתנאי השימוש ומדיניות הפרטיות
        </motion.p>
      </motion.div>
    </div>
  );
}
