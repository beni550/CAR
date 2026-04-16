import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Accessibility, Heart, Share2, ArrowRight, Lock, Search, DollarSign, Bike, Gauge, Download, GitCompareArrows, Bell, CheckCircle2, AlertTriangle, XCircle, Car, Star, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }
};
const slideIn = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
};

/* ─── Hebrew Color Map ─── */
const COLOR_MAP = {
  'לבן': '#FFFFFF', 'שחור': '#1a1a1a', 'אפור': '#808080', 'כסף': '#C0C0C0', 'כסוף': '#C0C0C0',
  'אדום': '#DC2626', 'כחול': '#2563EB', 'ירוק': '#16A34A', 'צהוב': '#EAB308', 'כתום': '#EA580C',
  'חום': '#92400E', 'בז\'': '#D2B48C', 'בז': '#D2B48C', 'זהב': '#D4AF37', 'בורדו': '#800020',
  'תכלת': '#67E8F9', 'סגול': '#7C3AED', 'ורוד': '#EC4899', 'טורקיז': '#14B8A6', 'בורגונדי': '#800020',
};

function getColorHex(hebrewColor) {
  if (!hebrewColor) return null;
  const lower = hebrewColor.trim();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

/* ─── License Plate Display ─── */
function LicensePlateDisplay({ plate, isMotorcycle }) {
  const formatted = plate.length === 7
    ? `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`
    : plate.length === 8
    ? `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`
    : plate;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`license-plate max-w-sm mx-auto text-3xl sm:text-4xl ${isMotorcycle ? '!border-orange-500/60' : ''}`}
      style={{ borderRadius: '14px' }}
      data-testid="license-plate-display"
    >
      <div className={`il-strip ${isMotorcycle ? '!bg-gradient-to-b !from-orange-600 !to-orange-800' : ''}`}>
        <span className="text-[8px]">{isMotorcycle ? '' : ''}</span>
        <span>IL</span>
      </div>
      <div className="plate-number plate-number-animate" style={{ letterSpacing: '5px', fontWeight: 800 }}>{formatted}</div>
    </motion.div>
  );
}

/* ─── Premium Health Score Ring ─── */
function HealthScoreRing({ score }) {
  if (!score) return null;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.score / 100) * circumference;
  const gradientId = 'healthScoreGradient';

  const colorMap = {
    emerald: { start: '#10b981', end: '#34d399', glow: 'rgba(16,185,129,0.3)' },
    blue: { start: '#6390ff', end: '#22d3ee', glow: 'rgba(99,144,255,0.3)' },
    amber: { start: '#f59e0b', end: '#fbbf24', glow: 'rgba(245,158,11,0.3)' },
    red: { start: '#ef4444', end: '#f87171', glow: 'rgba(239,68,68,0.3)' },
  };
  const colors = colorMap[score.color] || colorMap.blue;

  const factorIcons = ['🛡️', '📋', '📅', '🔧'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center"
      data-testid="health-score"
    >
      <div className="relative w-36 h-36">
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-40"
          style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 70%)` }}
        />
        <svg className="w-36 h-36 -rotate-90 relative z-10" viewBox="0 0 140 140">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          {/* Score arc */}
          <motion.circle
            cx="70" cy="70" r={radius} fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${colors.start})` }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.span
            className="text-4xl font-rubik font-bold"
            style={{ color: colors.start }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {score.score}
          </motion.span>
          <span className="text-xs mt-0.5" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>מתוך 100</span>
        </div>
      </div>

      {/* Label */}
      <motion.span
        className="text-base font-semibold mt-3"
        style={{ color: colors.start }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {score.label}
      </motion.span>

      {/* Factor badges */}
      {score.factors?.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2 mt-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {score.factors.map((f, i) => (
            <span key={i} className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm transition-all duration-300 ${
              f.status === 'good' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              f.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              f.status === 'danger' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-white/5 text-white/40 border border-white/10'
            }`}>
              <span className="text-[10px]">{factorIcons[i] || '·'}</span>
              {f.name}
            </span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Premium Status Card ─── */
function StatusCard({ type, title, value, detail, icon }) {
  const config = {
    clean: {
      bg: 'bg-emerald-500/[0.06]',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/10',
    },
    stolen: {
      bg: 'bg-red-500/[0.06]',
      border: 'border-red-500/40',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      valueColor: 'text-red-400',
      glowColor: 'shadow-red-500/10',
    },
    expired: {
      bg: 'bg-red-500/[0.06]',
      border: 'border-red-500/30',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      valueColor: 'text-red-400',
      glowColor: 'shadow-red-500/10',
    },
    disability: {
      bg: 'bg-blue-500/[0.06]',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      valueColor: 'text-blue-400',
      glowColor: 'shadow-blue-500/10',
    },
    none: {
      bg: 'bg-white/[0.02]',
      border: 'border-white/10',
      iconBg: 'bg-white/5',
      iconColor: 'text-white/40',
      valueColor: 'text-white/50',
      glowColor: '',
    },
    warning: {
      bg: 'bg-amber-500/[0.06]',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      valueColor: 'text-amber-400',
      glowColor: 'shadow-amber-500/10',
    },
  };

  const c = config[type] || config.none;
  const isStolen = type === 'stolen';
  const isClean = type === 'clean';

  return (
    <motion.div
      variants={fadeUp}
      className={`relative rounded-[20px] p-4 border backdrop-blur-md ${c.bg} ${c.border} ${isStolen ? 'shake-animation' : ''} transition-all duration-300 hover:shadow-lg ${c.glowColor} group min-w-[160px] snap-start`}
      data-testid={`status-${type}`}
    >
      {/* Subtle gradient accent on left border */}
      <div className={`absolute right-0 top-3 bottom-3 w-[3px] rounded-full ${
        type === 'clean' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
        type === 'stolen' || type === 'expired' ? 'bg-gradient-to-b from-red-400 to-red-600' :
        type === 'disability' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
        type === 'warning' ? 'bg-gradient-to-b from-amber-400 to-amber-600' :
        'bg-gradient-to-b from-white/10 to-white/5'
      }`} />

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg} ${c.iconColor} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>{title}</div>
          <div className={`font-rubik font-semibold text-sm flex items-center gap-1.5 ${c.valueColor}`}>
            {isClean && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
            {isStolen && <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
            {value}
          </div>
          {detail && <div className="text-[11px] mt-1 text-white/30 leading-tight">{detail}</div>}
        </div>
      </div>

      {isClean && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1 left-1 text-xs pointer-events-none"
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Field Row (Redesigned) ─── */
function FieldRow({ label, value, locked }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0 group">
      <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>{label}</span>
      {locked ? (
        <span className="flex items-center gap-1.5 text-[13px] text-white/20 bg-white/[0.03] px-3 py-1 rounded-lg">
          <Lock className="w-3 h-3" /> Pro
        </span>
      ) : (
        <span className="text-[13px] font-medium transition-colors duration-200 group-hover:text-white" style={{ color: 'var(--text-primary, rgba(255,255,255,0.85))' }}>{value || '—'}</span>
      )}
    </div>
  );
}

/* ─── Color Display ─── */
function ColorDisplay({ colorName }) {
  const hex = getColorHex(colorName);
  if (!hex) return <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary, rgba(255,255,255,0.85))' }}>{colorName || '—'}</span>;
  return (
    <span className="flex items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--text-primary, rgba(255,255,255,0.85))' }}>
      <span
        className="w-5 h-5 rounded-full inline-block ring-2 ring-white/10 ring-offset-1 ring-offset-transparent"
        style={{ backgroundColor: hex }}
      />
      {colorName}
    </span>
  );
}

/* ─── Price Formatting ─── */
function formatPrice(num) {
  if (!num && num !== 0) return '—';
  return '₪' + Number(num).toLocaleString('he-IL');
}

/* ─── Premium Price Card ─── */
function PriceCard({ price, isPro, navigate }) {
  if (!price) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative rounded-[20px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6 mb-6" data-testid="price-card-empty">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="font-rubik font-semibold text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>שווי רכב משוער</h3>
        </div>
        <p className="text-sm text-white/40">מחיר מחירון לא זמין לדגם זה</p>
      </motion.div>
    );
  }

  const priceMin = price.estimated_low || 0;
  const priceMax = price.estimated_high || 0;
  const origMin = price.original_price_min || 0;
  const origMax = price.original_price_max || 0;
  const barPercent = origMax > 0 ? Math.min(((priceMin + priceMax) / 2) / origMax * 100, 100) : 50;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative rounded-[20px] p-[1px] mb-6 gradient-border" data-testid="price-card">
      <div className="rounded-[20px] bg-[#0c1222] p-6 relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-rubik font-semibold text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>שווי רכב משוער</h3>
          </div>
          {!isPro && (
            <span className="text-[11px] bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-medium">
              Pro
            </span>
          )}
        </div>

        {isPro ? (
          <div className="relative z-10">
            {/* Estimated Value - prominent */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/15 p-5 mb-5">
              <div className="text-xs text-amber-400/70 mb-2 font-medium">שווי נוכחי משוער</div>
              <div className="text-2xl sm:text-3xl font-rubik font-bold text-amber-400 mb-3" data-testid="estimated-value">
                {formatPrice(priceMin)} — {formatPrice(priceMax)}
              </div>
              {/* Visual price bar */}
              <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-amber-400 to-amber-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${barPercent}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-white/25">
                <span>מחיר נמוך</span>
                <span>מחיר גבוה</span>
              </div>
            </div>

            {/* Details grid */}
            <div className="space-y-0">
              <div className="flex justify-between items-center py-3 border-b border-white/[0.04]">
                <span className="text-[13px]" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>מחיר מחירון (כחדש)</span>
                <span className="text-[13px] font-medium text-white/80">
                  {origMin === origMax ? formatPrice(origMin) : `${formatPrice(origMin)} — ${formatPrice(origMax)}`}
                </span>
              </div>
              {price.importers?.length > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-white/[0.04]">
                  <span className="text-[13px]" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>יבואן</span>
                  <span className="text-[13px] font-medium text-white/80">{price.importers.join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-white/[0.04]">
                <span className="text-[13px]" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>פחת ({price.age_years} שנים)</span>
                <span className="text-[13px] font-semibold text-red-400">-{price.depreciation_pct}%</span>
              </div>
            </div>

            {price.trims?.length > 1 && (
              <p className="text-[11px] text-white/20 mt-3">
                * על בסיס {price.record_count} רמות גימור שונות
              </p>
            )}
            <p className="text-[11px] text-white/15 mt-2">
              הערכה מבוססת על מחירון יבואן רשמי ופחת ממוצע
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="filter blur-sm pointer-events-none select-none">
              <div className="rounded-2xl bg-amber-500/10 p-5 mb-4">
                <div className="text-xs text-amber-400/70 mb-2">שווי נוכחי משוער</div>
                <div className="text-2xl font-rubik font-bold text-amber-400">₪XX,XXX — ₪YY,YYY</div>
                <div className="mt-3 h-2 rounded-full bg-white/5">
                  <div className="h-full w-[60%] rounded-full bg-amber-400" />
                </div>
              </div>
              <div className="py-2 border-b border-white/5 flex justify-between">
                <span className="text-sm text-white/50">מחיר מחירון</span>
                <span className="text-sm">₪XXX,XXX</span>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c1222]/70 rounded-2xl backdrop-blur-[2px]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-sm text-white/50 mb-4">שדרג ל-Pro כדי לראות שווי הרכב</p>
              <Button
                data-testid="upgrade-price-btn"
                onClick={() => navigate('/pricing')}
                size="sm"
                className="text-white rounded-xl text-sm px-6 py-2.5 font-semibold border-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
              >
                שדרג ל-Pro — $5/חודש
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Section Heading ─── */
function SectionHeading({ children, icon }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      {icon && <span className="text-white/30">{icon}</span>}
      <h3 className="font-rubik font-semibold text-[13px] uppercase tracking-wider" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>{children}</h3>
    </div>
  );
}

/* ─── Glass Card Wrapper ─── */
function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-[20px] border backdrop-blur-md bg-white/[0.02] p-5 transition-all duration-300 ${className}`}
      style={{ borderColor: 'var(--border-glass, rgba(255,255,255,0.08))' }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Action Pill Button ─── */
function ActionPill({ icon, label, onClick, active, activeGradient, disabled, testId }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
        active
          ? 'border-transparent text-white shadow-lg'
          : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/15'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={active ? { background: activeGradient || 'linear-gradient(135deg, #6390ff, #a78bfa)' } : undefined}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

/* ─── PDF Export (unchanged logic) ─── */
function handlePdfExport(plate, v, data, isMotorcycle) {
  const formatted = plate.length === 7
    ? `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`
    : plate.length === 8
    ? `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`
    : plate;

  const testValid = v.tokef_dt ? new Date(v.tokef_dt) > new Date() : null;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<title>דו"ח רכב ${formatted}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Heebo:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Heebo', sans-serif; direction: rtl; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
  h1 { font-family: 'Rubik', sans-serif; font-size: 28px; margin-bottom: 8px; color: #0a0e1a; }
  h2 { font-family: 'Rubik', sans-serif; font-size: 18px; margin: 24px 0 12px; color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
  .plate { background: linear-gradient(180deg, #FFD500, #FFCC00); border: 3px solid #1a1a1a; border-radius: 8px; display: inline-flex; direction: ltr; font-family: 'Rubik', monospace; font-weight: 700; font-size: 24px; letter-spacing: 4px; padding: 8px 20px; margin: 16px 0; }
  .plate .il { background: linear-gradient(180deg, #003399, #002277); color: white; padding: 4px 8px; font-size: 10px; letter-spacing: 1px; display: flex; flex-direction: column; align-items: center; margin-left: 12px; border-radius: 4px 0 0 4px; }
  .status-row { display: flex; gap: 16px; margin: 16px 0; }
  .status-card { flex: 1; padding: 12px 16px; border-radius: 8px; border-right: 4px solid; }
  .status-clean { border-color: #10b981; background: #ecfdf5; }
  .status-danger { border-color: #ef4444; background: #fef2f2; }
  .status-neutral { border-color: #94a3b8; background: #f8fafc; }
  .status-label { font-size: 12px; color: #666; }
  .status-value { font-family: 'Rubik', sans-serif; font-weight: 600; font-size: 16px; }
  .status-clean .status-value { color: #10b981; }
  .status-danger .status-value { color: #ef4444; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  td:first-child { color: #666; width: 40%; }
  td:last-child { font-weight: 500; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; text-align: center; }
  .score-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-family: 'Rubik', sans-serif; font-weight: 700; font-size: 18px; margin: 8px 0; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>דו"ח בדיקת רכב — רכב IL</h1>
<p style="color: #666; margin-bottom: 16px;">הופק בתאריך ${new Date().toLocaleDateString('he-IL')}</p>

<div style="text-align: center;">
  <div class="plate">${formatted}</div>
</div>

${data.health_score ? `
<div style="text-align: center; margin: 16px 0;">
  <div class="score-badge" style="background: ${data.health_score.color === 'emerald' ? '#ecfdf5; color: #10b981' : data.health_score.color === 'blue' ? '#eff6ff; color: #3b82f6' : data.health_score.color === 'amber' ? '#fffbeb; color: #f59e0b' : '#fef2f2; color: #ef4444'}">
    ציון: ${data.health_score.score}/100 — ${data.health_score.label}
  </div>
</div>
` : ''}

<h2>סטטוס</h2>
<div class="status-row">
  <div class="status-card ${data.theft?.stolen ? 'status-danger' : 'status-clean'}">
    <div class="status-label">גניבה</div>
    <div class="status-value">${data.theft?.stolen ? 'מדווח כגנוב!' : 'נקי'}</div>
  </div>
  <div class="status-card ${testValid === false ? 'status-danger' : testValid ? 'status-clean' : 'status-neutral'}">
    <div class="status-label">טסט</div>
    <div class="status-value">${testValid === false ? 'פג תוקף' : testValid ? 'בתוקף' : '— לא זמין'}</div>
    ${v.tokef_dt ? `<div style="font-size: 11px; color: #999; margin-top: 4px;">עד ${new Date(v.tokef_dt).toLocaleDateString('he-IL')}</div>` : ''}
  </div>
  <div class="status-card ${data.disability?.has_disability_tag ? 'status-neutral' : 'status-neutral'}">
    <div class="status-label">תו נכה</div>
    <div class="status-value">${data.disability?.has_disability_tag ? 'כן' : 'לא'}</div>
  </div>
</div>

<h2>פרטים בסיסיים</h2>
<table>
  <tr><td>יצרן</td><td>${v.tozeret_nm || '—'}</td></tr>
  <tr><td>דגם</td><td>${isMotorcycle ? (v.degem_nm || '—') : (v.kinuy_mishari || '—')}</td></tr>
  <tr><td>שנת ייצור</td><td>${v.shnat_yitzur || '—'}</td></tr>
  ${!isMotorcycle ? `<tr><td>צבע</td><td>${v.tzeva_rechev || '—'}</td></tr>` : ''}
  <tr><td>סוג דלק</td><td>${v.sug_delek_nm || '—'}</td></tr>
  <tr><td>בעלות</td><td>${v.baalut || '—'}</td></tr>
  <tr><td>סוג רכב</td><td>${v.sug_rechev_nm || '—'}</td></tr>
  <tr><td>מועד עלייה לכביש</td><td>${v.moed_aliya_lakvish || '—'}</td></tr>
</table>

${data.price ? `
<h2>שווי משוער</h2>
<table>
  <tr><td>מחיר מחירון (כחדש)</td><td>${formatPrice(data.price.original_price_min)} ${data.price.original_price_min !== data.price.original_price_max ? '— ' + formatPrice(data.price.original_price_max) : ''}</td></tr>
  <tr><td>פחת (${data.price.age_years} שנים)</td><td style="color: #ef4444;">-${data.price.depreciation_pct}%</td></tr>
  <tr><td><strong>שווי משוער</strong></td><td><strong style="color: #f59e0b;">${formatPrice(data.price.estimated_low)} — ${formatPrice(data.price.estimated_high)}</strong></td></tr>
</table>
` : ''}

<div class="footer">
  <p>נוצר באמצעות רכב IL — מערכת איתור ובדיקת רכבים מתקדמת</p>
  <p>המידע מבוסס על נתוני data.gov.il — לשימוש מידע בלבד</p>
</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

/* ─── Skeleton Shimmer ─── */
function Shimmer({ className }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.04] ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
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

  // Track analytics
  useEffect(() => {
    if (data && window.posthog) {
      window.posthog.capture('vehicle_viewed', {
        plate: plate,
        manufacturer: data.vehicle?.tozeret_nm,
        is_motorcycle: data.is_motorcycle,
        is_stolen: data.theft?.stolen,
        health_score: data.health_score?.score
      });
    }
  }, [data, plate]);

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
      setFavSaved(true);
      if (window.posthog) window.posthog.capture('favorite_added', { plate });
    } catch { /* ignore */ }
  };

  const handleAddWatchlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post(`${API}/watchlist`, {
        plate,
        manufacturer: v.tozeret_nm || '',
        model: v.kinuy_mishari || v.degem_nm || '',
        year: v.shnat_yitzur || null,
        alert_types: ['theft', 'test_expiry']
      }, { withCredentials: true });
      setWatchSaved(true);
    } catch { /* ignore */ }
  };

  // Build disability detail string
  const disabilityDetail = () => {
    const d = data?.disability;
    if (!d?.has_disability_tag) return null;
    const parts = [];
    if (d.tag_type) parts.push(`סוג: ${d.tag_type}`);
    if (d.issue_date) {
      const raw = String(d.issue_date);
      let formatted = raw;
      if (/^\d{8}$/.test(raw)) {
        formatted = `${raw.slice(6,8)}/${raw.slice(4,6)}/${raw.slice(0,4)}`;
      }
      parts.push(`הונפק: ${formatted}`);
    }
    return parts.join(' · ') || null;
  };

  // Vehicle type badge text
  const vehicleTypeBadge = () => {
    if (isMotorcycle) return { label: 'דו-גלגלי', icon: <Bike className="w-3.5 h-3.5" />, color: 'orange' };
    const type = v.sug_rechev_nm?.toLowerCase() || '';
    if (type.includes('פרטי')) return { label: 'פרטי', icon: <Car className="w-3.5 h-3.5" />, color: 'blue' };
    if (type.includes('מסחרי')) return { label: 'מסחרי', icon: <Car className="w-3.5 h-3.5" />, color: 'purple' };
    return { label: v.sug_rechev_nm || 'רכב', icon: <Car className="w-3.5 h-3.5" />, color: 'blue' };
  };

  const badge = vehicleTypeBadge();
  const badgeColors = {
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    blue: 'bg-[#6390ff]/15 text-[#6390ff] border-[#6390ff]/25',
    purple: 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/25',
  };

  /* ─── LOADING STATE ─── */
  if (loading) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="vehicle-loading">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="flex flex-col items-center justify-center py-12"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Skeleton Plate with scanner */}
            <motion.div variants={fadeUp} className="relative w-72 h-16 mb-6">
              <div className="license-plate mx-auto text-xl" style={{ borderRadius: '14px' }}>
                <div className="il-strip"><span className="text-[8px]">🇮🇱</span><span>IL</span></div>
                <div className="plate-number relative overflow-hidden">
                  <span className="opacity-20">{plate?.length === 7
                    ? `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`
                    : plate?.length === 8
                    ? `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`
                    : plate}</span>
                  <motion.div
                    className="absolute inset-y-0 w-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #6390ff, #22d3ee)',
                      boxShadow: '0 0 20px 6px rgba(99,144,255,0.4)',
                    }}
                    animate={{ left: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Skeleton vehicle name */}
            <motion.div variants={fadeUp}>
              <Shimmer className="h-7 w-52 mb-3 mx-auto" />
              <Shimmer className="h-5 w-24 mx-auto" />
            </motion.div>

            {/* Skeleton health ring */}
            <motion.div variants={fadeUp} className="my-8">
              <div className="relative w-36 h-36 mx-auto">
                <div className="absolute inset-0 rounded-full border-[10px] border-white/[0.04]" />
                <motion.div
                  className="absolute inset-0 rounded-full border-[10px] border-transparent"
                  style={{ borderTopColor: 'rgba(99,144,255,0.2)', borderRightColor: 'rgba(99,144,255,0.1)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>

            {/* Skeleton status cards */}
            <motion.div variants={fadeUp} className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <Shimmer key={i} className="h-20 rounded-[20px]" />
              ))}
            </motion.div>

            {/* Skeleton details */}
            <motion.div variants={fadeUp} className="w-full space-y-3">
              <Shimmer className="h-48 rounded-[20px]" />
              <Shimmer className="h-36 rounded-[20px]" />
            </motion.div>

            <motion.p
              className="text-sm mt-8"
              style={{ color: 'var(--text-secondary, rgba(255,255,255,0.35))' }}
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              סורק את מאגרי המידע...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── ERROR STATE ─── */
  if (error) {
    return (
      <div className="min-h-screen ambient-bg pt-20 px-4 flex items-center justify-center pb-safe" data-testid="vehicle-error">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-[24px] border border-red-500/15 bg-white/[0.02] backdrop-blur-md p-10 text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5 relative">
            <Car className="w-10 h-10 text-red-400/60" />
            <XCircle className="w-6 h-6 text-red-400 absolute -bottom-1 -left-1" />
          </div>
          <h2 className="font-rubik font-bold text-2xl mb-2 gradient-text">רכב לא נמצא</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              data-testid="retry-btn"
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] rounded-xl"
            >
              <RefreshCw className="w-4 h-4 ml-2" /> נסה שוב
            </Button>
            <Button
              data-testid="back-home-btn"
              onClick={() => navigate('/')}
              className="text-white rounded-xl border-0"
              style={{ background: 'linear-gradient(135deg, #6390ff, #a78bfa)' }}
            >
              <ArrowRight className="w-4 h-4 ml-2" /> חזור לחיפוש
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── MAIN RENDER ─── */
  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="vehicle-page">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ═══ 1. HERO / PLATE DISPLAY ═══ */}
        <motion.section variants={fadeUp} className="mb-8 text-center">
          <LicensePlateDisplay plate={plate} isMotorcycle={isMotorcycle} />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="mt-5"
          >
            {/* Vehicle Name - gradient text */}
            {(v.tozeret_nm || v.degem_nm) && (
              <h1 className="text-2xl sm:text-3xl font-rubik font-bold mb-3 gradient-text leading-tight">
                {v.tozeret_nm} {v.kinuy_mishari || v.degem_nm} {v.shnat_yitzur}
              </h1>
            )}

            {/* Type badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${badgeColors[badge.color]}`} data-testid={isMotorcycle ? 'motorcycle-badge' : 'vehicle-type-badge'}>
              {badge.icon} {badge.label}
            </span>
          </motion.div>
        </motion.section>

        {/* ═══ 2. HEALTH SCORE RING ═══ */}
        {data.health_score && (
          <motion.section variants={fadeUp} className="mb-8" data-testid="health-score-card">
            <GlassCard className="text-center py-8 hover:shadow-lg hover:shadow-[#6390ff]/5">
              <SectionHeading icon={<Gauge className="w-4 h-4" />}>ציון בריאות הרכב</SectionHeading>
              <HealthScoreRing score={data.health_score} />
            </GlassCard>
          </motion.section>
        )}

        {/* ═══ 3. STATUS CARDS ROW ═══ */}
        <motion.section variants={fadeUp} className="mb-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-4 sm:overflow-visible"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Theft */}
            {data.theft?.unavailable ? (
              <StatusCard
                type="warning"
                title="גניבה"
                value="לא זמין"
                icon={<AlertTriangle className="w-5 h-5" />}
              />
            ) : (
              <StatusCard
                type={data.theft?.stolen ? 'stolen' : 'clean'}
                title="גניבה"
                value={data.theft?.stolen ? 'מדווח כגנוב!' : 'נקי'}
                icon={<Shield className="w-5 h-5" />}
              />
            )}

            {/* Test validity */}
            <StatusCard
              type={testValid === null ? 'none' : testValid ? 'clean' : 'expired'}
              title="טסט"
              value={testValid === null ? 'לא זמין' : testValid ? 'בתוקף' : 'פג תוקף!'}
              detail={v.tokef_dt ? `עד ${new Date(v.tokef_dt).toLocaleDateString('he-IL')}` : null}
              icon={<FileText className="w-5 h-5" />}
            />

            {/* Disability */}
            <StatusCard
              type={data.disability?.has_disability_tag ? 'disability' : 'none'}
              title="תו נכה"
              value={data.disability?.has_disability_tag ? 'תו נכה פעיל' : 'לא נמצא'}
              detail={disabilityDetail()}
              icon={<Accessibility className="w-5 h-5" />}
            />

            {/* Safety rating */}
            <StatusCard
              type={v.ramat_eivzur_betihuty ? (parseInt(v.ramat_eivzur_betihuty) >= 4 ? 'clean' : parseInt(v.ramat_eivzur_betihuty) >= 2 ? 'none' : 'expired') : 'none'}
              title="דירוג בטיחות"
              value={v.ramat_eivzur_betihuty ? `${v.ramat_eivzur_betihuty} כוכבים` : 'לא זמין'}
              icon={<Star className="w-5 h-5" />}
            />
          </motion.div>
        </motion.section>

        {/* Ad placement - between status cards and details */}
        <AdBanner variant="in-article" className="my-5" />

        {/* ═══ 4. VEHICLE DETAILS GRID ═══ */}

        {/* Basic Details */}
        <motion.section variants={fadeUp} className="mb-4" data-testid="basic-details">
          <GlassCard>
            <SectionHeading icon={<Car className="w-4 h-4" />}>פרטים בסיסיים</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
              <FieldRow label="יצרן" value={v.tozeret_nm} />
              <FieldRow label="דגם" value={isMotorcycle ? v.degem_nm : v.kinuy_mishari} />
              <FieldRow label="שנת ייצור" value={v.shnat_yitzur} />
              {!isMotorcycle && (
                <div className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0 group">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.45))' }}>צבע</span>
                  <ColorDisplay colorName={v.tzeva_rechev} />
                </div>
              )}
              <FieldRow label="סוג דלק" value={v.sug_delek_nm} />
              <FieldRow label="בעלות" value={v.baalut} />
              <FieldRow label="סוג רכב" value={v.sug_rechev_nm} />
              <FieldRow label="מועד עלייה לכביש" value={v.moed_aliya_lakvish} />
              {isMotorcycle && <FieldRow label="ארץ ייצור" value={v.tozeret_eretz_nm} />}
              {isMotorcycle && <FieldRow label="מקוריות" value={v.mkoriut_nm} />}
            </div>
          </GlassCard>
        </motion.section>

        {/* Technical Details */}
        <motion.section variants={fadeUp} className="mb-4" data-testid="technical-details">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <SectionHeading icon={<Gauge className="w-4 h-4" />}>מידע טכני</SectionHeading>
              {!isPro && (
                <span className="text-[11px] bg-gradient-to-r from-[#6390ff]/15 to-[#a78bfa]/15 text-[#6390ff] px-3 py-1 rounded-full border border-[#6390ff]/20 font-medium">
                  Pro
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
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
                  <FieldRow label="דגם מנוע" value={v.degem_manoa} locked={!isPro} />
                  <FieldRow label="צמיג קדמי" value={v.zmig_kidmi} locked={!isPro} />
                  <FieldRow label="צמיג אחורי" value={v.zmig_ahori} locked={!isPro} />
                  <FieldRow label="מספר מסגרת" value={v.misgeret} locked={!isPro} />
                  <FieldRow label="הוראת רישום" value={v.horaat_rishum} locked={!isPro} />
                </>
              )}
            </div>
            {!isPro && (
              <div className="mt-5 pt-4 border-t border-white/[0.04] text-center">
                <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.4))' }}>רוצה לראות את כל הפרטים הטכניים?</p>
                <Button
                  data-testid="upgrade-pro-btn"
                  onClick={() => navigate('/pricing')}
                  size="sm"
                  className="text-white rounded-xl text-sm px-6 border-0"
                  style={{ background: isMotorcycle ? 'linear-gradient(135deg, #ea580c, #f59e0b)' : 'linear-gradient(135deg, #6390ff, #a78bfa)' }}
                >
                  שדרג ל-Pro — $5/חודש
                </Button>
              </div>
            )}
          </GlassCard>
        </motion.section>

        {/* Status / Test Details */}
        <motion.section variants={fadeUp} className="mb-6" data-testid="pro-details">
          <GlassCard>
            <SectionHeading icon={<FileText className="w-4 h-4" />}>מצב הרכב</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
              {v.mivchan_acharon_dt && (
                <FieldRow label="בדיקה אחרונה" value={new Date(v.mivchan_acharon_dt).toLocaleDateString('he-IL')} />
              )}
              {v.tokef_dt && (
                <FieldRow label="תוקף טסט" value={new Date(v.tokef_dt).toLocaleDateString('he-IL')} />
              )}
              <FieldRow label="רמת גימור" value={v.ramat_gimur} locked={!isPro} />
              <FieldRow label="קבוצת זיהום" value={v.kvutzat_zihum} locked={!isPro} />
              {v.ramat_eivzur_betihuty && <FieldRow label="דירוג בטיחות" value={v.ramat_eivzur_betihuty} />}
            </div>
          </GlassCard>
        </motion.section>

        {/* ═══ 5. PRICE ESTIMATION CARD ═══ */}
        {!isMotorcycle && (
          <motion.section variants={fadeUp} className="mb-8">
            <PriceCard price={data.price} isPro={isPro} navigate={navigate} />
          </motion.section>
        )}

        {/* ═══ 6. ACTION BUTTONS ═══ */}
        <motion.section variants={fadeUp} className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <ActionPill
              testId="save-favorite-btn"
              icon={<Heart className={`w-4 h-4 ${favSaved ? 'fill-current' : ''}`} />}
              label={favSaved ? 'נשמר' : 'הוסף למועדפים'}
              onClick={handleSaveFavorite}
              active={favSaved}
              activeGradient="linear-gradient(135deg, #ef4444, #ec4899)"
              disabled={favSaved}
            />
            <ActionPill
              testId="watch-btn"
              icon={<Bell className={`w-4 h-4 ${watchSaved ? 'fill-current' : ''}`} />}
              label={watchSaved ? 'במעקב' : 'עקוב'}
              onClick={handleAddWatchlist}
              active={watchSaved}
              activeGradient="linear-gradient(135deg, #f59e0b, #ea580c)"
              disabled={watchSaved}
            />
            <ActionPill
              testId="compare-btn"
              icon={<GitCompareArrows className="w-4 h-4" />}
              label="השווה"
              onClick={() => navigate('/compare')}
            />
            <ActionPill
              testId="share-btn"
              icon={<Share2 className="w-4 h-4" />}
              label="שתף"
              onClick={handleShare}
            />
            <ActionPill
              testId="export-pdf-btn"
              icon={<Download className="w-4 h-4" />}
              label="ייצוא PDF"
              onClick={() => handlePdfExport(plate, v, data, isMotorcycle)}
            />
          </div>
        </motion.section>

        {/* ═══ 7. SIMILAR VEHICLES (placeholder) ═══ */}
        {data.similar_vehicles?.length > 0 && (
          <motion.section variants={fadeUp} className="mb-10">
            <SectionHeading>רכבים דומים</SectionHeading>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
              {data.similar_vehicles.map((sv, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  onClick={() => navigate(`/vehicle/${sv.plate}`)}
                  className="min-w-[180px] snap-start rounded-[16px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-4 cursor-pointer hover:bg-white/[0.04] transition-all duration-300 hover:border-[#6390ff]/20"
                >
                  <div className="text-sm font-rubik font-semibold text-white/80 mb-1">{sv.model || sv.degem_nm}</div>
                  <div className="text-xs text-white/40">{sv.year} · {sv.fuel_type || sv.sug_delek_nm}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Bottom spacer for safe area */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
