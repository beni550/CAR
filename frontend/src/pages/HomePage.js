import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Camera, Upload, Zap, Shield, FileText, ScanLine, ChevronLeft, Star, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

function CountUp({ target, duration = 2 }) {
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
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [plate, setPlate] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const handleSearch = () => {
    const clean = plate.replace(/\D/g, '');
    if (clean.length < 5 || clean.length > 8) {
      setError('נא להזין מספר רכב תקין (7-8 ספרות)');
      return;
    }
    setError('');
    navigate(`/vehicle/${clean}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await axios.post(`${API}/vehicle/ai-recognize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (resp.data.success && resp.data.plate) {
        navigate(`/vehicle/${resp.data.plate}`);
      } else {
        setError('לא הצלחנו לזהות לוחית בתמונה. נסה לצלם מקרוב.');
      }
    } catch {
      setError('שגיאה בזיהוי AI. נסה שוב.');
    } finally {
      setAiLoading(false);
    }
  };

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: 'חיפוש מיידי', desc: 'תוצאות בפחות משנייה' },
    { icon: <ScanLine className="w-6 h-6" />, title: 'זיהוי AI חכם', desc: 'צלם לוחית וה-AI עושה את השאר' },
    { icon: <Shield className="w-6 h-6" />, title: 'בדיקת גניבה', desc: 'וודא שהרכב נקי' },
    { icon: <FileText className="w-6 h-6" />, title: 'טסט & נכה', desc: 'בדוק תוקף טסט ותו נכה' },
  ];

  const steps = [
    { num: '1', title: 'הזן או צלם', desc: 'הקלד מספר רכב או צלם את הלוחית' },
    { num: '2', title: 'ה-AI מנתח', desc: 'המערכת מחפשת במאגרי המידע הממשלתיים' },
    { num: '3', title: 'קבל תוצאות', desc: 'פרטים מלאים על הרכב תוך שניות' },
  ];

  return (
    <div className="min-h-screen ambient-bg pb-safe">
      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" data-testid="camera-input" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" data-testid="gallery-input" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 right-[-10%] w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-72 h-72 bg-yellow-400 rounded-full mix-blend-screen filter blur-[128px] opacity-10 pointer-events-none" />

        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold font-rubik mb-4 tracking-tight">
            בדוק כל רכב בישראל{' '}
            <span className="text-blue-400">תוך שניות</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-base sm:text-lg text-white/55 mb-10 max-w-xl mx-auto">
            הקלד מספר רכב או צלם את הלוחית — וקבל את כל המידע
          </motion.p>

          {/* Search Box */}
          <motion.div variants={fadeUp} className="glass-card p-4 sm:p-6 max-w-lg mx-auto">
            <div className="relative mb-4">
              <input
                data-testid="plate-search-input"
                type="text"
                value={plate}
                onChange={(e) => { setPlate(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="12-345-67"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-2xl text-center font-rubik font-bold tracking-widest placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                dir="ltr"
                maxLength={10}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mb-3" data-testid="search-error">
                {error}
              </motion.p>
            )}

            <div className="flex gap-3">
              <Button
                data-testid="search-btn"
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-heebo font-medium py-3 rounded-xl ripple transition-all"
              >
                <Search className="w-4 h-4 ml-2" />
                חפש
              </Button>
              <Button
                data-testid="camera-btn"
                onClick={() => cameraRef.current?.click()}
                disabled={aiLoading}
                variant="outline"
                className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white font-heebo py-3 rounded-xl transition-all"
              >
                <Camera className="w-4 h-4 ml-2" />
                {aiLoading ? 'מנתח...' : 'צלם'}
              </Button>
              <Button
                data-testid="gallery-btn"
                onClick={() => galleryRef.current?.click()}
                disabled={aiLoading}
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-heebo py-3 px-4 rounded-xl transition-all"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="py-8 border-y border-white/5">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto flex justify-center gap-8 sm:gap-16 px-4 text-center"
        >
          <div>
            <div className="text-2xl sm:text-3xl font-rubik font-bold text-blue-400"><CountUp target={1247} /></div>
            <div className="text-xs sm:text-sm text-white/40">חיפושים היום</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-rubik font-bold text-yellow-400 flex items-center justify-center gap-1">4.8 <Star className="w-4 h-4 fill-yellow-400" /></div>
            <div className="text-xs sm:text-sm text-white/40">דירוג</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-rubik font-bold text-emerald-400"><CountUp target={4} />M+</div>
            <div className="text-xs sm:text-sm text-white/40">רכבים במאגר</div>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-rubik font-bold text-center mb-10">
            מה תוכל לבדוק?
          </motion.h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card p-6 text-center group cursor-default" data-testid={`feature-card-${i}`}>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-rubik font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-rubik font-bold text-center mb-12">
            איך זה עובד?
          </motion.h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col sm:flex-row gap-6 sm:gap-4">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="flex-1 text-center relative" data-testid={`step-${i}`}>
                <div className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center mx-auto mb-4 text-blue-400 font-rubik font-bold text-xl">
                  {s.num}
                </div>
                <h3 className="font-rubik font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-white/50">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronLeft className="hidden sm:block absolute top-7 -left-4 w-6 h-6 text-white/20" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-2xl sm:text-3xl font-rubik font-bold text-center mb-10">
            תוכניות ומחירים
          </motion.h2>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free */}
            <motion.div variants={fadeUp} className="glass-card p-6" data-testid="pricing-free">
              <h3 className="font-rubik font-bold text-xl mb-2">חינם</h3>
              <div className="text-3xl font-rubik font-bold mb-4">$0<span className="text-sm text-white/40 font-normal">/חודש</span></div>
              <ul className="space-y-2 text-sm text-white/60 mb-6">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> חיפוש ידני ללא הגבלה</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> זיהוי AI: 10 סריקות ביום</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> פרטים בסיסיים</li>
                <li className="flex items-center gap-2"><span className="text-white/30">✗</span> <span className="text-white/30">פרטים מורחבים</span></li>
                <li className="flex items-center gap-2"><span className="text-white/30">✗</span> <span className="text-white/30">היסטוריה ומועדפים</span></li>
              </ul>
              <Button data-testid="pricing-free-btn" variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl" onClick={() => navigate('/login')}>
                התחל בחינם
              </Button>
            </motion.div>
            {/* Pro */}
            <motion.div variants={fadeUp} className="glass-card p-6 border-blue-500/30 relative" data-testid="pricing-pro">
              <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">פופולרי</div>
              <h3 className="font-rubik font-bold text-xl mb-2 text-blue-400">Pro</h3>
              <div className="text-3xl font-rubik font-bold mb-4">$5<span className="text-sm text-white/40 font-normal">/חודש</span></div>
              <ul className="space-y-2 text-sm text-white/60 mb-6">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> זיהוי AI ללא הגבלה</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> פרטים מורחבים מלאים</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> היסטוריה ומועדפים</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> השוואת רכבים</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> ללא פרסומות</li>
              </ul>
              <Button data-testid="pricing-pro-btn" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                שדרג ל-Pro
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-rubik font-bold text-lg mb-2">רכב IL</h3>
          <p className="text-sm text-white/40 mb-4">מערכת איתור ובדיקת רכבים מתקדמת</p>
          <div className="flex justify-center gap-6 text-sm text-white/40 mb-6">
            <button onClick={() => navigate('/about')} className="hover:text-white/70 transition-colors">אודות</button>
            <button onClick={() => navigate('/pricing')} className="hover:text-white/70 transition-colors">תמחור</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-white/70 transition-colors">פרטיות</button>
            <button onClick={() => navigate('/terms')} className="hover:text-white/70 transition-colors">תנאי שימוש</button>
          </div>
          <p className="text-xs text-white/25">נבנה עם ❤️ בישראל</p>
        </div>
      </footer>
    </div>
  );
}
