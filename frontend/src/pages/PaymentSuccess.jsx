import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState('polling'); // polling | success | failed | error
  const hasPolled = useRef(false);

  useEffect(() => {
    if (hasPolled.current) return;
    hasPolled.current = true;

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let attempts = 0;
    const maxAttempts = 8;
    const pollInterval = 2000;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('failed');
        return;
      }
      attempts++;

      try {
        const resp = await axios.get(`${API}/checkout/status/${sessionId}`, { withCredentials: true });
        const data = resp.data;

        if (data.payment_status === 'paid') {
          setStatus('success');
          // Refresh auth to get updated plan
          await checkAuth();
          return;
        } else if (data.status === 'expired') {
          setStatus('failed');
          return;
        }

        // Continue polling
        setTimeout(poll, pollInterval);
      } catch (err) {
        console.error('Status poll error:', err);
        setTimeout(poll, pollInterval);
      }
    };

    poll();
  }, [searchParams, checkAuth]);

  return (
    <div className="min-h-screen ambient-bg flex items-center justify-center px-4" data-testid="payment-success-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 sm:p-10 max-w-md w-full text-center hover:translate-y-0"
      >
        {status === 'polling' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
            <h2 className="font-rubik font-bold text-xl mb-2" data-testid="payment-polling-title">מאמת תשלום...</h2>
            <p className="text-white/50 text-sm">ממתין לאישור מ-Stripe</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="font-rubik font-bold text-xl mb-2" data-testid="payment-success-title">ברוך הבא ל-Pro!</h2>
            <p className="text-white/50 text-sm mb-6">המנוי שלך הופעל בהצלחה. תהנה מכל התכונות המתקדמות.</p>
            <div className="space-y-3">
              <Button
                data-testid="go-home-after-payment"
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                חזור לדף הבית
              </Button>
              <Button
                data-testid="go-account-after-payment"
                onClick={() => navigate('/account')}
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
              >
                ניהול מנוי
              </Button>
            </div>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="font-rubik font-bold text-xl mb-2" data-testid="payment-failed-title">התשלום לא הושלם</h2>
            <p className="text-white/50 text-sm mb-6">
              {status === 'error' ? 'לא נמצא מזהה תשלום.' : 'נסה שנית או פנה לתמיכה.'}
            </p>
            <Button
              data-testid="retry-payment-btn"
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
            >
              נסה שנית
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
