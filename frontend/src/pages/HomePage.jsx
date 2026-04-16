import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdBanner from '../components/AdBanner';
import {
  Search, Camera, Upload, Zap, Shield, FileText, ScanLine, ChevronLeft,
  Star, BarChart3, GitCompareArrows, Bell, X, BookOpen, Calculator,
  Car, TrendingUp, Fuel, ArrowLeft, Database, Users, ChevronRight,
  Sparkles, Globe, Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ===== Animation Variants ===== */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } } };

/* ===== CountUp ===== */
function CountUp({ target, duration = 2, suffix = '' }) {
  const [count, setCount] = React.useState(0);
  const ref = useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration * 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 1000 / 60);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ===== Onboarding Tour ===== */
function OnboardingTour({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'חיפוש רכב', desc: 'הקלד מספר רכב בן 7-8 ספרות בשדה החיפוש', icon: <Search className="w-8 h-8" /> },
    { title: 'זיהוי AI', desc: 'לחץ על "צלם" או העלה תמונה וה-AI יזהה את המספר', icon: <ScanLine className="w-8 h-8" /> },
    { title: 'גלה עוד', desc: 'אנציקלופדיה, מחשבונים, סטטיסטיקות ומדריכים', icon: <Sparkles className="w-8 h-8" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass-card-elevated p-8 max-w-sm w-full text-center relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/25 hover:text-white/60 transition-colors duration-300">
          <X className="w-5 h-5" />
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
              style={{ width: 72, height: 72, background: 'rgba(99,144,255,0.12)' }}>
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(circle, rgba(99,144,255,0.2) 0%, transparent 70%)' }} />
              <div className="relative" style={{ color: 'var(--accent-blue)' }}>{steps[step].icon}</div>
            </div>
            <h3 className="font-rubik font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>{steps[step].title}</h3>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{steps[step].desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === step ? 28 : 8,
                background: i === step ? 'var(--accent-blue)' : 'rgba(255,255,255,0.12)',
                transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)'
              }} />
          ))}
        </div>
        <div className="flex gap-3">
          {step > 0 && (
            <Button onClick={() => setStep(s => s - 1)} variant="outline"
              className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl font-heebo">הקודם</Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="flex-1 btn-primary text-white rounded-xl font-heebo py-3">הבא</Button>
          ) : (
            <Button onClick={onClose} className="flex-1 btn-primary text-white rounded-xl font-heebo py-3">בואו נתחיל!</Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===== Floating Particles (Premium) ===== */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => {
        const size = 4 + (i % 3) * 3;
        const colors = [
          'rgba(99,144,255,0.15)',
          'rgba(34,211,238,0.12)',
          'rgba(167,139,250,0.12)',
          'rgba(99,144,255,0.10)',
          'rgba(34,211,238,0.10)',
          'rgba(167,139,250,0.08)',
          'rgba(99,144,255,0.12)',
          'rgba(34,211,238,0.08)',
        ];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${8 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              background: `radial-gradient(circle, ${colors[i]}, transparent)`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              y: [0, -(20 + i * 8), 0],
              x: [0, (i % 2 === 0 ? 10 : -10), 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.6,
            }}
          />
        );
      })}
    </div>
  );
}

/* ===== Mesh Gradient Background ===== */
function MeshGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 - Blue */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          top: '-15%', right: '-10%',
          background: 'radial-gradient(circle, rgba(99,144,255,0.18) 0%, rgba(99,144,255,0.05) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Orb 2 - Cyan */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500,
          bottom: '-20%', left: '-5%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(34,211,238,0.03) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 25, 0], y: [0, -20, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Orb 3 - Purple */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: '30%', left: '15%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, rgba(167,139,250,0.02) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 20, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plate, setPlate] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const seen = localStorage.getItem('rechev-onboarding-seen');
    if (!seen) { setShowOnboarding(true); localStorage.setItem('rechev-onboarding-seen', 'true'); }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('rechev-recent-searches') || '[]');
    setRecentSearches(saved.slice(0, 5));
  }, []);

  const saveRecentSearch = (plateNum) => {
    const saved = JSON.parse(localStorage.getItem('rechev-recent-searches') || '[]');
    const updated = [plateNum, ...saved.filter(p => p !== plateNum)].slice(0, 5);
    localStorage.setItem('rechev-recent-searches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const handleSearch = () => {
    const clean = plate.replace(/\D/g, '');
    if (clean.length < 5 || clean.length > 8) { setError('נא להזין מספר רכב תקין (7-8 ספרות)'); return; }
    setError('');
    saveRecentSearch(clean);
    if (window.posthog) window.posthog.capture('search_performed', { plate: clean, method: 'manual' });
    navigate(`/vehicle/${clean}`);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await axios.post(`${API}/vehicle/ai-recognize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true,
      });
      if (resp.data.success && resp.data.plate) {
        saveRecentSearch(resp.data.plate);
        if (window.posthog) window.posthog.capture('search_performed', { plate: resp.data.plate, method: 'ai_scan' });
        navigate(`/vehicle/${resp.data.plate}`);
      } else {
        setError('לא הצלחנו לזהות לוחית בתמונה. נסה לצלם מקרוב.');
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data?.detail || 'הגעת למגבלת סריקות AI היומית. שדרג ל-Pro.');
      } else {
        setError('שגיאה בזיהוי AI. נסה שוב.');
      }
    } finally { setAiLoading(false); }
  };

  const handlePlateChange = (e) => {
    const val = e.target.value;
    setPlate(val);
    setError('');
    if (/[\u0590-\u05FF]/.test(val)) setError('שדה זה מקבל מספרים בלבד');
  };

  /* Bento grid items */
  const bentoItems = [
    {
      title: 'אנציקלופדיית רכבים',
      desc: 'כל היצרנים והדגמים בישראל במקום אחד',
      icon: <BookOpen className="w-6 h-6" />,
      path: '/encyclopedia',
      color: 'blue',
      span: 'col-span-1 sm:col-span-2',
      gradient: 'from-blue-600/20 to-indigo-600/10',
    },
    {
      title: 'סטטיסטיקות שוק',
      desc: 'נתוני שוק הרכב הישראלי בזמן אמת',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/statistics',
      color: 'emerald',
      span: 'col-span-1',
      gradient: 'from-emerald-600/20 to-teal-600/10',
    },
    {
      title: 'מחשבון דלק',
      desc: 'חשב עלויות דלק חודשיות',
      icon: <Fuel className="w-6 h-6" />,
      path: '/calculators',
      color: 'amber',
      span: 'col-span-1',
      gradient: 'from-amber-600/20 to-orange-600/10',
    },
    {
      title: 'מחשבון מימון',
      desc: 'תשלום חודשי, ריבית, עלות כוללת',
      icon: <Calculator className="w-6 h-6" />,
      path: '/calculators',
      color: 'purple',
      span: 'col-span-1',
      gradient: 'from-purple-600/20 to-pink-600/10',
    },
    {
      title: 'מדריכים וטיפים',
      desc: '8 מדריכים מקצועיים לקנייה, מכירה ואחזקה',
      icon: <FileText className="w-6 h-6" />,
      path: '/guides',
      color: 'rose',
      span: 'col-span-1',
      gradient: 'from-rose-600/20 to-red-600/10',
    },
    {
      title: 'השוואת רכבים',
      desc: 'השווה עד 3 רכבים זה מול זה',
      icon: <GitCompareArrows className="w-6 h-6" />,
      path: '/compare',
      color: 'cyan',
      span: 'col-span-1 sm:col-span-2',
      gradient: 'from-cyan-600/20 to-blue-600/10',
    },
    {
      title: 'תחזית פחת',
      desc: 'כמה הרכב שלך יהיה שווה בעוד שנה?',
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/calculators',
      color: 'orange',
      span: 'col-span-1',
      gradient: 'from-orange-600/20 to-yellow-600/10',
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', hover: 'hover:border-blue-500/40', glow: 'rgba(99,144,255,0.15)' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', hover: 'hover:border-emerald-500/40', glow: 'rgba(52,211,153,0.15)' },
    amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', hover: 'hover:border-amber-500/40', glow: 'rgba(251,191,36,0.15)' },
    purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', hover: 'hover:border-purple-500/40', glow: 'rgba(167,139,250,0.15)' },
    rose: { bg: 'bg-rose-500/15', text: 'text-rose-400', hover: 'hover:border-rose-500/40', glow: 'rgba(251,113,133,0.15)' },
    cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', hover: 'hover:border-cyan-500/40', glow: 'rgba(34,211,238,0.15)' },
    orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', hover: 'hover:border-orange-500/40', glow: 'rgba(251,146,60,0.15)' },
  };

  const features = [
    { icon: <Zap className="w-5 h-5" />, title: 'חיפוש מיידי', desc: 'תוצאות בפחות משנייה ממאגרי הממשלה', color: 'text-yellow-400', glow: 'rgba(250,204,21,0.12)' },
    { icon: <ScanLine className="w-5 h-5" />, title: 'זיהוי AI חכם', desc: 'צלם לוחית וה-AI עושה את השאר', color: 'text-blue-400', glow: 'rgba(99,144,255,0.12)' },
    { icon: <Shield className="w-5 h-5" />, title: 'בדיקת גניבה', desc: 'וודא שהרכב נקי לפני קנייה', color: 'text-emerald-400', glow: 'rgba(52,211,153,0.12)' },
    { icon: <FileText className="w-5 h-5" />, title: 'טסט & בטיחות', desc: 'תוקף טסט, דירוג בטיחות, תו נכה', color: 'text-purple-400', glow: 'rgba(167,139,250,0.12)' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'הערכת שווי', desc: 'מחיר משוער לפי מחירון + פחת', color: 'text-orange-400', glow: 'rgba(251,146,60,0.12)' },
    { icon: <Database className="w-5 h-5" />, title: 'מידע ממשלתי', desc: 'ישירות מ-data.gov.il — מאומת ומדויק', color: 'text-cyan-400', glow: 'rgba(34,211,238,0.12)' },
  ];

  return (
    <div className="min-h-screen ambient-bg pb-safe">
      <AnimatePresence>
        {showOnboarding && <OnboardingTour onClose={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" data-testid="camera-input" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" data-testid="gallery-input" />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        <MeshGradientBg />
        <FloatingParticles />

        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge with pulse */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 mb-8 relative"
            style={{
              background: 'rgba(99,144,255,0.08)',
              border: '1px solid rgba(99,144,255,0.15)',
            }}>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(99,144,255,0.2)' }}
              animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>מאגר של 4.2+ מיליון רכבים</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-rubik font-extrabold mb-6 tracking-tight leading-[1.15]"
            style={{ color: 'var(--text-primary)' }}>
            כל מה שצריך לדעת{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text-animate">על כל רכב בישראל</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-base sm:text-lg font-light mb-12 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            חיפוש, השוואה, סטטיסטיקות, מחשבונים ומדריכים —
            <br className="hidden sm:block" />
            הכל במקום אחד, ישירות ממאגרי הממשלה
          </motion.p>

          {/* Search Box - Elevated Glass Card */}
          <motion.div variants={scaleIn} className="glass-card-elevated p-6 sm:p-8 max-w-lg mx-auto relative overflow-hidden">
            {/* Top gradient shine */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(99,144,255,0.3), rgba(34,211,238,0.2), transparent)' }} />

            <div className="relative">
              <div className="relative mb-5">
                <input
                  data-testid="plate-search-input"
                  type="text"
                  value={plate}
                  onChange={handlePlateChange}
                  onKeyDown={handleKeyDown}
                  placeholder="הקלד מספר רכב..."
                  className="w-full rounded-2xl px-5 py-4 text-2xl text-center font-rubik font-bold tracking-widest placeholder:text-lg placeholder:tracking-normal placeholder:font-normal transition-all duration-300"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--input-text)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(var(--accent-blue-rgb),0.12), 0 0 24px rgba(var(--accent-blue-rgb),0.06)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  dir="ltr"
                  maxLength={10}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-faint)' }} />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="text-sm mb-4" style={{ color: 'var(--danger)' }} data-testid="search-error">
                  {error}
                </motion.p>
              )}

              {recentSearches.length > 0 && !plate && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} className="mb-5">
                  <p className="text-xs mb-2.5" style={{ color: 'var(--text-faint)' }}>חיפושים אחרונים:</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(p => (
                      <button key={p} onClick={() => { setPlate(p); navigate(`/vehicle/${p}`); }}
                        className="text-xs rounded-xl px-3.5 py-2 font-mono transition-all duration-300"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-muted)',
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--bg-card-hover)'; e.target.style.color = 'var(--text-secondary)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'var(--bg-card)'; e.target.style.color = 'var(--text-muted)'; }}
                        dir="ltr">
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button data-testid="search-btn" onClick={handleSearch}
                  className="flex-1 btn-primary text-white font-heebo font-medium py-3.5 rounded-xl ripple text-sm">
                  <Search className="w-4 h-4 ml-2" />חפש רכב
                </Button>
                <Button data-testid="camera-btn" onClick={() => cameraRef.current?.click()} disabled={aiLoading} variant="outline"
                  className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white font-heebo py-3.5 rounded-xl transition-all duration-300 text-sm">
                  <Camera className="w-4 h-4 ml-2" />{aiLoading ? 'מנתח...' : 'צלם'}
                </Button>
                <Button data-testid="gallery-btn" onClick={() => galleryRef.current?.click()} disabled={aiLoading} variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-heebo py-3.5 px-4 rounded-xl transition-all duration-300">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-5 sm:gap-8 mt-10 text-xs" style={{ color: 'var(--text-muted)' }}>
            {[
              { icon: <Lock className="w-3.5 h-3.5" />, text: 'מידע מאובטח' },
              { icon: <Globe className="w-3.5 h-3.5" />, text: 'data.gov.il' },
              { icon: <Zap className="w-3.5 h-3.5" />, text: 'תוצאות מיידיות' },
              { icon: <Users className="w-3.5 h-3.5" />, text: '4,200+ משתמשים' },
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-2 font-light">{badge.icon} {badge.text}</span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="py-8" style={{ borderTop: '1px solid var(--divider)', borderBottom: '1px solid var(--divider)' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-4xl mx-auto grid grid-cols-4 gap-4 px-4">
          {[
            { value: 4200000, suffix: '', label: 'רכבים במאגר', color: 'var(--accent-blue)', gradient: 'linear-gradient(90deg, rgba(99,144,255,0.4), rgba(34,211,238,0.2))' },
            { value: 1247, suffix: '', label: 'חיפושים היום', color: '#34d399', gradient: 'linear-gradient(90deg, rgba(52,211,153,0.4), rgba(34,211,238,0.2))' },
            { value: null, label: 'דירוג', color: '#fbbf24', gradient: 'linear-gradient(90deg, rgba(251,191,36,0.4), rgba(251,146,60,0.2))' },
            { value: 8, suffix: '', label: 'מדריכים', color: 'var(--accent-purple)', gradient: 'linear-gradient(90deg, rgba(167,139,250,0.4), rgba(99,144,255,0.2))' },
          ].map((stat, i) => (
            <div key={i} className="text-center glass-card-static p-4 sm:p-5">
              <div className="text-xl sm:text-2xl font-rubik font-bold mb-1" style={{ color: stat.color }}>
                {stat.value !== null ? (
                  <CountUp target={stat.value} suffix={stat.suffix} />
                ) : (
                  <span className="flex items-center justify-center gap-1">4.8 <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" /></span>
                )}
              </div>
              {/* Gradient underline */}
              <div className="w-8 h-0.5 mx-auto mb-2 rounded-full" style={{ background: stat.gradient }} />
              <div className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ===== BENTO GRID - EXPLORE SECTION ===== */}
      {/* Ad placement - between stats and bento */}
      <AdBanner variant="in-article" className="max-w-5xl mx-auto px-4 my-6" />

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-rubik font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              גלה את <span className="gradient-text">כל הכלים</span>
            </h2>
            <p className="text-sm max-w-lg mx-auto font-light" style={{ color: 'var(--text-muted)' }}>
              לא רק חיפוש רכב — פלטפורמה שלמה עם מחשבונים, סטטיסטיקות, מדריכים ועוד
            </p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bentoItems.map((item, i) => {
              const c = colorMap[item.color];
              return (
                <motion.button
                  key={i}
                  variants={fadeUp}
                  onClick={() => navigate(item.path)}
                  className={`${item.span} glass-card gradient-border p-6 text-right group cursor-pointer relative overflow-hidden`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-bl ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }} />
                  <div className="relative z-10">
                    {/* Icon with glow */}
                    <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-3.5 ${c.text} group-hover:scale-110 transition-transform duration-300 relative`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}>
                      <div className="absolute inset-0 rounded-xl opacity-60" style={{ background: `radial-gradient(circle, ${c.glow}, transparent)`, filter: 'blur(8px)' }} />
                      <div className="relative">{item.icon}</div>
                    </div>
                    <h3 className="font-rubik font-semibold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  {/* Arrow slides in on hover */}
                  <ArrowLeft className={`absolute bottom-5 left-5 w-4 h-4 ${c.text} opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }} />
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid var(--divider)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-rubik font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              מה תוכל <span className="gradient-text">לבדוק?</span>
            </h2>
            <p className="text-sm font-light" style={{ color: 'var(--text-muted)' }}>כל המידע שצריך לפני קנייה או מכירה של רכב</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card p-6 group cursor-default" data-testid={`feature-card-${i}`}>
                {/* Icon with soft glow */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color} relative transition-transform duration-300 group-hover:scale-110`}
                  style={{ background: 'var(--bg-card-hover)', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}>
                  <div className="absolute inset-0 rounded-xl" style={{ background: `radial-gradient(circle, ${f.glow}, transparent)`, filter: 'blur(8px)' }} />
                  <div className="relative">{f.icon}</div>
                </div>
                <h3 className="font-rubik font-semibold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid var(--divider)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-rubik font-bold text-center mb-14" style={{ color: 'var(--text-primary)' }}>
            איך זה <span className="gradient-text">עובד?</span>
          </motion.h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative flex flex-col sm:flex-row gap-8 sm:gap-6">
            {/* Connecting line (desktop) */}
            <div className="hidden sm:block absolute top-7 right-[16.67%] left-[16.67%] h-px"
              style={{ background: 'linear-gradient(90deg, rgba(99,144,255,0.3), rgba(34,211,238,0.2), rgba(167,139,250,0.3))' }} />
            {/* Connecting line (mobile) */}
            <div className="sm:hidden absolute top-14 bottom-14 right-1/2 w-px"
              style={{ background: 'linear-gradient(180deg, rgba(99,144,255,0.3), rgba(34,211,238,0.2), rgba(167,139,250,0.3))' }} />

            {[
              { num: '1', title: 'הזן או צלם', desc: 'הקלד מספר רכב או צלם את הלוחית', icon: <Search className="w-5 h-5" />, color: 'var(--accent-blue)' },
              { num: '2', title: 'המערכת מחפשת', desc: 'בדיקה מקבילית ב-4 מאגרי מידע ממשלתיים', icon: <Database className="w-5 h-5" />, color: 'var(--accent-cyan)' },
              { num: '3', title: 'קבל תוצאות', desc: 'פרטים מלאים, ציון בריאות, הערכת מחיר ועוד', icon: <Zap className="w-5 h-5" />, color: 'var(--accent-purple)' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="flex-1 text-center relative z-10" data-testid={`step-${i}`}>
                {/* Gradient circle with step number */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 relative"
                  style={{
                    background: `linear-gradient(135deg, ${s.color}22, ${s.color}08)`,
                    border: `1px solid ${s.color}33`,
                  }}>
                  <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${s.color}15, transparent)`, filter: 'blur(12px)' }} />
                  <div className="relative" style={{ color: s.color }}>{s.icon}</div>
                </div>
                <div className="text-[10px] font-mono mb-2 font-medium"
                  style={{ color: `${s.color}88` }}>שלב {s.num}</div>
                <h3 className="font-rubik font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid var(--divider)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-rubik font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            מה אומרים <span className="gradient-text">עלינו</span>
          </motion.h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'דני כ.', role: 'קונה רכב', text: 'חסך לי אלפי שקלים. גיליתי שהרכב שרציתי לקנות היה מדווח כגנוב!', rating: 5 },
              { name: 'מיכל ר.', role: 'סוכנת ביטוח', text: 'כלי עבודה יומי בשבילי. המידע מדויק ומהיר. ממליצה בחום.', rating: 5 },
              { name: 'אבי ש.', role: 'מגרש רכבים', text: 'הפיצ\'ר של זיהוי AI מתמונה חוסך לי המון זמן. מעולה!', rating: 5 },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card p-6 relative overflow-hidden">
                {/* Decorative quote mark */}
                <div className="absolute top-3 left-4 text-6xl font-serif leading-none pointer-events-none select-none"
                  style={{ color: 'rgba(99,144,255,0.06)' }}>"</div>
                <div className="relative">
                  {/* Star rating with amber glow */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.3))' }} />
                    ))}
                  </div>
                  <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                  <div>
                    <div className="text-sm font-semibold font-rubik" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid var(--divider)' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-2xl mx-auto text-center">
          <div className="gradient-border relative overflow-hidden" style={{ borderRadius: 24, background: 'var(--bg-card)', padding: 1 }}>
            <div className="rounded-[23px] p-10 sm:p-12 relative overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
              {/* Mesh gradient inside */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(99,144,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(167,139,250,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.04) 0%, transparent 50%)' }} />
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-rubik font-extrabold mb-4">
                  <span style={{ color: 'var(--text-primary)' }}>מוכן </span>
                  <span className="gradient-text-animate">לבדוק?</span>
                </h2>
                <p className="text-sm mb-8 max-w-md mx-auto font-light" style={{ color: 'var(--text-secondary)' }}>
                  הזן מספר רכב ותקבל את כל המידע תוך שניות. חינם, ללא הרשמה.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="btn-primary text-white font-heebo font-medium px-8 py-3.5 rounded-xl text-sm">
                    <Search className="w-4 h-4 ml-2" /> חפש רכב עכשיו
                  </Button>
                  <Button onClick={() => navigate('/guides')} variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 font-heebo px-8 py-3.5 rounded-xl text-sm transition-all duration-300">
                    <BookOpen className="w-4 h-4 ml-2" /> קרא מדריכים
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid var(--divider)' }} className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                {/* Inline SVG road mark */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="28" height="28" rx="8" fill="url(#footer-grad)" fillOpacity="0.15" />
                  <path d="M8 22L12 6H16L20 22" stroke="url(#footer-grad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 16H18" stroke="url(#footer-grad2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  <path d="M11 19H17" stroke="url(#footer-grad2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                  <defs>
                    <linearGradient id="footer-grad" x1="0" y1="0" x2="28" y2="28">
                      <stop stopColor="#6390ff" />
                      <stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="footer-grad2" x1="10" y1="6" x2="18" y2="22">
                      <stop stopColor="#6390ff" />
                      <stop offset="0.5" stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-rubik font-bold text-sm" style={{ color: 'var(--text-primary)' }}>רכב IL</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                מערכת בדיקת רכבים מתקדמת המבוססת על מאגרי המידע הממשלתיים של data.gov.il
              </p>
            </div>
            <div>
              <h4 className="font-rubik font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>כלים</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'השוואת רכבים', path: '/compare' },
                  { label: 'מחשבונים', path: '/calculators' },
                  { label: 'אנציקלופדיה', path: '/encyclopedia' },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="block text-xs transition-colors duration-300"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-rubik font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>מידע</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'סטטיסטיקות', path: '/statistics' },
                  { label: 'מדריכים', path: '/guides' },
                  { label: 'תמחור', path: '/pricing' },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="block text-xs transition-colors duration-300"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-rubik font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>חשבון</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'התחברות', path: '/login' },
                  { label: 'מועדפים', path: '/favorites' },
                  { label: 'היסטוריה', path: '/history' },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="block text-xs transition-colors duration-300"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social proof line */}
          <div className="text-center mb-6">
            <p className="text-xs font-light" style={{ color: 'var(--text-faint)' }}>
              נבנה עם ❤️ בישראל | data.gov.il
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid var(--divider)' }}>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>© {new Date().getFullYear()} רכב IL. כל הזכויות שמורות.</p>
            <div className="flex gap-5 text-xs" style={{ color: 'var(--text-faint)' }}>
              <button onClick={() => navigate('/privacy')}
                className="transition-colors duration-300"
                onMouseEnter={(e) => e.target.style.color = 'var(--text-muted)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-faint)'}>פרטיות</button>
              <button onClick={() => navigate('/terms')}
                className="transition-colors duration-300"
                onMouseEnter={(e) => e.target.style.color = 'var(--text-muted)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-faint)'}>תנאי שימוש</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
