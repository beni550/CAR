import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Calculator, TrendingDown, Info, Zap, DollarSign, Car, Calendar, Percent, ChevronDown } from 'lucide-react';

const easing = [0.4, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } }
};

// ─── Fuel Prices (Israel 2024-2025) ───
const FUEL_TYPES = [
  { key: 'benzin95', label: 'בנזין 95', price: 6.78, unit: 'ליטר', color: '#f59e0b' },
  { key: 'diesel', label: 'דיזל', price: 6.48, unit: 'ליטר', color: '#6366f1' },
  { key: 'electric', label: 'חשמלי', price: 0.60, unit: 'kWh', color: '#10b981' },
  { key: 'hybrid', label: 'היברידי', price: 5.20, unit: 'ליטר', color: '#3b82f6' },
];

const ELECTRIC_KWH_PER_100KM = 17;

// ─── Depreciation rates per year ───
const DEPRECIATION_RATES = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05];

const VEHICLE_TYPE_MULTIPLIERS = {
  luxury: 1.15,
  regular: 1.0,
  economy: 0.90,
};

// ─── Helper: format NIS ───
function formatNIS(amount) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
}

function formatNISDecimal(amount) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

// ─── Shared select wrapper with custom chevron ───
function PremiumSelect({ value, onChange, children, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`input-premium w-full appearance-none cursor-pointer pr-4 pl-10 ${className}`}
      >
        {children}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  TAB 1 — Fuel Cost Calculator
// ═══════════════════════════════════════
function FuelCalculator() {
  const [distance, setDistance] = useState(1500);
  const [consumption, setConsumption] = useState(12);
  const [fuelType, setFuelType] = useState('benzin95');

  const selectedFuel = FUEL_TYPES.find(f => f.key === fuelType);

  const results = useMemo(() => {
    if (!distance || !consumption || consumption <= 0) return null;

    const allResults = FUEL_TYPES.map(fuel => {
      let monthlyCost;
      if (fuel.key === 'electric') {
        const kwhPerMonth = (distance / 100) * ELECTRIC_KWH_PER_100KM;
        monthlyCost = kwhPerMonth * fuel.price;
      } else {
        const litersPerMonth = distance / consumption;
        monthlyCost = litersPerMonth * fuel.price;
      }
      return {
        ...fuel,
        monthlyCost,
        annualCost: monthlyCost * 12,
        costPerKm: monthlyCost / distance,
      };
    });

    const selected = allResults.find(r => r.key === fuelType);
    const electric = allResults.find(r => r.key === 'electric');
    const yearlySavingsToElectric = selected.annualCost - electric.annualCost;

    return { allResults, selected, yearlySavingsToElectric };
  }, [distance, consumption, fuelType]);

  const maxAnnual = results ? Math.max(...results.allResults.map(r => r.annualCost)) : 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
        <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">נתוני נסיעה</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">קילומטרים בחודש</label>
            <input
              type="number"
              value={distance}
              onChange={e => setDistance(Number(e.target.value))}
              className="input-premium w-full"
              dir="ltr"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">צריכת דלק (ק"מ/ליטר)</label>
            <input
              type="number"
              value={consumption}
              onChange={e => setConsumption(Number(e.target.value))}
              className="input-premium w-full"
              dir="ltr"
              min={1}
              step={0.5}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">סוג דלק</label>
            <PremiumSelect value={fuelType} onChange={e => setFuelType(e.target.value)}>
              {FUEL_TYPES.map(f => (
                <option key={f.key} value={f.key} className="bg-[var(--dropdown-bg)] text-[var(--text-primary)]">{f.label} — {f.price} ₪/{f.unit}</option>
              ))}
            </PremiumSelect>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easing }}
          className="space-y-6"
        >
          {/* Summary cards */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Calendar, label: 'עלות חודשית', value: formatNIS(results.selected.monthlyCost),
                gradient: 'from-amber-500/20 to-orange-500/10', borderColor: 'border-amber-500/30',
                iconBg: 'bg-gradient-to-br from-amber-500/30 to-orange-500/20', iconColor: 'text-amber-400', valueColor: 'text-amber-400'
              },
              {
                icon: DollarSign, label: 'עלות שנתית', value: formatNIS(results.selected.annualCost),
                gradient: 'from-[#6390ff]/20 to-blue-500/10', borderColor: 'border-[#6390ff]/30',
                iconBg: 'bg-gradient-to-br from-[#6390ff]/30 to-blue-500/20', iconColor: 'text-[#6390ff]', valueColor: 'text-[#6390ff]'
              },
              {
                icon: Fuel, label: 'עלות לק"מ', value: formatNISDecimal(results.selected.costPerKm),
                gradient: 'from-[#a78bfa]/20 to-purple-500/10', borderColor: 'border-[#a78bfa]/30',
                iconBg: 'bg-gradient-to-br from-[#a78bfa]/30 to-purple-500/20', iconColor: 'text-[#a78bfa]', valueColor: 'text-[#a78bfa]'
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`result-highlight glass-card p-5 hover:translate-y-0 ${card.borderColor} bg-gradient-to-br ${card.gradient}`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">{card.label}</span>
                  </div>
                  <div className={`text-2xl font-rubik font-bold ${card.valueColor}`}>{card.value}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Comparison bars */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="glass-card p-6 hover:translate-y-0"
          >
            <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">השוואת עלות שנתית לפי סוג דלק</h3>
            <div className="space-y-5">
              {results.allResults.map(r => {
                const pct = maxAnnual > 0 ? (r.annualCost / maxAnnual) * 100 : 0;
                const isSelected = r.key === fuelType;
                return (
                  <div key={r.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {r.label} {isSelected && <span className="text-xs text-[#6390ff] mr-1">(נבחר)</span>}
                      </span>
                      <span className="text-sm font-rubik font-bold" style={{ color: r.color }}>{formatNIS(r.annualCost)}</span>
                    </div>
                    <div className="h-7 bg-[var(--input-bg)] rounded-xl overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: easing }}
                        className="h-full rounded-xl relative"
                        style={{
                          background: `linear-gradient(90deg, ${r.color}40, ${r.color}90)`,
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)`,
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Electric savings */}
          {fuelType !== 'electric' && results.yearlySavingsToElectric > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easing }}
              className="glass-card p-6 hover:translate-y-0 border-emerald-500/30"
              style={{ boxShadow: '0 0 40px -12px rgba(16, 185, 129, 0.25)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-1">חיסכון שנתי במעבר לחשמלי</div>
                  <div className="text-2xl font-rubik font-bold text-emerald-400">{formatNIS(results.yearlySavingsToElectric)}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">על בסיס {distance.toLocaleString()} ק"מ בחודש</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
//  TAB 2 — Finance Calculator
// ═══════════════════════════════════════
function FinanceCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(200000);
  const [downPayment, setDownPayment] = useState(40000);
  const [downPaymentType, setDownPaymentType] = useState('nis');
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanMonths, setLoanMonths] = useState(60);

  const results = useMemo(() => {
    if (!vehiclePrice || vehiclePrice <= 0) return null;

    let downPaymentNIS;
    if (downPaymentType === 'percent') {
      downPaymentNIS = (vehiclePrice * downPayment) / 100;
    } else {
      downPaymentNIS = downPayment;
    }

    if (downPaymentNIS >= vehiclePrice) return null;

    const principal = vehiclePrice - downPaymentNIS;
    const monthlyRate = interestRate / 100 / 12;
    const n = loanMonths;

    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = principal / n;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }

    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - principal;

    // Milestones
    const milestones = [];
    let balance = principal;
    let totalPrincipalPaid = 0;
    const milestoneTargets = [0.25, 0.50, 0.75, 1.0];
    let milestoneIdx = 0;

    for (let month = 1; month <= n && milestoneIdx < milestoneTargets.length; month++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;
      totalPrincipalPaid += principalPortion;
      balance -= principalPortion;

      const pctPaid = totalPrincipalPaid / principal;
      if (pctPaid >= milestoneTargets[milestoneIdx]) {
        milestones.push({
          pct: milestoneTargets[milestoneIdx] * 100,
          month,
          principalPaid: totalPrincipalPaid,
          remaining: Math.max(0, balance),
        });
        milestoneIdx++;
      }
    }

    const principalPct = (principal / totalPaid) * 100;
    const interestPct = (totalInterest / totalPaid) * 100;

    return { principal, downPaymentNIS, monthlyPayment, totalPaid, totalInterest, milestones, principalPct, interestPct };
  }, [vehiclePrice, downPayment, downPaymentType, interestRate, loanMonths]);

  // Progress percentage (how much of the loan is paid vs total)
  const progressPct = results ? (results.principal / (results.totalPaid + results.downPaymentNIS)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
        <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">נתוני הלוואה</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">מחיר הרכב (₪)</label>
            <input
              type="number"
              value={vehiclePrice}
              onChange={e => setVehiclePrice(Number(e.target.value))}
              className="input-premium w-full"
              dir="ltr"
              min={0}
              step={1000}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              מקדמה
              <button
                onClick={() => setDownPaymentType(prev => {
                  if (prev === 'nis') {
                    setDownPayment(Math.round((downPayment / (vehiclePrice || 1)) * 100));
                    return 'percent';
                  } else {
                    setDownPayment(Math.round((downPayment / 100) * vehiclePrice));
                    return 'nis';
                  }
                })}
                className="mr-2 text-xs text-[#6390ff] hover:text-[#a78bfa] transition-colors"
              >
                ({downPaymentType === 'nis' ? 'עבור ל-%' : 'עבור ל-₪'})
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                value={downPayment}
                onChange={e => setDownPayment(Number(e.target.value))}
                className="input-premium w-full"
                dir="ltr"
                min={0}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm opacity-60">
                {downPaymentType === 'nis' ? '₪' : '%'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">ריבית שנתית (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              className="input-premium w-full"
              dir="ltr"
              min={0}
              max={30}
              step={0.1}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">תקופת הלוואה (חודשים)</label>
            <PremiumSelect value={loanMonths} onChange={e => setLoanMonths(Number(e.target.value))}>
              {[12, 24, 36, 48, 60, 72, 84].map(m => (
                <option key={m} value={m} className="bg-[var(--dropdown-bg)] text-[var(--text-primary)]">{m} חודשים ({m / 12} שנים)</option>
              ))}
            </PremiumSelect>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easing }}
          className="space-y-6"
        >
          {/* Monthly payment - large prominent */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="result-highlight glass-card p-6 hover:translate-y-0 border-[#6390ff]/30 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.08), rgba(167,139,250,0.06))' }}
          >
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6390ff]/30 to-[#a78bfa]/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#6390ff]" />
              </div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">תשלום חודשי</span>
            </div>
            <div className="text-4xl font-rubik font-bold gradient-text mb-1">{formatNIS(results.monthlyPayment)}</div>
            <div className="text-xs text-[var(--text-secondary)] opacity-60">ל-{loanMonths} חודשים</div>
          </motion.div>

          {/* Interest + Total cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 hover:translate-y-0 border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/30 to-red-500/10 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">סה"כ ריבית</span>
              </div>
              <div className="text-2xl font-rubik font-bold text-red-400">{formatNIS(results.totalInterest)}</div>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 hover:translate-y-0 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">עלות כוללת</span>
              </div>
              <div className="text-2xl font-rubik font-bold text-amber-400">{formatNIS(results.totalPaid + results.downPaymentNIS)}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">כולל מקדמה {formatNIS(results.downPaymentNIS)}</div>
            </motion.div>
          </div>

          {/* Principal vs Interest visual */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
            <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">פירוט תשלומים</h3>
            <div className="flex items-center gap-5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#6390ff] to-[#22d3ee]" />
                <span className="text-sm text-[var(--text-secondary)]">קרן — {formatNIS(results.principal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-400" />
                <span className="text-sm text-[var(--text-secondary)]">ריבית — {formatNIS(results.totalInterest)}</span>
              </div>
            </div>
            {/* Stacked gradient bar */}
            <div className="h-12 bg-[var(--input-bg)] rounded-2xl overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${results.principalPct}%` }}
                transition={{ duration: 0.7, ease: easing }}
                className="h-full flex items-center justify-center relative"
                style={{ background: 'linear-gradient(90deg, #6390ff, #22d3ee)' }}
              >
                {results.principalPct > 15 && <span className="text-xs text-white font-bold drop-shadow-sm">{results.principalPct.toFixed(0)}%</span>}
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${results.interestPct}%` }}
                transition={{ duration: 0.7, delay: 0.2, ease: easing }}
                className="h-full flex items-center justify-center relative"
                style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)' }}
              >
                {results.interestPct > 10 && <span className="text-xs text-white font-bold drop-shadow-sm">{results.interestPct.toFixed(0)}%</span>}
              </motion.div>
            </div>

            {/* Gradient progress indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--text-secondary)]">התקדמות בהחזר</span>
                <span className="text-xs font-rubik font-bold text-[#6390ff]">{results.principalPct.toFixed(0)}% קרן</span>
              </div>
              <div className="h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.principalPct}%` }}
                  transition={{ duration: 1, ease: easing }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6390ff, #22d3ee, #a78bfa)' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
            <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">אבני דרך בהחזר</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {results.milestones.map((m, idx) => {
                const colors = [
                  { border: 'border-[#6390ff]/20', bg: 'from-[#6390ff]/10 to-transparent', text: 'text-[#6390ff]' },
                  { border: 'border-[#22d3ee]/20', bg: 'from-[#22d3ee]/10 to-transparent', text: 'text-[#22d3ee]' },
                  { border: 'border-[#a78bfa]/20', bg: 'from-[#a78bfa]/10 to-transparent', text: 'text-[#a78bfa]' },
                  { border: 'border-emerald-500/20', bg: 'from-emerald-500/10 to-transparent', text: 'text-emerald-400' },
                ];
                const c = colors[idx] || colors[0];
                return (
                  <motion.div
                    key={m.pct}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, ease: easing }}
                    className={`rounded-2xl p-4 text-center border ${c.border} bg-gradient-to-b ${c.bg}`}
                  >
                    <div className={`text-2xl font-rubik font-bold ${c.text} mb-1`}>{m.pct}%</div>
                    <div className="text-xs text-[var(--text-secondary)] mb-2 opacity-60">מהקרן שולם</div>
                    <div className="text-sm text-[var(--text-primary)] font-medium">חודש {m.month}</div>
                    <div className="text-xs text-[var(--text-secondary)] opacity-50">יתרה: {formatNIS(m.remaining)}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
//  TAB 3 — Depreciation Forecast
// ═══════════════════════════════════════
function DepreciationCalculator() {
  const currentYear = new Date().getFullYear();
  const [vehiclePrice, setVehiclePrice] = useState(200000);
  const [vehicleYear, setVehicleYear] = useState(currentYear);
  const [vehicleType, setVehicleType] = useState('regular');

  const results = useMemo(() => {
    if (!vehiclePrice || vehiclePrice <= 0) return null;

    const ageNow = currentYear - vehicleYear;
    if (ageNow < 0) return null;

    const multiplier = VEHICLE_TYPE_MULTIPLIERS[vehicleType] || 1.0;
    const forecastYears = 6;
    const rows = [];

    let value = vehiclePrice;

    for (let y = 0; y < ageNow && y < DEPRECIATION_RATES.length; y++) {
      const rate = Math.min(DEPRECIATION_RATES[y] * multiplier, 0.5);
      value = value * (1 - rate);
    }
    if (ageNow > DEPRECIATION_RATES.length) {
      const lastRate = DEPRECIATION_RATES[DEPRECIATION_RATES.length - 1] * multiplier;
      for (let y = DEPRECIATION_RATES.length; y < ageNow; y++) {
        value = value * (1 - lastRate);
      }
    }

    const currentValue = value;

    for (let i = 0; i < forecastYears; i++) {
      const yearAge = ageNow + i;
      const rateIdx = Math.min(yearAge, DEPRECIATION_RATES.length - 1);
      const rate = DEPRECIATION_RATES[rateIdx] * multiplier;

      rows.push({
        year: currentYear + i,
        age: yearAge,
        value: Math.round(value),
        pctOfOriginal: (value / vehiclePrice) * 100,
        rate: i === 0 ? 0 : rate * 100,
      });

      value = value * (1 - Math.min(rate, 0.5));
    }

    const totalDepreciationPct = ((1 - rows[rows.length - 1].value / vehiclePrice) * 100);
    const totalLost = vehiclePrice - rows[rows.length - 1].value;

    return { rows, currentValue, totalDepreciationPct, totalLost };
  }, [vehiclePrice, vehicleYear, vehicleType, currentYear]);

  const maxValue = results ? Math.max(...results.rows.map(r => r.value)) : 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
        <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">נתוני הרכב</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">מחיר הרכב (₪)</label>
            <input
              type="number"
              value={vehiclePrice}
              onChange={e => setVehiclePrice(Number(e.target.value))}
              className="input-premium w-full"
              dir="ltr"
              min={0}
              step={5000}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">שנת ייצור</label>
            <PremiumSelect value={vehicleYear} onChange={e => setVehicleYear(Number(e.target.value))}>
              {Array.from({ length: 16 }, (_, i) => currentYear - i).map(y => (
                <option key={y} value={y} className="bg-[var(--dropdown-bg)] text-[var(--text-primary)]">{y}</option>
              ))}
            </PremiumSelect>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">סוג רכב</label>
            <PremiumSelect value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
              <option value="economy" className="bg-[var(--dropdown-bg)] text-[var(--text-primary)]">חסכוני</option>
              <option value="regular" className="bg-[var(--dropdown-bg)] text-[var(--text-primary)]">רגיל</option>
              <option value="luxury" className="bg-[var(--dropdown-bg)] text-[var(--text-primary)]">יוקרה</option>
            </PremiumSelect>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easing }}
          className="space-y-6"
        >
          {/* Current value - prominent gradient border card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="gradient-border rounded-[20px] p-[1px]"
          >
            <div className="glass-card rounded-[19px] p-6 hover:translate-y-0 text-center" style={{ border: 'none' }}>
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">שווי נוכחי משוער</span>
              </div>
              <div className="text-4xl font-rubik font-bold text-emerald-400 mb-1">{formatNIS(results.currentValue)}</div>
              <div className="text-xs text-[var(--text-secondary)] opacity-60">מתוך {formatNIS(vehiclePrice)} מקורי</div>
            </div>
          </motion.div>

          {/* Depreciation + percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="glass-card p-5 hover:translate-y-0 border-red-500/20"
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), transparent)' }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/30 to-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">סה"כ ירידת ערך</span>
              </div>
              <div className="text-2xl font-rubik font-bold text-red-400">{formatNIS(results.totalLost)}</div>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 hover:translate-y-0 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">אחוז פחת כולל</span>
              </div>
              <div className="text-2xl font-rubik font-bold text-amber-400">{results.totalDepreciationPct.toFixed(1)}%</div>
            </motion.div>
          </div>

          {/* Chart (CSS bars) with gradient */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
            <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">תחזית שווי לאורך זמן</h3>
            <div className="flex items-end gap-2 sm:gap-4 h-52">
              {results.rows.map((r, i) => {
                const heightPct = maxValue > 0 ? (r.value / maxValue) * 100 : 0;
                const isFirst = i === 0;
                return (
                  <div key={r.year} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-rubik opacity-70">{formatNIS(r.value)}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: easing }}
                      className="w-full rounded-t-xl relative overflow-hidden"
                      style={{
                        minHeight: '4px',
                        background: isFirst
                          ? 'linear-gradient(180deg, #10b981, #059669)'
                          : `linear-gradient(180deg, #6390ff, #a78bfa)`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                        }}
                      />
                    </motion.div>
                    <span className="text-xs text-[var(--text-secondary)] opacity-60">{r.year}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Table with alternating rows */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6 hover:translate-y-0">
            <h3 className="font-rubik font-semibold text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-5">טבלת פחת מפורטת</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-glass)]">
                    <th className="text-right py-3 text-xs text-[var(--text-secondary)] font-medium">שנה</th>
                    <th className="text-right py-3 text-xs text-[var(--text-secondary)] font-medium">גיל הרכב</th>
                    <th className="text-right py-3 text-xs text-[var(--text-secondary)] font-medium">שווי משוער</th>
                    <th className="text-right py-3 text-xs text-[var(--text-secondary)] font-medium">% מהמחיר המקורי</th>
                    <th className="text-right py-3 text-xs text-[var(--text-secondary)] font-medium">אחוז פחת שנתי</th>
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((r, i) => (
                    <tr
                      key={r.year}
                      className={`border-b border-[var(--border-glass)] transition-colors ${
                        i % 2 === 0 ? 'bg-[var(--input-bg)]' : ''
                      }`}
                    >
                      <td className="py-3 px-1 text-sm font-medium text-[var(--text-primary)]">{r.year}</td>
                      <td className="py-3 px-1 text-sm text-[var(--text-secondary)]">{r.age === 0 ? 'חדש' : `${r.age} שנים`}</td>
                      <td className="py-3 px-1 text-sm font-rubik font-bold text-emerald-400">{formatNIS(r.value)}</td>
                      <td className="py-3 px-1 text-sm text-[var(--text-secondary)]">{r.pctOfOriginal.toFixed(1)}%</td>
                      <td className="py-3 px-1 text-sm text-[var(--text-secondary)]">{i === 0 ? '—' : `${r.rate.toFixed(1)}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════
const TABS = [
  { key: 'fuel', label: 'מחשבון דלק', icon: Fuel, gradient: 'from-amber-500 to-orange-500' },
  { key: 'finance', label: 'מחשבון מימון', icon: Calculator, gradient: 'from-[#6390ff] to-[#22d3ee]' },
  { key: 'depreciation', label: 'תחזית פחת', icon: TrendingDown, gradient: 'from-emerald-500 to-green-400' },
];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState('fuel');

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" dir="rtl" data-testid="calculators-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6390ff]/20 to-[#a78bfa]/10 border border-[#6390ff]/20 mb-4">
            <Calculator className="w-8 h-8 text-[#6390ff]" />
          </div>
          <h1 className="font-rubik font-bold text-2xl sm:text-3xl mb-2 gradient-text">
            מחשבונים לרכב
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">כלי חישוב חכמים לתכנון רכישת רכב</p>
        </motion.div>

        {/* Tab navigation - pill switcher */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easing }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-1.5 bg-[var(--input-bg)] border border-[var(--border-glass)] rounded-2xl p-1.5 w-full sm:w-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 sm:flex-initial relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.gradient}`}
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: easing }}
          >
            {activeTab === 'fuel' && <FuelCalculator />}
            {activeTab === 'finance' && <FinanceCalculator />}
            {activeTab === 'depreciation' && <DepreciationCalculator />}
          </motion.div>
        </AnimatePresence>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 mb-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] opacity-40">
            <Info className="w-3 h-3" />
            <span>החישובים הם הערכה בלבד ואינם מהווים ייעוץ פיננסי. מחירי הדלק עשויים להשתנות.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
