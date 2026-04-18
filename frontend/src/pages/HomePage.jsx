import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Camera, ChevronLeft, BookOpen, Calculator, Car,
  TrendingUp, BarChart3, GitCompareArrows, Bell, Shield, FileText,
  Users, Database, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ===== License Plate Component ===== */
function Plate({ number = '1234567', size = 'md' }) {
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

/* ===== Home Page - Console Style ===== */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plate, setPlate] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Apply console body class
    document.body.classList.add('console-body');
    return () => document.body.classList.remove('console-body');
  }, []);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(history.slice(0, 3));
  }, []);

  const handleSearch = (p) => {
    const clean = String(p).replace(/\D/g, '');
    if (clean.length < 5) return;
    const history = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [clean, ...history.filter(h => h !== clean)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    navigate(`/vehicle/${clean}`);
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await axios.post(`${API}/vehicle/ai-recognize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (resp.data?.plate) {
        handleSearch(resp.data.plate);
      } else {
        alert(resp.data?.message || 'לא זוהתה לוחית רישוי בתמונה');
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'שגיאה בזיהוי התמונה');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--console-bg)', color: 'var(--console-ink)', paddingBottom: 100, fontFamily: 'Heebo, sans-serif' }} dir="rtl">
      {/* Status bar */}
      <div style={{ padding: '64px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--console-ink-3)', maxWidth: 960, margin: '0 auto' }}>
        <span>רכב·IL / חיפוש</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="c-dot c-dot-green" />
          data.gov.il · live
        </span>
      </div>

      {/* Hero */}
      <div style={{ padding: '24px 16px 20px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--console-ink-3)', marginBottom: 8, letterSpacing: '0.04em' }}>&gt; PLATE_LOOKUP</div>
        <h1 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 8 }}>
          בדיקת רכב<br />
          <span style={{ color: 'var(--console-ink-3)' }}>בשנייה אחת.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--console-ink-3)', lineHeight: 1.5, maxWidth: 420, marginBottom: 24 }}>
          מקור רשמי. פלט מובנה. ללא הסחות דעת.
        </p>

        {/* Search — sharp, tight */}
        <div className="c-card-tight" style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--console-line)' }}>
            <Search size={16} style={{ color: 'var(--console-ink-3)' }} />
            <input
              dir="ltr"
              value={plate}
              onChange={e => setPlate(e.target.value.replace(/[^\d-]/g, '').slice(0, 10))}
              onKeyDown={e => e.key === 'Enter' && plate && handleSearch(plate)}
              placeholder="00-000-00"
              className="c-mono-input"
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 18, height: 32,
                textAlign: plate ? 'center' : 'right',
                color: 'var(--console-ink)',
              }}
            />
            <span className="c-tag">⌘K</span>
          </div>
          <div style={{ display: 'flex' }}>
            <button
              onClick={() => plate && handleSearch(plate)}
              style={{
                flex: 1, padding: 14, background: 'var(--console-yellow)',
                color: 'var(--console-yellow-ink)', border: 'none',
                fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderLeft: '1px solid var(--console-line-2)',
              }}
            >
              <Search size={14} strokeWidth={2.2} /> חפש
            </button>
            <button
              onClick={handleCameraClick}
              disabled={uploading}
              style={{
                padding: '14px 18px', background: 'var(--console-bg-1)', color: 'var(--console-ink)',
                fontSize: 13.5, border: 'none', cursor: uploading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Camera size={14} /> {uploading ? 'סורק...' : 'סריקה'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div style={{ marginTop: 18, maxWidth: 560 }}>
            <div className="c-label" style={{ marginBottom: 8 }}>אחרונים</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentSearches.map((r, i) => (
                <button
                  key={r}
                  onClick={() => handleSearch(r)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', border: '1px solid var(--console-line)', borderRadius: 8,
                    background: 'var(--console-bg-1)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                    cursor: 'pointer', color: 'var(--console-ink)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--console-ink-3)', fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ letterSpacing: 1 }}>{r}</span>
                  </span>
                  <ArrowLeft size={14} style={{ color: 'var(--console-ink-3)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What we check */}
      <div style={{ padding: '4px 16px 16px', maxWidth: 960, margin: '0 auto' }}>
        <div className="c-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 4, background: 'var(--console-yellow)' }} /> שדות פלט
        </div>
        <div className="c-card-tight">
          {[
            ['01', 'טסט ובטיחות', 'MOT'],
            ['02', 'מרשם גניבה', 'STOLEN'],
            ['03', 'בעלויות והיסטוריה', 'OWNERS'],
            ['04', 'שווי משוער', 'VALUE'],
            ['05', 'תו נכה', 'DISABILITY'],
          ].map((r, i, a) => (
            <div key={r[0]} className="c-row">
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--console-ink-3)' }}>{r[0]}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{r[1]}</span>
              <span className="c-tag">{r[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tools grid */}
      <div style={{ padding: '8px 16px 16px', maxWidth: 960, margin: '0 auto' }}>
        <div className="c-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 4, background: 'var(--console-yellow)' }} /> כלים
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
          {[
            { id: 'compare', label: 'השוואה', icon: GitCompareArrows, path: '/compare' },
            { id: 'calculators', label: 'מחשבונים', icon: Calculator, path: '/calculators' },
            { id: 'statistics', label: 'סטטיסטיקות', icon: BarChart3, path: '/statistics' },
            { id: 'guides', label: 'מדריכים', icon: BookOpen, path: '/guides' },
            { id: 'encyclopedia', label: 'אנציקלופדיה', icon: Database, path: '/encyclopedia' },
            { id: 'watchlist', label: 'התראות', icon: Bell, path: '/watchlist' },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.path)}
                style={{
                  padding: 14, border: '1px solid var(--console-line-2)', borderRadius: 8,
                  background: 'var(--console-bg-1)', textAlign: 'right', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: 'var(--console-ink)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600 }}>
                  <Icon size={16} style={{ color: 'var(--console-yellow-ink)', background: 'var(--console-yellow)', padding: 4, borderRadius: 4, boxSizing: 'content-box' }} />
                  {t.label}
                </span>
                <ChevronLeft size={13} style={{ color: 'var(--console-ink-3)' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '4px 16px 16px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid var(--console-line)', borderRadius: 10, overflow: 'hidden', background: 'var(--console-bg-1)' }}>
          {[
            { v: '4.2M', k: 'רכבים' },
            { v: '<1s', k: 'תגובה' },
            { v: '99.9%', k: 'זמינות' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 10px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--console-line)' : 'none' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 20, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: 'var(--console-ink-3)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div style={{ padding: '20px 16px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--console-ink-3)', maxWidth: 960, margin: '0 auto' }}>
        © רכב·IL · מאומת ממאגרי המדינה
      </div>
    </div>
  );
}
