import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';
import { BarChart3, Car, Fuel, Palette, Calendar, TrendingUp, RefreshCw, Activity, Hash, Trophy } from 'lucide-react';
import AdBanner from '../components/AdBanner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ease = [0.4, 0, 0.2, 1];
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const COLOR_MAP = {
  'לבן': '#FFFFFF', 'שחור': '#1a1a1a', 'אפור': '#808080', 'כסף': '#C0C0C0', 'כסוף': '#C0C0C0',
  'אדום': '#DC2626', 'כחול': '#2563EB', 'ירוק': '#16A34A', 'צהוב': '#EAB308', 'כתום': '#EA580C',
  'חום': '#92400E', 'בז\'': '#D2B48C', 'בז': '#D2B48C', 'זהב': '#D4AF37', 'בורדו': '#800020',
  'תכלת': '#67E8F9', 'סגול': '#7C3AED', 'ורוד': '#EC4899', 'טורקיז': '#14B8A6', 'בורגונדי': '#800020',
};

function getColorHex(hebrewColor) {
  if (!hebrewColor) return '#6B7280';
  const lower = hebrewColor.trim();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return '#6B7280';
}

const FUEL_ICONS = {
  'בנזין': '⛽', 'דיזל': '🛢️', 'חשמל': '🔌', 'היברידי': '🔋', 'גז': '💨', 'טורבו דיזל': '🛢️', 'default': '⛽',
};

function getFuelIcon(fuelName) {
  if (!fuelName) return FUEL_ICONS.default;
  const lower = fuelName.trim();
  for (const [key, icon] of Object.entries(FUEL_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return FUEL_ICONS.default;
}

const DONUT_COLORS = [
  '#6390ff', '#22d3ee', '#a78bfa', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !target) return;
    const num = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(num)) { setValue(target); return; }
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * num);
      setValue(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { ref, value };
}

/* ── Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-[20px]" />
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-72 rounded-[20px]" />
      ))}
    </div>
  );
}

/* ── Error ── */
function ErrorState({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="font-rubik font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>לא ניתן לטעון נתונים</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>אירעה שגיאה בטעינת הנתונים הסטטיסטיים. נסה שוב.</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, #6390ff, #a78bfa)' }}
      >
        <RefreshCw className="w-4 h-4" />
        נסה שוב
      </button>
    </motion.div>
  );
}

/* ── Summary Card ── */
function SummaryCard({ icon, label, value, sub, highlight = false }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`glass-card p-5 text-center relative overflow-hidden ${highlight ? 'gradient-border' : ''}`}
      whileHover={{ y: -2, transition: { duration: 0.2, ease } }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.15), rgba(167,139,250,0.15))' }}
      >
        <span style={{ color: '#6390ff' }}>{icon}</span>
      </div>
      <div className="font-rubik font-bold text-2xl sm:text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{sub}</div>}
      {/* gradient underline */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-12 rounded-full" style={{ background: 'linear-gradient(90deg, #6390ff, #22d3ee)' }} />
    </motion.div>
  );
}

/* ── Manufacturers Bar Chart ── */
function ManufacturersChart({ data }) {
  const top15 = data.slice(0, 15);
  const maxCount = top15[0]?.count || 1;
  const total = data.reduce((s, d) => s + d.count, 0);

  const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={stagger}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.15), rgba(34,211,238,0.15))' }}
        >
          <BarChart3 className="w-5 h-5" style={{ color: '#6390ff' }} />
        </div>
        <div>
          <h2 className="font-rubik font-bold text-lg" style={{ color: 'var(--text-primary)' }}>יצרנים מובילים</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>15 יצרני הרכב הפופולריים ביותר בישראל</p>
        </div>
      </div>

      <div className="space-y-3">
        {top15.map((item, i) => {
          const pct = ((item.count / total) * 100).toFixed(1);
          const barWidth = (item.count / maxCount) * 100;
          const isMedal = i < 3;
          return (
            <motion.div key={item.tozeret_nm} variants={fadeUp} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isMedal ? (
                    <span className="w-5 text-left flex-shrink-0">
                      <Trophy className="w-4 h-4 inline" style={{ color: medals[i] }} />
                    </span>
                  ) : (
                    <span className="text-xs w-5 text-left font-mono" style={{ color: 'var(--text-secondary)' }}>{i + 1}</span>
                  )}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.tozeret_nm}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.count.toLocaleString('he-IL')}</span>
                  <span className="text-xs font-medium w-12 text-left" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>{pct}%</span>
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-glass, rgba(255,255,255,0.05))' }}>
                <div
                  className="bar-animate h-full rounded-full group-hover:brightness-125 transition-[filter]"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, #6390ff, #22d3ee)`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Fuel Distribution (donut) ── */
function FuelDistribution({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const segments = data.map((item, i) => ({
    ...item,
    pct: (item.count / total) * 100,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
    icon: getFuelIcon(item.sug_delek_nm),
  }));

  let acc = 0;
  const gradientParts = segments.map((seg) => {
    const start = acc;
    acc += seg.pct;
    return `${seg.color} ${start}% ${acc}%`;
  });
  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={stagger}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(167,139,250,0.15))' }}
        >
          <Fuel className="w-5 h-5" style={{ color: '#22d3ee' }} />
        </div>
        <div>
          <h2 className="font-rubik font-bold text-lg" style={{ color: 'var(--text-primary)' }}>התפלגות סוגי דלק</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>סוגי הדלק הנפוצים ברכבים בישראל</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -90 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease }}
          className="donut-chart relative w-52 h-52 flex-shrink-0"
        >
          <div className="w-full h-full rounded-full" style={{ background: conicGradient }} />
          <div className="absolute inset-5 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card, #0a0e1a)' }}>
            <div className="glass-card px-4 py-3 text-center" style={{ borderRadius: '16px' }}>
              <div className="font-rubik font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString('he-IL')}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>סה"כ</div>
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {segments.map((seg) => (
            <motion.div
              key={seg.sug_delek_nm}
              variants={fadeUp}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}40` }} />
                <span className="text-lg ml-1">{seg.icon}</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{seg.sug_delek_nm}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{seg.count.toLocaleString('he-IL')}</span>
                <span className="text-sm font-medium w-14 text-left" style={{ color: 'var(--text-primary)' }}>{seg.pct.toFixed(1)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Year Timeline ── */
function YearTimeline({ data }) {
  const currentYear = new Date().getFullYear();
  const filtered = data
    .filter(d => d.shnat_yitzur >= 2000 && d.shnat_yitzur <= currentYear)
    .sort((a, b) => a.shnat_yitzur - b.shnat_yitzur);

  if (filtered.length === 0) return null;

  const maxCount = Math.max(...filtered.map(d => d.count));
  const peakYear = filtered.reduce((peak, d) => d.count > peak.count ? d : peak, filtered[0]);

  const recent5 = filtered.filter(d => d.shnat_yitzur >= currentYear - 5);
  const prev5 = filtered.filter(d => d.shnat_yitzur >= currentYear - 10 && d.shnat_yitzur < currentYear - 5);
  const recentAvg = recent5.length > 0 ? recent5.reduce((s, d) => s + d.count, 0) / recent5.length : 0;
  const prevAvg = prev5.length > 0 ? prev5.reduce((s, d) => s + d.count, 0) / prev5.length : 0;
  const isGettingNewer = recentAvg > prevAvg;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={stagger}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))' }}
        >
          <Calendar className="w-5 h-5" style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <h2 className="font-rubik font-bold text-lg" style={{ color: 'var(--text-primary)' }}>התפלגות שנות ייצור</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>רכבים לפי שנת ייצור (2000-{currentYear})</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 mr-13">
        <TrendingUp className="w-4 h-4" style={{ color: isGettingNewer ? '#22d3ee' : '#f59e0b' }} />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isGettingNewer
            ? 'מגמה: צי הרכב בישראל מתחדש — יותר רכבים חדשים בשנים האחרונות'
            : 'מגמה: רכבים ותיקים עדיין נפוצים מאוד בצי הרכב'}
        </span>
      </div>

      {/* Vertical bar chart */}
      <div className="flex items-end gap-[2px] sm:gap-1 h-52 overflow-x-auto pb-2">
        {filtered.map((item, i) => {
          const barHeight = (item.count / maxCount) * 100;
          const isPeak = item.shnat_yitzur === peakYear.shnat_yitzur;
          return (
            <div
              key={item.shnat_yitzur}
              className="group relative flex-1 min-w-[12px] flex flex-col justify-end h-full"
            >
              <div
                className="bar-animate-up w-full rounded-t transition-[filter] cursor-default group-hover:brightness-125"
                style={{
                  height: `${barHeight}%`,
                  background: isPeak
                    ? 'linear-gradient(180deg, #f59e0b, #ea580c)'
                    : 'linear-gradient(180deg, #6390ff, #a78bfa)',
                  boxShadow: isPeak ? '0 0 16px rgba(245,158,11,0.4)' : 'none',
                  animationDelay: `${i * 0.02}s`,
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="glass-card px-3 py-2 text-xs whitespace-nowrap" style={{ borderRadius: '12px' }}>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.shnat_yitzur}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{item.count.toLocaleString('he-IL')} רכבים</div>
                </div>
              </div>
              {/* Year label */}
              {(item.shnat_yitzur % 5 === 0 || isPeak) && (
                <div
                  className="text-[9px] sm:text-[10px] text-center mt-1 font-medium"
                  style={{ color: isPeak ? '#f59e0b' : 'var(--text-secondary)' }}
                >
                  {item.shnat_yitzur}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border-glass, rgba(255,255,255,0.06))' }}>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          שנת שיא: <span className="font-medium" style={{ color: '#f59e0b' }}>{peakYear.shnat_yitzur}</span> ({peakYear.count.toLocaleString('he-IL')} רכבים)
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{filtered.length} שנים</span>
      </div>
    </motion.div>
  );
}

/* ── Color Distribution ── */
function ColorDistribution({ data }) {
  const top12 = data.slice(0, 12);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={stagger}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(236,72,153,0.15))' }}
        >
          <Palette className="w-5 h-5" style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h2 className="font-rubik font-bold text-lg" style={{ color: 'var(--text-primary)' }}>צבעי רכב פופולריים</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>הצבעים הנפוצים ביותר בכבישי ישראל</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {top12.map((item, i) => {
          const hex = getColorHex(item.tzeva_rechev);
          const pct = ((item.count / total) * 100).toFixed(1);

          return (
            <motion.div
              key={item.tzeva_rechev}
              variants={fadeUp}
              whileHover={{ y: -3, transition: { duration: 0.2, ease } }}
              className="glass-card p-4 flex flex-col items-center gap-3 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-full"
                style={{
                  backgroundColor: hex,
                  boxShadow: `0 4px 24px ${hex}50, 0 0 0 3px ${hex}20`,
                  border: '2px solid var(--border-glass, rgba(255,255,255,0.08))',
                }}
              />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.tzeva_rechev}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.count.toLocaleString('he-IL')}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>{pct}%</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════ */
export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [colors, setColors] = useState([]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [mfgRes, fuelRes, yearRes, colorRes] = await Promise.all([
        axios.get(`${API}/statistics/popular-manufacturers`),
        axios.get(`${API}/statistics/fuel-distribution`),
        axios.get(`${API}/statistics/year-distribution`),
        axios.get(`${API}/statistics/color-distribution`),
      ]);
      setManufacturers(mfgRes.data.manufacturers || []);
      setFuelTypes(fuelRes.data.fuel_types || []);
      setYears(yearRes.data.years || []);
      setColors(colorRes.data.colors || []);
    } catch (err) {
      console.error('Statistics fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const topManufacturer = manufacturers[0]?.tozeret_nm || '—';
  const topFuel = fuelTypes[0]?.sug_delek_nm || '—';

  const totalVehicles = useMemo(() => {
    return years.reduce((s, y) => s + y.count, 0);
  }, [years]);

  const averageAge = useMemo(() => {
    if (years.length === 0) return '—';
    const currentYear = new Date().getFullYear();
    const tv = years.reduce((s, y) => s + y.count, 0);
    const weightedSum = years.reduce((s, y) => s + (currentYear - y.shnat_yitzur) * y.count, 0);
    if (tv === 0) return '—';
    return (weightedSum / tv).toFixed(1);
  }, [years]);

  const statCount = useMemo(() => {
    return manufacturers.length + fuelTypes.length + years.length + colors.length;
  }, [manufacturers, fuelTypes, years, colors]);

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease }}
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(99,144,255,0.12), rgba(34,211,238,0.12))',
              border: '1px solid rgba(99,144,255,0.2)',
              color: '#6390ff',
            }}
          >
            <Activity className="w-4 h-4" />
            <span>
              {!loading && statCount > 0
                ? `${statCount.toLocaleString('he-IL')} נקודות נתונים`
                : 'נתונים בזמן אמת'}
            </span>
          </motion.div>

          <h1 className="gradient-text font-rubik font-bold text-3xl sm:text-4xl md:text-5xl mb-4 leading-tight">
            סטטיסטיקות שוק הרכב
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            ניתוח מעמיק של נתוני הרכב בישראל — מבוסס על נתוני data.gov.il ממשרד התחבורה
          </p>
        </motion.div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState onRetry={fetchAllData} />
        ) : (
          <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
            {/* ── Summary Cards ── */}
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SummaryCard
                icon={<Car className="w-5 h-5" />}
                label="רכבים במאגר"
                value={totalVehicles > 0 ? totalVehicles.toLocaleString('he-IL') : '~4.2M'}
                sub="כלי רכב רשומים"
                highlight
              />
              <SummaryCard
                icon={<BarChart3 className="w-5 h-5" />}
                label="יצרן מוביל"
                value={topManufacturer}
                sub="הכי נפוץ בכבישים"
              />
              <SummaryCard
                icon={<Fuel className="w-5 h-5" />}
                label="דלק נפוץ"
                value={topFuel}
                sub="סוג הדלק העיקרי"
              />
              <SummaryCard
                icon={<Calendar className="w-5 h-5" />}
                label="גיל ממוצע"
                value={averageAge !== '—' ? `${averageAge} שנים` : '—'}
                sub="גיל ממוצע לרכב"
              />
            </motion.div>

            {/* ── Manufacturers ── */}
            {manufacturers.length > 0 && <ManufacturersChart data={manufacturers} />}

            {/* Ad placement */}
            <AdBanner variant="in-article" className="my-4" />

            {/* ── Fuel ── */}
            {fuelTypes.length > 0 && <FuelDistribution data={fuelTypes} />}

            {/* ── Years ── */}
            {years.length > 0 && <YearTimeline data={years} />}

            {/* ── Colors ── */}
            {colors.length > 0 && <ColorDistribution data={colors} />}

            {/* Footer */}
            <motion.div variants={fadeUp} className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
                הנתונים מבוססים על מאגרי המידע הפתוחים של data.gov.il — משרד התחבורה והבטיחות בדרכים
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
