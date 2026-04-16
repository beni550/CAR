import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Search, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    const fetchHistory = async () => {
      try {
        const resp = await axios.get(`${API}/history`, { withCredentials: true });
        setHistory(resp.data.history || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [user, authLoading, navigate]);

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/history/${id}`, { withCredentials: true });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch { /* ignore */ }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${API}/history`, { withCredentials: true });
      setHistory([]);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="history-loading">
        <div className="max-w-2xl mx-auto space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="history-page">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-rubik font-bold text-2xl flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            היסטוריית חיפושים
          </h1>
          {history.length > 0 && (
            <Button data-testid="clear-history-btn" onClick={clearAll} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
              <Trash2 className="w-4 h-4 ml-1" /> מחק הכל
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center hover:translate-y-0" data-testid="history-empty">
            {/* Illustrated empty state */}
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <div className="relative">
                <Clock className="w-12 h-12 text-blue-400/40" />
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="w-3 h-3 text-blue-400" />
                </motion.div>
              </div>
            </div>
            <h3 className="font-rubik font-semibold text-lg mb-2">עוד לא חיפשת כלום</h3>
            <p className="text-white/40 text-sm mb-2">כל חיפוש שתבצע יישמר כאן אוטומטית</p>
            <p className="text-white/30 text-xs mb-6">כך תוכל לחזור לרכבים שבדקת בקלות</p>
            <Button data-testid="start-search-btn" onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
              <Search className="w-4 h-4 ml-2" /> חפש את הרכב הראשון שלך
            </Button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-3">
            {history.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className="glass-card p-4 flex items-center justify-between group"
                data-testid={`history-item-${item.plate}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="license-plate text-sm !max-w-[140px] !text-base" style={{ fontSize: '14px' }}>
                    <div className="il-strip !p-1 !min-w-[24px] !text-[7px]">
                      <span>IL</span>
                    </div>
                    <div className="plate-number !text-sm !py-1 !px-2 !tracking-wider">{item.plate}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{item.manufacturer} {item.model}</div>
                    <div className="text-xs text-white/40">{new Date(item.searched_at).toLocaleDateString('he-IL')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button data-testid={`search-again-${item.plate}`} onClick={() => navigate(`/vehicle/${item.plate}`)} variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-400/10">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button data-testid={`delete-history-${item.plate}`} onClick={() => deleteItem(item.id)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10">
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
