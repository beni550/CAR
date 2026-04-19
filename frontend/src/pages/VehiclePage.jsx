import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Heart, Share2, Bell, GitCompareArrows,
  AlertTriangle, CheckCircle, XCircle, Info, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ─── Plate display ─── */
function Plate({ number = '', size = 'md' }) {
  const n = String(number).replace(/\D/g, '');
  const fmt = n.length === 8
    ? n.replace(/(\d{3})(\d{2})(\d{3})/, '$1-$2-$3')
    : n.replace(/(\d{2})(\d{3})(\d{2})/, '$1-$2-$3');
  return (
    <span className={`c-plate ${size === 'lg' ? 'lg' : ''}`}>
      <span className="il">IL</span>
      <span className="num">{fmt || n}</span>
    </span>
  );
}

/* ─── Section label ─── */
function SLabel({ children, tag }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="c-label">{children}</span>
      {tag && <span className="c-tag">{tag}</span>}
    </div>
  );
}

/* ─── Data row ─── */
function Row({ label, value, tag, mono, dot, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px',
      borderBottom: '1px solid var(--console-line, rgba(0,0,0,0.06))',
      fontSize: 13,
      background: highlight ? 'rgba(255,204,0,0.07)' : 'transparent',
    }}>
      {dot && <span className={`c-dot c-dot-${dot}`} />}
      <span style={{ color: 'var(--console-ink-3, #6B6B6B)', flex: '0 0 auto', minWidth: 110 }}>{label}</span>
      <span style={{
        flex: 1, fontWeight: 500, textAlign: 'left',
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
        fontSize: mono ? 12 : 13,
      }}>
        {value}
      </span>
      {tag && <span className="c-tag">{tag}</span>}
    </div>
  );
}

/* ─── Score bar ─── */
function ScoreBar({ score, label, color }) {
  const colors = {
    emerald: { bar: '#10B981', badge: '#D1FAE5', text: '#065F46' },
    blue:    { bar: 'var(--console-yellow, #FFCC00)', badge: 'rgba(255,204,0,0.15)', text: 'var(--console-yellow-ink, #0A0A0A)' },
    amber:   { bar: '#F59E0B', badge: '#FEF3C7', text: '#92400E' },
    red:     { bar: '#EF4444', badge: '#FEE2E2', text: '#991B1B' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{ border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))', borderRadius: 10, padding: 16, background: 'var(--console-bg-1, #FFF)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="c-label" style={{ marginBottom: 4 }}>SCORE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 600 }}>{score}</span>
            <span style={{ color: 'var(--console-ink-3, #6B6B6B)', fontFamily: 'JetBrains Mono, monospace' }}>/100</span>
          </div>
        </div>
        <span style={{ padding: '4px 10px', background: c.badge, color: c.text, borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
          {label?.toUpperCase()}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--console-bg-2, #F4F4F2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: c.bar, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

/* ─── Status card ─── */
function StatusCard({ label, value, tag, status }) {
  const statusDot = {
    ok:      'c-dot-green',
    danger:  'c-dot-red',
    warning: '',
    info:    '',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px',
      borderBottom: '1px solid var(--console-line, rgba(0,0,0,0.06))',
      fontSize: 13,
    }}>
      <span className={`c-dot ${statusDot[status] || 'c-dot-gray'}`} style={{ background: status === 'warning' ? '#F59E0B' : undefined }} />
      <span style={{ flex: 1, color: 'var(--console-ink-3, #6B6B6B)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
      {tag && <span className="c-tag">{tag}</span>}
    </div>
  );
}

/* ─── Loading skeleton ─── */
function LoadingSkeleton() {
  const sk = { background: 'var(--console-bg-3, #EAEAE6)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--console-bg, #FAFAFA)', paddingTop: 64, paddingBottom: 100 }} dir="rtl">
      <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ ...sk, width: 200, height: 50 }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...sk, height: 120, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN VEHICLE PAGE
   ═══════════════════════════════════════════════════════ */
export default function VehiclePage() {
  const { plate } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [favSaved, setFavSaved] = useState(false);
  const [watchSaved, setWatchSaved] = useState(false);
  const [newPlate, setNewPlate] = useState('');

  useEffect(() => {
    document.body.classList.add('console-body');
    return () => document.body.classList.remove('console-body');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await axios.get(`${API}/vehicle/full?plate=${plate}`);
        setData(resp.data);
        if (user) {
          try {
            const veh = resp.data.vehicle || {};
            await axios.post(`${API}/history`, {
              plate,
              manufacturer: veh.tozeret_nm || '',
              model: veh.kinuy_mishari || veh.degem_nm || '',
              year: veh.shnat_yitzur || null,
              source: 'manual'
            }, { withCredentials: true });
          } catch { /* ignore */ }
        }
      } catch (err) {
        setError(err.response?.status === 404
          ? 'הרכב לא נמצא. ודא שהמספר נכון.'
          : 'שגיאה בטעינה. נסה שוב.');
      } finally {
        setLoading(false);
      }
    };
    if (plate) fetchData();
  }, [plate, user]);

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: `רכב ${plate}`, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  const handleSaveFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post(`${API}/favorites`, {
        plate, manufacturer: v.tozeret_nm || '',
        model: v.kinuy_mishari || v.degem_nm || '',
        year: v.shnat_yitzur || null, color: v.tzeva_rechev || '', test_expiry: v.tokef_dt || ''
      }, { withCredentials: true });
      setFavSaved(true);
    } catch { /* ignore */ }
  };

  const handleAddWatchlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post(`${API}/watchlist`, {
        plate, manufacturer: v.tozeret_nm || '',
        model: v.kinuy_mishari || v.degem_nm || '',
        year: v.shnat_yitzur || null, alert_types: ['theft', 'test_expiry']
      }, { withCredentials: true });
      setWatchSaved(true);
    } catch { /* ignore */ }
  };

  /* ─── helpers ─── */
  const formatDate = (d) => {
    if (!d) return null;
    try {
      const s = String(d);
      if (/^\d{8}$/.test(s)) return `${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
      return new Date(s).toLocaleDateString('he-IL');
    } catch { return String(d); }
  };

  const formatNum = (n) => n ? Number(n).toLocaleString('he-IL') : null;

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--console-bg, #FAFAFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} dir="rtl">
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div className="c-label" style={{ marginBottom: 8 }}>ERROR · 404</div>
          <h2 style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{error}</h2>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={() => navigate('/')} className="c-btn">חזרה לבית</button>
          </div>
        </div>
      </div>
    );
  }

  const v = data?.vehicle || {};
  const theft = data?.theft || {};
  const disability = data?.disability || {};
  const price = data?.price || null;
  const score = data?.health_score || null;
  const isMotorcycle = data?.is_motorcycle || false;

  /* MOT validity */
  const testValidDate = v.tokef_dt ? new Date(v.tokef_dt) : null;
  const testValid = testValidDate ? testValidDate > new Date() : null;
  const daysToExpiry = testValidDate ? Math.round((testValidDate - new Date()) / 86400000) : null;

  /* Annual fee lookup */
  const agra = v.kvutsat_agra || v.SUG_AGRA;

  /* Full title */
  const vehicleTitle = [v.tozeret_nm, v.kinuy_mishari || v.degem_nm, v.shnat_yitzur].filter(Boolean).join(' · ');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--console-bg, #FAFAFA)', color: 'var(--console-ink, #0A0A0A)', paddingBottom: 100, fontFamily: 'Heebo, sans-serif' }} dir="rtl">

      {/* Top bar */}
      <div style={{ padding: '68px 16px 0', maxWidth: 720, margin: '0 auto' }}>

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: '1px solid var(--console-line-2, rgba(0,0,0,0.12))', borderRadius: 6, background: 'var(--console-bg-1, #FFF)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--console-ink, #0A0A0A)' }}>
            <ArrowRight size={14} /> חזרה
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleShare} title="שתף" style={{ width: 32, height: 32, border: '1px solid var(--console-line-2)', borderRadius: 6, background: 'var(--console-bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--console-ink)' }}>
              <Share2 size={14} />
            </button>
            <button onClick={handleSaveFavorite} title="מועדף" style={{ width: 32, height: 32, border: '1px solid var(--console-line-2)', borderRadius: 6, background: favSaved ? 'var(--console-yellow)' : 'var(--console-bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--console-ink)' }}>
              <Heart size={14} fill={favSaved ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleAddWatchlist} title="התראות" style={{ width: 32, height: 32, border: '1px solid var(--console-line-2)', borderRadius: 6, background: watchSaved ? 'var(--console-yellow)' : 'var(--console-bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--console-ink)' }}>
              <Bell size={14} />
            </button>
            <button onClick={() => navigate(`/compare?plates=${plate}`)} title="השווה" style={{ width: 32, height: 32, border: '1px solid var(--console-line-2)', borderRadius: 6, background: 'var(--console-bg-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--console-ink)' }}>
              <GitCompareArrows size={14} />
            </button>
          </div>
        </div>

        {/* Plate + title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Plate number={plate} size="lg" />
          </div>
          <div className="c-label" style={{ marginBottom: 6 }}>VEHICLE</div>
          <h1 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {vehicleTitle || 'פרטי רכב'}
          </h1>
          {isMotorcycle && (
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', background: '#FEF3C7', color: '#92400E', border: '1px solid #92400E', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              דו-גלגלי
            </span>
          )}
        </div>

        {/* Score */}
        {score && (
          <div style={{ marginBottom: 14 }}>
            <SLabel tag="HEALTH">ציון בריאות</SLabel>
            <ScoreBar score={score.score} label={score.label} color={score.color} />
          </div>
        )}

        {/* Quick status */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="STATUS">סטטוס</SLabel>
          <div className="c-card-tight">
            <StatusCard
              label="טסט"
              value={testValid === true ? `תקף עד ${formatDate(v.tokef_dt)}${daysToExpiry !== null ? ` (${daysToExpiry} ימים)` : ''}` : testValid === false ? `פג תוקף ${formatDate(v.tokef_dt)}` : '—'}
              tag={testValid === true ? 'OK' : testValid === false ? 'EXPIRED' : '?'}
              status={testValid === true ? 'ok' : testValid === false ? 'danger' : 'info'}
            />
            <StatusCard
              label="גניבה"
              value={theft.stolen ? '⚠️ מדווח כגנוב' : theft.unavailable ? 'מאגר לא זמין' : 'נקי'}
              tag={theft.stolen ? 'ALERT' : 'OK'}
              status={theft.stolen ? 'danger' : 'ok'}
            />
            {disability.has_disability_tag && (
              <StatusCard
                label="תו נכה"
                value={[disability.tag_type, formatDate(disability.issue_date)].filter(Boolean).join(' · ') || 'קיים'}
                tag="DISAB"
                status="info"
              />
            )}
            {price && (
              <StatusCard
                label="שווי משוער"
                value={`₪${formatNum(price.estimated_low)}–${formatNum(price.estimated_high)}`}
                tag="EST"
                status="info"
              />
            )}
          </div>
        </div>

        {/* STOLEN ALERT */}
        {theft.stolen && (
          <div style={{ marginBottom: 14, padding: '12px 14px', background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={18} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#991B1B' }}>⚠️ רכב מדווח כגנוב</div>
              <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>המאגר מציג דיווח גניבה פעיל. בדוק מול רשויות הרישוי.</div>
            </div>
          </div>
        )}

        {/* BASIC INFO */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="BASIC">פרטים בסיסיים</SLabel>
          <div className="c-card-tight">
            <Row label="יצרן" value={v.tozeret_nm} />
            <Row label="דגם" value={v.degem_nm} />
            <Row label="שם מסחרי" value={v.kinuy_mishari} />
            <Row label="שנת ייצור" value={v.shnat_yitzur} mono />
            <Row label="צבע" value={v.tzeva_rechev} />
            <Row label="בעלות" value={v.baalut} />
            <Row label="סוג רכב" value={v.sug_rechev_nm} />
            <Row label="מספר שלדה (VIN)" value={v.mispar_vin || v.vin || v.VIN} mono />
            <Row label="קוד דגם" value={v.degem_cd ? String(v.degem_cd) : null} mono />
            <Row label="מועד עלייה לכביש" value={formatDate(v.moed_aliya_lakvish || v.moed_aliya)} />
            <Row label="תאריך רישום ראשון" value={formatDate(v.horaat_rishum)} />
            <Row label="מספר בעלים" value={v.mispar_baalim} mono />
          </div>
        </div>

        {/* ENGINE */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="ENGINE">מנוע ומנגנון</SLabel>
          <div className="c-card-tight">
            <Row label="דגם מנוע" value={v.degem_manoa} mono />
            <Row label="מספר מנוע" value={v.mispar_manoa} mono />
            <Row label="נפח מנוע" value={v.nefach_manoa ? `${formatNum(v.nefach_manoa)} סמ״ק` : null} mono />
            <Row label="כוח" value={v.koah_sus ? `${v.koah_sus} כ״ס` : null} mono />
            <Row label="סוג דלק" value={v.sug_delek_nm} />
            <Row label="סוג הנעה" value={v.sug_degem || v.SUG_DEGEM} />
            <Row label="תיבת הילוכים" value={v.gir_nm || v.sug_gir_nm} />
            <Row label="מספר הילוכים" value={v.mispar_hilukhim} mono />
          </div>
        </div>

        {/* PHYSICAL */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="SPECS">מידות ומשקל</SLabel>
          <div className="c-card-tight">
            <Row label="סוג מרכב" value={v.sug_merkav_nm || v.SUG_MERKAV_NM} />
            <Row label="דלתות" value={v.mispar_dlatot} mono />
            <Row label="מושבים" value={v.mispar_moshavim} mono />
            <Row label="משקל כולל" value={v.mishkal_kolel ? `${formatNum(v.mishkal_kolel)} ק״ג` : null} mono />
            <Row label="משקל עצמי" value={v.mishkal_atzmi ? `${formatNum(v.mishkal_atzmi)} ק״ג` : null} mono />
            <Row label="כושר גרירה" value={v.kvishat_grar || v.KVISHAT_GRAR ? `${formatNum(v.kvishat_grar || v.KVISHAT_GRAR)} ק״ג` : null} mono />
            <Row label="נפח מטען" value={v.nefach_matan ? `${v.nefach_matan} ל׳` : null} mono />
          </div>
        </div>

        {/* WHEELS */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="WHEELS">גלגלים וצמיגים</SLabel>
          <div className="c-card-tight">
            <Row label="צמיגים קדמיים" value={v.zmig_kidmi || v.ZMIG_KIDMI} mono />
            <Row label="צמיגים אחוריים" value={v.zmig_ahori || v.ZMIG_AHORI} mono />
            <Row label="גלגלי מגנזיום" value={v.galgelei_magnezium === '1' || v.galgelei_magnezium === true ? 'כן' : v.galgelei_magnezium === '0' ? 'לא' : v.galgelei_magnezium} />
            <Row label="TPMS" value={v.TPMS === '1' || v.TPMS === true ? 'כן' : v.TPMS === '0' ? 'לא' : v.TPMS} />
          </div>
        </div>

        {/* SAFETY */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="SAFETY">בטיחות</SLabel>
          <div className="c-card-tight">
            <Row label="ABS" value={v.abs === '1' || v.abs === true ? 'כן' : v.abs === '0' ? 'לא' : v.abs} />
            <Row label="ESP / בקרת יציבות" value={v.ESP === '1' || v.ESP === true || v.hege_koah === '1' ? 'כן' : v.ESP === '0' ? 'לא' : v.ESP} />
            <Row label="כריות אוויר" value={v.merhav_avir || v.MERHAV_AVIR} mono />
            <Row label="מצלמת רוורס" value={v.matzlemat_revers === '1' ? 'כן' : v.matzlemat_revers === '0' ? 'לא' : v.matzlemat_revers} />
            <Row label="חיישן חניה" value={v.haishanei_hanaya === '1' ? 'כן' : v.haishanei_hanaya === '0' ? 'לא' : v.haishanei_hanaya} />
            <Row label="רמת אבזור בטיחות" value={v.ramat_gimur} mono />
          </div>
        </div>

        {/* COMFORT */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="COMFORT">נוחות</SLabel>
          <div className="c-card-tight">
            <Row label="מזגן" value={v.mazgan === '1' || v.mazgan === true ? 'כן' : v.mazgan === '0' ? 'לא' : v.mazgan} />
            <Row label="הגה כוח" value={v.hege_koah === '1' ? 'כן' : v.hege_koah === '0' ? 'לא' : v.hege_koah} />
            <Row label="חלונות חשמל" value={v.halonot_hashmal} />
            <Row label="מושבי עור" value={v.moshvei_or === '1' ? 'כן' : v.moshvei_or === '0' ? 'לא' : v.moshvei_or} />
          </div>
        </div>

        {/* REGISTRATION & FEES */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="REG">רישוי ואגרות</SLabel>
          <div className="c-card-tight">
            <Row label="תוקף טסט" value={formatDate(v.tokef_dt)} highlight={testValid === false} />
            <Row label="מבחן אחרון" value={formatDate(v.mivchan_acharon_dt)} />
            <Row label="אגרה שנתית (קבוצה)" value={agra ? `קבוצה ${agra}` : null} mono />
            <Row label="קבוצת זיהום" value={v.kvutsat_zihum || v.KVUTSAT_ZIHUM} mono />
            <Row label="תקן פליטה" value={v.teken_plita} />
            <Row label="סוג רישיון" value={v.sug_rishui_nm} />
          </div>
        </div>

        {/* PRICE */}
        {price && (
          <div style={{ marginBottom: 14 }}>
            <SLabel tag="VALUE">ערך ומחיר</SLabel>
            <div className="c-card-tight">
              <Row label="מחיר מחירון מקורי" value={price.original_price_min ? `₪${formatNum(price.original_price_min)}${price.original_price_max !== price.original_price_min ? `–${formatNum(price.original_price_max)}` : ''}` : null} mono />
              <Row label="שווי משוער כיום" value={`₪${formatNum(price.estimated_low)}–₪${formatNum(price.estimated_high)}`} mono highlight />
              <Row label="פחת מצטבר" value={price.depreciation_pct ? `${price.depreciation_pct}%` : null} mono />
              <Row label="גיל רכב" value={price.age_years !== undefined ? `${price.age_years} שנים` : null} mono />
              {price.importers?.length > 0 && <Row label="יבואן" value={price.importers.join(', ')} />}
              {price.trims?.length > 0 && <Row label="גרסאות" value={price.trims.join(', ')} />}
            </div>
          </div>
        )}

        {/* Score factors */}
        {score?.factors?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <SLabel tag="FACTORS">גורמי ציון</SLabel>
            <div className="c-card-tight">
              {score.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < score.factors.length - 1 ? '1px solid var(--console-line)' : 'none', fontSize: 13 }}>
                  <span className={`c-dot c-dot-${f.status === 'good' ? 'green' : f.status === 'danger' ? 'red' : 'gray'}`}
                    style={{ background: f.status === 'warning' ? '#F59E0B' : undefined }} />
                  <span style={{ flex: 1 }}>{f.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: f.impact < 0 ? '#EF4444' : 'var(--console-ink-3)' }}>
                    {f.impact === 0 ? '—' : f.impact > 0 ? `+${f.impact}` : f.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick search another plate */}
        <div style={{ marginBottom: 14 }}>
          <SLabel tag="NEW">חיפוש חדש</SLabel>
          <div className="c-card-tight">
            <div style={{ display: 'flex', padding: '12px 14px', gap: 8 }}>
              <input
                dir="ltr"
                value={newPlate}
                onChange={e => setNewPlate(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={e => e.key === 'Enter' && newPlate.length >= 5 && navigate(`/vehicle/${newPlate}`)}
                placeholder="מספר רכב חדש"
                className="c-mono-input"
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 15, padding: '4px 0' }}
              />
              <button
                onClick={() => newPlate.length >= 5 && navigate(`/vehicle/${newPlate}`)}
                style={{ padding: '8px 14px', background: 'var(--console-yellow)', color: 'var(--console-yellow-ink)', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Search size={13} /> חפש
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--console-ink-3)', padding: '20px 0 10px' }}>
          מקור: data.gov.il · © רכב·IL
        </div>
      </div>
    </div>
  );
}
