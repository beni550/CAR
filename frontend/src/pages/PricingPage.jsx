import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Loader2, Star, ChevronDown, Sparkles, Quote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const features = [
  { name: 'חיפוש ידני', free: true, pro: true },
  { name: 'זיהוי AI מתמונה', free: '10 ביום', pro: 'ללא הגבלה' },
  { name: 'פרטים בסיסיים', free: true, pro: true },
  { name: 'פרטים מורחבים', free: false, pro: true },
  { name: 'ציון בריאות רכב', free: true, pro: true },
  { name: 'היסטוריית חיפושים', free: false, pro: true },
  { name: 'רכבים שמורים', free: false, pro: true },
  { name: 'רשימת מעקב והתראות', free: false, pro: true },
  { name: 'השוואת רכבים', free: false, pro: true },
  { name: 'ייצוא PDF', free: false, pro: true },
  { name: 'שווי רכב משוער', free: false, pro: true },
  { name: 'ללא פרסומות', free: false, pro: true },
];

const faqs = [
  { q: 'מה קורה אחרי 10 סריקות AI?', a: 'לאחר 10 סריקות AI ביום, תוכל להמשיך לחפש ידנית ללא הגבלה. כדי להמשיך להשתמש ב-AI, שדרג ל-Pro.' },
  { q: 'איך מבטלים מנוי?', a: 'ניתן לבטל את המנוי בכל עת דרך דף החשבון. המנוי יישאר פעיל עד סוף תקופת החיוב.' },
  { q: 'האם המידע מדויק?', a: 'המידע מגיע ישירות ממאגרי data.gov.il הממשלתיים ומתעדכן באופן שוטף.' },
  { q: 'מאיפה המידע?', a: 'כל הנתונים מגיעים ממשרד התחבורה דרך פלטפורמת הנתונים הפתוחים של ממשלת ישראל (data.gov.il).' },
  { q: 'מה כולל המנוי השנתי?', a: 'המנוי השנתי כולל את כל תכונות Pro ומגיע עם 20% הנחה — $48 לשנה במקום $60. תשלום חד-פעמי, חידוש אוטומטי.' },
  { q: 'מה זה ציון בריאות?', a: 'ציון בריאות הרכב מחושב על בסיס סטטוס גניבה, תוקף טסט, גיל הרכב ובעלות. ציון גבוה = רכב במצב טוב יותר.' },
];

const testimonials = [
  { name: 'דני כ.', role: 'קונה רכב', text: 'גיליתי שהרכב שרציתי לקנות היה מדווח כגנוב. חסך לי אלפי שקלים!', rating: 5 },
  { name: 'מיכל ר.', role: 'סוכנת ביטוח', text: 'כלי עבודה יומי. ה-PDF שמורד מהמערכת חוסך לי שעות של עבודה.', rating: 5 },
  { name: 'יוסי מ.', role: 'מגרש רכבים', text: 'פיצ׳ר ההשוואה מאפשר לי להציג ללקוחות השוואה מקצועית תוך שניות.', rating: 5 },
];

/* FAQ Accordion Item */
function FaqItem({ faq, isOpen, onToggle, index }) {
  return (
    <div
      className="glass-card overflow-hidden transition-all duration-300"
      style={{
        borderRadius: '16px',
        borderColor: isOpen ? 'rgba(99,144,255,0.2)' : undefined,
      }}
      data-testid={`faq-${index}`}
    >
      <button
        onClick={onToggle}
        className="w-full text-right p-5 flex items-center gap-3 transition-all"
        style={{ color: 'var(--text-primary, #fff)' }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: isOpen ? 'linear-gradient(135deg, #6390ff, #a78bfa)' : 'var(--input-bg, rgba(255,255,255,0.05))',
          }}
        >
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: isOpen ? '#fff' : 'var(--text-secondary, rgba(255,255,255,0.4))' }}
          />
        </div>
        <span className="text-sm font-semibold flex-1">{faq.q}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pr-14 text-sm leading-relaxed" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const isPro = user?.plan === 'pro';

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isPro) return;

    setUpgradeLoading(true);
    try {
      const originUrl = window.location.origin;
      const resp = await axios.post(`${API}/checkout/create`, {
        origin_url: originUrl,
        plan_type: billingCycle
      }, { withCredentials: true });
      if (resp.data.url) {
        if (window.posthog) window.posthog.capture('pro_upgrade_clicked', { billing: billingCycle });
        window.location.href = resp.data.url;
      } else {
        setUpgradeLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('שגיאה ביצירת תשלום. נסה שוב.');
      setUpgradeLoading(false);
    }
  };

  const monthlyPrice = 5;
  const annualPrice = 48;
  const annualMonthly = (annualPrice / 12).toFixed(1);
  const savingsPercent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="pricing-page">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-rubik font-bold text-3xl sm:text-4xl mb-3">
            <span className="gradient-text">בחר את התוכנית שלך</span>
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>
            גישה מלאה לכל הכלים שאתה צריך לבדיקת רכב חכמה
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl mt-6" style={{ background: 'var(--input-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-glass, rgba(255,255,255,0.08))' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
              style={billingCycle === 'monthly' ? { background: 'linear-gradient(135deg, #6390ff, #a78bfa)', color: '#fff', boxShadow: '0 4px 15px rgba(99,144,255,0.3)' } : { color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}
              data-testid="billing-monthly"
            >
              חודשי
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2"
              style={billingCycle === 'annual' ? { background: 'linear-gradient(135deg, #6390ff, #a78bfa)', color: '#fff', boxShadow: '0 4px 15px rgba(99,144,255,0.3)' } : { color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}
              data-testid="billing-annual"
            >
              שנתי
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: billingCycle === 'annual' ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.15)', color: billingCycle === 'annual' ? '#fff' : '#34d399' }}>
                -{savingsPercent}%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20 max-w-2xl mx-auto">

          {/* Free Card */}
          <motion.div variants={fadeUp} className="glass-card p-7" style={{ borderRadius: '20px' }} data-testid="pricing-card-free">
            <h3 className="font-rubik font-bold text-xl mb-1" style={{ color: 'var(--text-primary, #fff)' }}>חינם</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>לשימוש בסיסי</p>

            <div className="mb-6">
              <span className="text-5xl font-rubik font-bold" style={{ color: 'var(--text-primary, #fff)' }}>$0</span>
              <span className="text-base mr-1" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>/חודש</span>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 mb-6">
              {['חיפוש ידני ללא הגבלה', '10 סריקות AI ביום', 'פרטים בסיסיים', 'ציון בריאות'].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))' }}>
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
              {['פרטים מורחבים', 'ייצוא PDF', 'השוואת רכבים'].map((f, i) => (
                <li key={`x${i}`} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.25))' }}>
                  <X className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.15))' }} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              data-testid="pricing-start-free-btn"
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300"
              style={{
                border: '1px solid var(--border-glass, rgba(255,255,255,0.12))',
                background: 'var(--input-bg, rgba(255,255,255,0.05))',
                color: 'var(--text-primary, rgba(255,255,255,0.8))',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--input-bg, rgba(255,255,255,0.05))'}
            >
              התחל בחינם
            </button>
          </motion.div>

          {/* Pro Card */}
          <motion.div variants={fadeUp} className="relative" data-testid="pricing-card-pro">
            {/* Gradient border wrapper */}
            <div className="gradient-border p-7 relative" style={{ borderRadius: '20px' }}>
              {/* Badge */}
              <div className="absolute -top-3.5 right-5 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg, #6390ff, #a78bfa)', color: '#fff', boxShadow: '0 4px 15px rgba(99,144,255,0.4)' }}>
                <Zap className="w-3 h-3" />
                הכי פופולרי
              </div>

              <h3 className="font-rubik font-bold text-xl mb-1" style={{ color: '#6390ff' }}>Pro</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>לשימוש מקצועי</p>

              <div className="mb-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={billingCycle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-5xl font-rubik font-bold inline-block"
                    style={{ color: 'var(--text-primary, #fff)' }}
                  >
                    ${billingCycle === 'annual' ? annualMonthly : monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-base mr-1" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>/חודש</span>
              </div>

              {billingCycle === 'annual' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm mb-5" style={{ color: '#34d399' }}>
                  ${annualPrice}/שנה (חסכון של ${monthlyPrice * 12 - annualPrice})
                </motion.p>
              )}
              {billingCycle === 'monthly' && <div className="mb-5" />}

              {/* Feature list */}
              <ul className="space-y-3 mb-6">
                {['זיהוי AI ללא הגבלה', 'פרטים מורחבים והיסטוריה', 'ייצוא PDF והשוואה', 'שווי רכב משוער', 'רשימת מעקב + התראות', 'ללא פרסומות'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))' }}>
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                data-testid="pricing-upgrade-btn"
                onClick={handleUpgrade}
                disabled={upgradeLoading || isPro}
                className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                {upgradeLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> מעבד...</>
                ) : isPro ? (
                  <>המנוי פעיל</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> שדרג ל-Pro</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card p-7 mb-20" style={{ borderRadius: '20px' }} data-testid="features-comparison">
          <h2 className="font-rubik font-bold text-xl mb-8 text-center">השוואת תוכניות</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--input-bg, rgba(15,15,26,0.95))' }}>
                <tr style={{ borderBottom: '1px solid var(--border-glass, rgba(255,255,255,0.08))' }}>
                  <th className="text-right py-4 text-sm font-medium" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>תכונה</th>
                  <th className="text-center py-4 text-sm font-medium w-24" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>חינם</th>
                  <th className="text-center py-4 text-sm font-bold w-24" style={{ color: '#6390ff' }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border-glass, rgba(255,255,255,0.04))',
                      background: i % 2 === 0 ? 'transparent' : 'var(--input-bg, rgba(255,255,255,0.02))',
                    }}
                  >
                    <td className="py-3.5 text-sm" style={{ color: 'var(--text-primary, rgba(255,255,255,0.8))' }}>{f.name}</td>
                    <td className="text-center py-3.5">
                      {f.free === true ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> :
                       f.free === false ? <X className="w-4 h-4 mx-auto" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.15))' }} /> :
                       <span className="text-xs" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.5))' }}>{f.free}</span>}
                    </td>
                    <td className="text-center py-3.5">
                      {f.pro === true ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> :
                       <span className="text-xs" style={{ color: '#6390ff' }}>{f.pro}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
          <h2 className="font-rubik font-bold text-xl mb-8 text-center">מה אומרים המשתמשים שלנו</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
                style={{ borderRadius: '20px' }}
              >
                {/* Quote mark */}
                <div className="mb-4 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.1), rgba(167,139,250,0.1))' }}>
                  <Quote className="w-4 h-4" style={{ color: '#6390ff' }} />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>

                <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.65))' }}>
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.2), rgba(167,139,250,0.2))', color: '#6390ff' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary, #fff)' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto mb-20" data-testid="pricing-faq">
          <h2 className="font-rubik font-bold text-xl mb-8 text-center">שאלות נפוצות</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
