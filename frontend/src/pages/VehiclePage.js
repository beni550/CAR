import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Accessibility, Heart, Share2, ArrowRight, Lock, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const slideIn = { hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } };

function LicensePlateDisplay({ plate }) {
  const formatted = plate.length === 7
    ? `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`
    : plate.length === 8
    ? `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`
    : plate;
  return (
    <div className="license-plate max-w-xs mx-auto text-2xl sm:text-3xl" data-testid="license-plate-display">
      <div className="il-strip">
        <span className="text-[8px]">🇮🇱</span>
        <span>IL</span>
      </div>
      <div className="plate-number">{formatted}</div>
    </div>
  );
}

function StatusCard({ type, title, value, detail, icon }) {
  const statusClass = type === 'clean' ? 'status-clean' : type === 'stolen' ? 'status-stolen' : type === 'expired' ? 'status-expired' : type === 'disability' ? 'status-disability' : 'status-none';
  const valueColor = type === 'clean' ? 'text-emerald-400' : type === 'stolen' || type === 'expired' ? 'text-red-400' : type === 'disability' ? 'text-blue-400' : 'text-white/50';

  return (
    <motion.div variants={slideIn} className={`glass-card p-4 ${statusClass} hover:translate-y-0`} data-testid={`status-${type}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'clean' ? 'bg-emerald-500/20 text-emerald-400' : type === 'stolen' || type === 'expired' ? 'bg-red-500/20 text-red-400' : type === 'disability' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/50'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-white/50">{title}</div>
          <div className={`font-rubik font-semibold ${valueColor}`}>{value}</div>
          {detail && <div className="text-xs text-white/30 mt-0.5">{detail}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function FieldRow({ label, value, locked }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      {locked ? (
        <span className="flex items-center gap-1 text-sm text-white/20">
          <Lock className="w-3 h-3" /> Pro
        </span>
      ) : (
        <span className="text-sm font-medium">{value || '—'}</span>
      )}
    </div>
  );
}

export default function VehiclePage() {
  const { plate } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resp = await axios.get(`${API}/vehicle/full?plate=${plate}`);
        setData(resp.data);
        // Save to history if logged in
        if (user) {
          try {
            await axios.post(`${API}/history`, {
              plate: plate,
              manufacturer: resp.data.vehicle?.tozeret_nm || '',
              model: resp.data.vehicle?.kinuy_mishari || '',
              year: resp.data.vehicle?.shnat_yitzur || null,
              source: 'manual'
            }, { withCredentials: true });
          } catch { /* ignore history save errors */ }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('הרכב לא נמצא במאגר. ודא שהמספר נכון.');
        } else {
          setError('שגיאה בטעינת נתונים. נסה שוב.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (plate) fetchData();
  }, [plate, user]);

  const v = data?.vehicle || {};
  const isPro = user?.plan === 'pro';

  const isTestValid = () => {
    if (!v.tokef_dt) return null;
    try {
      const expiry = new Date(v.tokef_dt);
      return expiry > new Date();
    } catch { return null; }
  };
  const testValid = isTestValid();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `בדיקת רכב ${plate}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSaveFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post(`${API}/favorites`, {
        plate,
        manufacturer: v.tozeret_nm || '',
        model: v.kinuy_mishari || '',
        year: v.shnat_yitzur || null,
        color: v.tzeva_rechev || '',
        test_expiry: v.tokef_dt || ''
      }, { withCredentials: true });
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="vehicle-loading">
        <div className="max-w-2xl mx-auto">
          <div className="skeleton h-16 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 flex items-center justify-center pb-safe" data-testid="vehicle-error">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-rubik font-bold text-xl mb-2">לא נמצא</h2>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <Button data-testid="back-home-btn" onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לחיפוש
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="vehicle-page">
      <div className="max-w-2xl mx-auto">
        {/* License Plate */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <LicensePlateDisplay plate={plate} />
          {v.tozeret_nm && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} className="text-center mt-3 text-white/50 text-sm">
              {v.tozeret_nm} {v.kinuy_mishari} {v.shnat_yitzur}
            </motion.p>
          )}
        </motion.div>

        {/* Status Cards */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <StatusCard
            type={data.theft?.stolen ? 'stolen' : 'clean'}
            title="גניבה"
            value={data.theft?.stolen ? 'מדווח כגנוב!' : 'נקי'}
            icon={<Shield className="w-5 h-5" />}
          />
          <StatusCard
            type={testValid === null ? 'none' : testValid ? 'clean' : 'expired'}
            title="טסט"
            value={testValid === null ? 'לא זמין' : testValid ? 'בתוקף' : 'פג תוקף!'}
            detail={v.tokef_dt ? `עד ${new Date(v.tokef_dt).toLocaleDateString('he-IL')}` : null}
            icon={<FileText className="w-5 h-5" />}
          />
          <StatusCard
            type={data.disability?.has_disability_tag ? 'disability' : 'none'}
            title="תו נכה"
            value={data.disability?.has_disability_tag ? 'קיים' : 'לא נמצא'}
            icon={<Accessibility className="w-5 h-5" />}
          />
        </motion.div>

        {/* Vehicle Details - Basic */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-4 hover:translate-y-0" data-testid="basic-details">
          <h3 className="font-rubik font-semibold mb-3 text-sm text-white/40 uppercase tracking-wider">פרטים בסיסיים</h3>
          <FieldRow label="יצרן" value={v.tozeret_nm} />
          <FieldRow label="דגם" value={v.kinuy_mishari} />
          <FieldRow label="שנת ייצור" value={v.shnat_yitzur} />
          <FieldRow label="צבע" value={v.tzeva_rechev} />
          <FieldRow label="סוג דלק" value={v.sug_delek_nm} />
          <FieldRow label="בעלות" value={v.baalut} />
          <FieldRow label="מועד עלייה לכביש" value={v.moed_aliya_lakvish ? new Date(v.moed_aliya_lakvish).toLocaleDateString('he-IL') : null} />
        </motion.div>

        {/* Vehicle Details - Pro */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-6 hover:translate-y-0" data-testid="pro-details">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider">פרטים מורחבים</h3>
            {!isPro && <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">Pro</span>}
          </div>
          <FieldRow label="נפח מנוע (סמ״ק)" value={v.nefah_manoa} locked={!isPro} />
          <FieldRow label="הספק (כ״ס)" value={v.horspower} locked={!isPro} />
          <FieldRow label="מספר מושבים" value={v.mispar_moshvim} locked={!isPro} />
          <FieldRow label="משקל כולל" value={v.mishkal_kolel} locked={!isPro} />
          <FieldRow label="תיבת הילוכים" value={v.automatic_ind === 'A' ? 'אוטומטי' : v.automatic_ind === 'M' ? 'ידני' : v.automatic_ind} locked={!isPro} />
          <FieldRow label="הנעה" value={v.hanaa_nm} locked={!isPro} />
          <FieldRow label="רמת גימור" value={v.ramat_gimur} locked={!isPro} />
          <FieldRow label="קבוצת זיהום" value={v.kvutzat_zihum} locked={!isPro} />
          <FieldRow label="סוג רכב" value={v.sug_rechev_nm} locked={!isPro} />
          {!isPro && (
            <div className="mt-4 text-center">
              <p className="text-sm text-white/40 mb-3">רוצה לראות את כל הפרטים?</p>
              <Button data-testid="upgrade-pro-btn" onClick={() => navigate('/pricing')} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm">
                שדרג ל-Pro — $5/חודש
              </Button>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex gap-3 mb-8">
          <Button data-testid="save-favorite-btn" onClick={handleSaveFavorite} variant="outline" className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl">
            <Heart className="w-4 h-4 ml-2" /> שמור
          </Button>
          <Button data-testid="share-btn" onClick={handleShare} variant="outline" className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl">
            <Share2 className="w-4 h-4 ml-2" /> שתף
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
