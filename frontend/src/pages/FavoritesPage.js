import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, Search, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    const fetchFavorites = async () => {
      try {
        const resp = await axios.get(`${API}/favorites`, { withCredentials: true });
        setFavorites(resp.data.favorites || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchFavorites();
  }, [user, authLoading, navigate]);

  const removeFavorite = async (plate) => {
    try {
      await axios.delete(`${API}/favorites/${plate}`, { withCredentials: true });
      setFavorites(prev => prev.filter(f => f.plate !== plate));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="favorites-loading">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="favorites-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-rubik font-bold text-2xl mb-6 flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-400" />
          רכבים שמורים
        </h1>

        {favorites.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center" data-testid="favorites-empty">
            <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="font-rubik font-semibold text-lg mb-2">אין רכבים שמורים</h3>
            <p className="text-white/40 text-sm mb-6">שמור רכבים שמעניינים אותך כאן</p>
            <Button data-testid="search-vehicle-btn" onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
              <Search className="w-4 h-4 ml-2" /> חפש רכב
            </Button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((item) => {
              const isExpired = item.test_expiry ? new Date(item.test_expiry) < new Date() : null;
              return (
                <motion.div
                  key={item.plate}
                  variants={fadeUp}
                  className="glass-card p-4"
                  data-testid={`favorite-${item.plate}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="license-plate text-sm !max-w-[130px]" style={{ fontSize: '12px' }}>
                      <div className="il-strip !p-1 !min-w-[20px] !text-[6px]"><span>IL</span></div>
                      <div className="plate-number !text-xs !py-1 !px-2 !tracking-wider">{item.plate}</div>
                    </div>
                    {isExpired !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {isExpired ? 'טסט פג' : 'טסט בתוקף'}
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="font-medium text-sm">{item.manufacturer} {item.model}</div>
                    <div className="text-xs text-white/40">{item.year} • {item.color}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button data-testid={`check-favorite-${item.plate}`} onClick={() => navigate(`/vehicle/${item.plate}`)} variant="ghost" size="sm" className="flex-1 text-blue-400 hover:bg-blue-400/10 text-xs">
                      <RefreshCw className="w-3 h-3 ml-1" /> בדוק עכשיו
                    </Button>
                    <Button data-testid={`remove-favorite-${item.plate}`} onClick={() => removeFavorite(item.plate)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
