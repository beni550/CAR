import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Accessibility, Heart, Share2, ArrowRight, Lock, Search, DollarSign, Bike } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const slideIn = { hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } };

function LicensePlateDisplay({ plate, isMotorcycle }) {
  const formatted = plate.length === 7
    ? `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`
    : plate.length === 8
    ? `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`
    : plate;
  return (
    <div className={`license-plate max-w-xs mx-auto text-2xl sm:text-3xl ${isMotorcycle ? '!border-orange-500/60' : ''}`} data-testid="license-plate-display">
      <div className={`il-strip ${isMotorcycle ? '!bg-gradient-to-b !from-orange-600 !to-orange-800' : ''}`}>
        <span className="text-[8px]">{isMotorcycle ? '🏍️' : '🇮🇱'}</span>
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

function formatPrice(num) {
  if (!num && num !== 0) return '—';
  return '₪' + Number(num).toLocaleString('he-IL');
}

function PriceCard({ price, isPro, navigate }) {
  if (!price) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-4 hover:translate-y-0 border-r-4 border-r-amber-500/30" data-testid="price-card-empty">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider">שווי רכב משוער</h3>
        </div>
        <p className="text-sm text-white/40">מחיר מחירון לא זמין לדגם זה</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-4 hover:translate-y-0 border-r-4 border-r-amber-500/50" data-testid="price-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider">שווי רכב משוער</h3>
        </div>
        {!isPro && <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded-full">Pro</span>}
      </div>

      {isPro ? (
        <div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-sm text-white/50">מחיר מחירון (כחדש)</span>
            <span className="text-sm font-medium">
              {price.original_price_min === price.original_price_max
                ? formatPrice(price.original_price_min)
                : `${formatPrice(price.original_price_min)} — ${formatPrice(price.original_price_max)}`}
            </span>
          </div>
          {price.importers?.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-white/50">יבואן</span>
              <span className="text-sm font-medium">{price.importers.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-sm text-white/50">פחת ({price.age_years} שנים)</span>
            <span className="text-sm font-medium text-red-400">-{price.depreciation_pct}%</span>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs text-amber-400/70 mb-1">שווי משוער</div>
            <div className="text-xl font-rubik font-bold text-amber-400" data-testid="estimated-value">
              {formatPrice(price.estimated_low)} — {formatPrice(price.estimated_high)}
            </div>
          </div>
          {price.trims?.length > 1 && (
            <p className="text-xs text-white/25 mt-2">
              * על בסיס {price.record_count} רמות גימור שונות
            </p>
          )}
          <p className="text-xs text-white/20 mt-2">
            הערכה מבוססת על מחירון יבואן רשמי ופחת ממוצע
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="filter blur-sm pointer-events-none select-none">
            <div className="py-2 border-b border-white/5 flex justify-between">
              <span className="text-sm text-white/50">מחיר מחירון</span>
              <span className="text-sm">₪XXX,XXX</span>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10">
              <div className="text-xl font-rubik font-bold text-amber-400">₪XX,XXX — ₪YY,YYY</div>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a]/60 rounded-xl">
            <Lock className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-sm text-white/50 mb-3">שדרג ל-Pro לראות שווי</p>
            <Button data-testid="upgrade-price-btn" onClick={() => navigate('/pricing')} size="sm" className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm">
              שדרג ל-Pro — $5/חודש
            </Button>
          </div>
        </div>
      )}
    </motion.div>
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
            const veh = resp.data.vehicle || {};
            await axios.post(`${API}/history`, {
              plate: plate,
              manufacturer: veh.tozeret_nm || '',
              model: veh.kinuy_mishari || veh.degem_nm || '',
              year: veh.shnat_yitzur || null,
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
  const isMotorcycle = data?.is_motorcycle || false;

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
        model: v.kinuy_mishari || v.degem_nm || '',
        year: v.shnat_yitzur || null,
        color: v.tzeva_rechev || '',
        test_expiry: v.tokef_dt || ''
      }, { withCredentials: true });
    } catch { /* ignore */ }
  };

  // Build disability detail string
  const disabilityDetail = () => {
    const d = data?.disability;
    if (!d?.has_disability_tag) return null;
    const parts = [];
    if (d.tag_type) parts.push(`סוג: ${d.tag_type}`);
    if (d.issue_date) parts.push(`הונפק: ${d.issue_date}`);
    return parts.join(' · ') || null;
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

  const accentColor = isMotorcycle ? 'orange' : 'blue';

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="vehicle-page">
      <div className="max-w-2xl mx-auto">
        {/* License Plate */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <LicensePlateDisplay plate={plate} isMotorcycle={isMotorcycle} />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} className="text-center mt-3">
            {isMotorcycle && (
              <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs px-3 py-1 rounded-full mb-2 font-medium" data-testid="motorcycle-badge">
                <Bike className="w-3.5 h-3.5" /> דו-גלגלי
              </span>
            )}
            {(v.tozeret_nm || v.degem_nm) && (
              <p className="text-white/50 text-sm">
                {v.tozeret_nm} {v.kinuy_mishari || v.degem_nm} {v.shnat_yitzur}
              </p>
            )}
          </motion.div>
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
            value={data.disability?.has_disability_tag ? 'תו נכה פעיל' : 'לא נמצא'}
            detail={disabilityDetail()}
            icon={<Accessibility className="w-5 h-5" />}
          />
        </motion.div>

        {/* Vehicle Value Card */}
        {!isMotorcycle && (
          <PriceCard price={data.price} isPro={isPro} navigate={navigate} />
        )}

        {/* Vehicle Details - Basic */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-4 hover:translate-y-0" data-testid="basic-details">
          <h3 className="font-rubik font-semibold mb-3 text-sm text-white/40 uppercase tracking-wider">פרטים בסיסיים</h3>
          <FieldRow label="יצרן" value={v.tozeret_nm} />
          <FieldRow label="דגם" value={isMotorcycle ? v.degem_nm : v.kinuy_mishari} />
          <FieldRow label="שנת ייצור" value={v.shnat_yitzur} />
          {!isMotorcycle && <FieldRow label="צבע" value={v.tzeva_rechev} />}
          {isMotorcycle && <FieldRow label="ארץ ייצור" value={v.tozeret_eretz_nm} />}
          <FieldRow label="סוג דלק" value={v.sug_delek_nm} />
          <FieldRow label="בעלות" value={v.baalut} />
          <FieldRow label="סוג רכב" value={v.sug_rechev_nm} />
          <FieldRow label="מועד עלייה לכביש" value={v.moed_aliya_lakvish} />
          {isMotorcycle && <FieldRow label="מקוריות" value={v.mkoriut_nm} />}
        </motion.div>

        {/* Vehicle Details - Pro / Extended */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-6 hover:translate-y-0" data-testid="pro-details">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider">פרטים מורחבים</h3>
            {!isPro && <span className={`text-xs ${isMotorcycle ? 'bg-orange-600/20 text-orange-400' : 'bg-blue-600/20 text-blue-400'} px-2 py-1 rounded-full`}>Pro</span>}
          </div>
          {isMotorcycle ? (
            <>
              <FieldRow label="נפח מנוע (סמ״ק)" value={v.nefach_manoa} locked={!isPro} />
              <FieldRow label="הספק" value={v.hespek} locked={!isPro} />
              <FieldRow label="משקל כולל" value={v.mishkal_kolel} locked={!isPro} />
              <FieldRow label="צמיגים קדמיים" value={v.mida_zmig_kidmi} locked={!isPro} />
              <FieldRow label="צמיגים אחוריים" value={v.mida_zmig_ahori} locked={!isPro} />
              <FieldRow label="קוד מהירות צמיג קדמי" value={v.kod_mehirut_zmig_kidmi} locked={!isPro} />
              <FieldRow label="קוד מהירות צמיג אחורי" value={v.kod_mehirut_zmig_ahori} locked={!isPro} />
              <FieldRow label="מספר מסגרת" value={v.misgeret} locked={!isPro} />
              <FieldRow label="מספר מנוע" value={v.mispar_manoa} locked={!isPro} />
            </>
          ) : (
            <>
              <FieldRow label="נפח מנוע (סמ״ק)" value={v.nefah_manoa} locked={!isPro} />
              <FieldRow label="הספק (כ״ס)" value={v.horspower} locked={!isPro} />
              <FieldRow label="מספר מושבים" value={v.mispar_moshvim} locked={!isPro} />
              <FieldRow label="משקל כולל" value={v.mishkal_kolel} locked={!isPro} />
              <FieldRow label="תיבת הילוכים" value={v.automatic_ind === 'A' ? 'אוטומטי' : v.automatic_ind === 'M' ? 'ידני' : v.automatic_ind} locked={!isPro} />
              <FieldRow label="הנעה" value={v.hanaa_nm} locked={!isPro} />
              <FieldRow label="רמת גימור" value={v.ramat_gimur} locked={!isPro} />
              <FieldRow label="קבוצת זיהום" value={v.kvutzat_zihum} locked={!isPro} />
            </>
          )}
          {!isPro && (
            <div className="mt-4 text-center">
              <p className="text-sm text-white/40 mb-3">רוצה לראות את כל הפרטים?</p>
              <Button data-testid="upgrade-pro-btn" onClick={() => navigate('/pricing')} size="sm" className={`${isMotorcycle ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-xl text-sm`}>
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
