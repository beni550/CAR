import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompareArrows, Plus, X, Search, Shield, FileText, Accessibility, Gauge, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function MiniPlate({ plate, onRemove }) {
  const formatted = plate.length === 7
    ? `${plate.slice(0,2)}-${plate.slice(2,5)}-${plate.slice(5,7)}`
    : plate.length === 8
    ? `${plate.slice(0,3)}-${plate.slice(3,5)}-${plate.slice(5,8)}`
    : plate;
  return (
    <div className="flex items-center gap-2">
      <div className="license-plate !max-w-[140px] text-sm">
        <div className="il-strip !p-1 !min-w-[22px] !text-[7px]"><span>IL</span></div>
        <div className="plate-number !text-sm !py-1 !px-2 !tracking-wider">{formatted}</div>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function ScoreBadge({ score }) {
  if (!score) return null;
  const color = score.color === 'emerald' ? 'text-emerald-400 bg-emerald-500/20' :
    score.color === 'blue' ? 'text-blue-400 bg-blue-500/20' :
    score.color === 'amber' ? 'text-amber-400 bg-amber-500/20' :
    'text-red-400 bg-red-500/20';
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
      <Gauge className="w-4 h-4" />
      {score.score}/100
    </div>
  );
}

function CompareField({ label, values, highlight }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${values.length}, 1fr)` }}>
      <div className="text-sm text-white/50 py-2">{label}</div>
      {values.map((v, i) => (
        <div key={i} className={`text-sm py-2 text-center font-medium ${highlight && v === Math.max(...values.filter(x => typeof x === 'number')) ? 'text-emerald-400' : ''}`}>
          {v || '—'}
        </div>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const [plates, setPlates] = useState([]);
  const [currentPlate, setCurrentPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const addPlate = () => {
    const clean = currentPlate.replace(/\D/g, '');
    if (clean.length < 5 || clean.length > 8) {
      setError('נא להזין מספר רכב תקין');
      return;
    }
    if (plates.includes(clean)) {
      setError('רכב זה כבר נמצא בהשוואה');
      return;
    }
    if (plates.length >= 3) {
      setError('ניתן להשוות עד 3 רכבים');
      return;
    }
    setPlates(prev => [...prev, clean]);
    setCurrentPlate('');
    setError('');
    setResults(null);
  };

  const removePlate = (plate) => {
    setPlates(prev => prev.filter(p => p !== plate));
    setResults(null);
  };

  const handleCompare = async () => {
    if (plates.length < 2) {
      setError('יש לבחור לפחות 2 רכבים להשוואה');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await axios.post(`${API}/vehicle/compare`, { plates });
      setResults(resp.data.comparisons);
    } catch (err) {
      setError('שגיאה בטעינת נתוני השוואה');
    } finally {
      setLoading(false);
    }
  };

  const validResults = results?.filter(r => r.data && !r.error) || [];

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="compare-page">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-rubik font-bold text-2xl sm:text-3xl mb-2 flex items-center justify-center gap-3">
            <GitCompareArrows className="w-7 h-7 text-blue-400" />
            השוואת רכבים
          </h1>
          <p className="text-white/50 text-sm">הוסף 2-3 רכבים להשוואה מפורטת</p>
        </motion.div>

        {/* Add Plates */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-5 mb-6 hover:translate-y-0">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={currentPlate}
              onChange={(e) => { setCurrentPlate(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && addPlate()}
              placeholder="הזן מספר רכב..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-center font-rubik font-bold tracking-widest placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              dir="ltr"
              maxLength={10}
              data-testid="compare-input"
            />
            <Button onClick={addPlate} disabled={plates.length >= 3} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6" data-testid="add-plate-btn">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          {/* Selected plates */}
          <div className="flex flex-wrap gap-3 mb-4">
            <AnimatePresence>
              {plates.map(plate => (
                <motion.div key={plate} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <MiniPlate plate={plate} onRemove={() => removePlate(plate)} />
                </motion.div>
              ))}
            </AnimatePresence>
            {plates.length < 3 && (
              <div className="flex items-center gap-2 text-white/20 text-sm">
                <div className="w-24 h-10 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleCompare}
            disabled={plates.length < 2 || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3"
            data-testid="compare-btn"
          >
            {loading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> משווה...</> : <><GitCompareArrows className="w-4 h-4 ml-2" /> השווה עכשיו</>}
          </Button>
        </motion.div>

        {/* Comparison Results */}
        {validResults.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Header row with plates */}
            <div className="glass-card p-5 hover:translate-y-0">
              <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${validResults.length}, 1fr)` }}>
                <div />
                {validResults.map(r => (
                  <div key={r.plate} className="text-center">
                    <MiniPlate plate={r.plate} />
                    <div className="mt-2">
                      <ScoreBadge score={r.data.health_score} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic info */}
            <div className="glass-card p-5 hover:translate-y-0">
              <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">פרטים בסיסיים</h3>
              <div className="space-y-1 divide-y divide-white/5">
                <CompareField label="יצרן" values={validResults.map(r => r.data.vehicle.tozeret_nm)} />
                <CompareField label="דגם" values={validResults.map(r => r.data.vehicle.kinuy_mishari || r.data.vehicle.degem_nm)} />
                <CompareField label="שנת ייצור" values={validResults.map(r => r.data.vehicle.shnat_yitzur)} highlight />
                <CompareField label="צבע" values={validResults.map(r => r.data.vehicle.tzeva_rechev)} />
                <CompareField label="סוג דלק" values={validResults.map(r => r.data.vehicle.sug_delek_nm)} />
                <CompareField label="בעלות" values={validResults.map(r => r.data.vehicle.baalut)} />
              </div>
            </div>

            {/* Status comparison */}
            <div className="glass-card p-5 hover:translate-y-0">
              <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">סטטוס</h3>
              <div className="space-y-1 divide-y divide-white/5">
                <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${validResults.length}, 1fr)` }}>
                  <div className="text-sm text-white/50 py-2">גניבה</div>
                  {validResults.map((r, i) => (
                    <div key={i} className={`text-sm py-2 text-center font-medium ${r.data.theft?.stolen ? 'text-red-400' : 'text-emerald-400'}`}>
                      {r.data.theft?.stolen ? 'גנוב!' : 'נקי'}
                    </div>
                  ))}
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${validResults.length}, 1fr)` }}>
                  <div className="text-sm text-white/50 py-2">טסט</div>
                  {validResults.map((r, i) => {
                    const tokef = r.data.vehicle.tokef_dt;
                    const valid = tokef ? new Date(tokef) > new Date() : null;
                    return (
                      <div key={i} className={`text-sm py-2 text-center font-medium ${valid === null ? 'text-white/40' : valid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {valid === null ? 'לא זמין' : valid ? 'בתוקף' : 'פג תוקף'}
                      </div>
                    );
                  })}
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${validResults.length}, 1fr)` }}>
                  <div className="text-sm text-white/50 py-2">תו נכה</div>
                  {validResults.map((r, i) => (
                    <div key={i} className={`text-sm py-2 text-center font-medium ${r.data.disability?.has_disability_tag ? 'text-blue-400' : 'text-white/40'}`}>
                      {r.data.disability?.has_disability_tag ? 'כן' : 'לא'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price comparison */}
            {validResults.some(r => r.data.price) && (
              <div className="glass-card p-5 hover:translate-y-0">
                <h3 className="font-rubik font-semibold text-sm text-white/40 uppercase tracking-wider mb-4">שווי משוער</h3>
                <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${validResults.length}, 1fr)` }}>
                  <div className="text-sm text-white/50 py-2">טווח מחיר</div>
                  {validResults.map((r, i) => (
                    <div key={i} className="text-sm py-2 text-center font-medium text-amber-400">
                      {r.data.price ? `₪${r.data.price.estimated_low?.toLocaleString()} - ₪${r.data.price.estimated_high?.toLocaleString()}` : '—'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View individual vehicles */}
            <div className="flex flex-wrap gap-3 justify-center">
              {validResults.map(r => (
                <Button key={r.plate} onClick={() => navigate(`/vehicle/${r.plate}`)} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl text-sm">
                  <ArrowRight className="w-4 h-4 ml-1" />
                  {r.plate} — צפה בפרטים
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error results */}
        {results && results.some(r => r.error) && (
          <div className="mt-4 space-y-2">
            {results.filter(r => r.error).map((r, i) => (
              <div key={i} className="glass-card p-3 text-sm text-red-400 hover:translate-y-0">
                רכב {r.plate}: {r.error}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!results && plates.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center hover:translate-y-0">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <GitCompareArrows className="w-10 h-10 text-blue-400/50" />
            </div>
            <h3 className="font-rubik font-semibold text-lg mb-2">השוואה קלה ומהירה</h3>
            <p className="text-white/40 text-sm mb-2">הוסף 2-3 מספרי רכב כדי לראות השוואה מפורטת</p>
            <p className="text-white/30 text-xs">כולל: יצרן, דגם, שנה, סטטוס גניבה, טסט, שווי ועוד</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
