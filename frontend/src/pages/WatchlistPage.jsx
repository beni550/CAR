import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Plus, Trash2, Search, Shield, FileText, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [addPlate, setAddPlate] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchWatchlist();
  }, [user, authLoading, navigate]);

  const fetchWatchlist = async () => {
    try {
      const resp = await axios.get(`${API}/watchlist`, { withCredentials: true });
      setWatchlist(resp.data.watchlist || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    const clean = addPlate.replace(/\D/g, '');
    if (clean.length < 5 || clean.length > 8) {
      setAddError('מספר רכב לא תקין');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await axios.post(`${API}/watchlist`, {
        plate: clean,
        alert_types: ['theft', 'test_expiry']
      }, { withCredentials: true });
      setAddPlate('');
      await fetchWatchlist();
    } catch (err) {
      setAddError('שגיאה בהוספה');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (plate) => {
    try {
      await axios.delete(`${API}/watchlist/${plate}`, { withCredentials: true });
      setWatchlist(prev => prev.filter(w => w.plate !== plate));
    } catch { /* ignore */ }
  };

  const checkAlerts = async () => {
    setCheckingAlerts(true);
    try {
      const resp = await axios.get(`${API}/watchlist/check`, { withCredentials: true });
      setAlerts(resp.data.alerts || []);
    } catch { /* ignore */ }
    finally { setCheckingAlerts(false); }
  };

  const formatPlate = (plate) => {
    if (plate.length === 7) return `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`;
    if (plate.length === 8) return `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`;
    return plate;
  };

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe">
        <div className="max-w-2xl mx-auto space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="watchlist-page">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-rubik font-bold text-2xl flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-400" />
            רשימת מעקב
          </h1>
          {watchlist.length > 0 && (
            <Button onClick={checkAlerts} disabled={checkingAlerts} variant="outline" size="sm" className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 rounded-xl" data-testid="check-alerts-btn">
              {checkingAlerts ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <BellRing className="w-4 h-4 ml-1" />}
              בדוק התראות
            </Button>
          )}
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 space-y-2">
              {alerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass-card p-4 hover:translate-y-0 ${
                    alert.severity === 'danger' ? 'border-r-4 border-r-red-500 bg-red-500/5' : 'border-r-4 border-r-amber-500 bg-amber-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${alert.severity === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No alerts message */}
        {alerts.length === 0 && checkingAlerts === false && watchlist.length > 0 && (
          <AnimatePresence>
            {alerts !== null && alerts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 mb-6 border-r-4 border-r-emerald-500 bg-emerald-500/5 hover:translate-y-0">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">כל הרכבים שלך נקיים - אין התראות</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Add vehicle */}
        <div className="glass-card p-4 mb-6 hover:translate-y-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={addPlate}
              onChange={(e) => { setAddPlate(e.target.value); setAddError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="הוסף רכב למעקב..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center font-rubik font-bold tracking-widest placeholder:text-white/20 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              dir="ltr"
              maxLength={10}
              data-testid="watchlist-input"
            />
            <Button onClick={handleAdd} disabled={addLoading} className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-5" data-testid="add-watchlist-btn">
              {addLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </Button>
          </div>
          {addError && <p className="text-red-400 text-sm mt-2">{addError}</p>}
        </div>

        {/* Watchlist */}
        {watchlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center hover:translate-y-0" data-testid="watchlist-empty">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-amber-400/40" />
            </div>
            <h3 className="font-rubik font-semibold text-lg mb-2">עדיין אין רכבים במעקב</h3>
            <p className="text-white/40 text-sm mb-2">הוסף רכבים כדי לקבל התראות על:</p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Shield className="w-4 h-4 text-red-400" />
                דיווח גניבה
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <FileText className="w-4 h-4 text-amber-400" />
                פג תוקף טסט
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-3">
            {watchlist.map((item) => (
              <motion.div
                key={item.plate}
                variants={fadeUp}
                className="glass-card p-4 flex items-center justify-between group"
                data-testid={`watchlist-item-${item.plate}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="license-plate text-sm !max-w-[140px]" style={{ fontSize: '14px' }}>
                    <div className="il-strip !p-1 !min-w-[24px] !text-[7px]"><span>IL</span></div>
                    <div className="plate-number !text-sm !py-1 !px-2 !tracking-wider">{formatPlate(item.plate)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.manufacturer} {item.model}</div>
                    <div className="flex gap-2 mt-1">
                      {item.alert_types?.includes('theft') && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="w-3 h-3" /> גניבה
                        </span>
                      )}
                      {item.alert_types?.includes('test_expiry') && (
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" /> טסט
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate(`/vehicle/${item.plate}`)} variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-400/10">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleRemove(item.plate)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
