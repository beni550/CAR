import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Book, Search, ChevronLeft, Car, ArrowRight, Hash, Calendar, Factory, Fuel, Palette, FileCheck, CircleDot, Sparkles } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ease = [0.4, 0, 0.2, 1];
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="skeleton h-24 rounded-[20px]" />
  );
}

function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="skeleton h-16 rounded-[20px] mb-2" />
  ));
}

/* ── Breadcrumb ── */
function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: 'var(--text-secondary)' }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className="gradient-text">
              <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" />
            </span>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="transition-colors hover:brightness-125"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ══════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════ */
export default function EncyclopediaPage() {
  const navigate = useNavigate();

  // Navigation state
  const [level, setLevel] = useState('manufacturers');
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [manufacturers, setManufacturers] = useState(null);
  const [models, setModels] = useState({});
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch manufacturers on mount
  useEffect(() => {
    if (manufacturers) return;
    setLoading(true);
    axios.get(`${API}/encyclopedia/manufacturers`)
      .then(res => {
        const sorted = (res.data.manufacturers || []).sort((a, b) => b.vehicle_count - a.vehicle_count);
        setManufacturers(sorted);
      })
      .catch(() => setError('שגיאה בטעינת יצרנים'))
      .finally(() => setLoading(false));
  }, []);

  // Select manufacturer
  const handleSelectManufacturer = useCallback((mfr) => {
    setSelectedManufacturer(mfr);
    setLevel('models');
    setSearchQuery('');

    const cacheKey = mfr.tozeret_cd;
    if (models[cacheKey]) return;

    setLoading(true);
    axios.get(`${API}/encyclopedia/models`, { params: { manufacturer_code: mfr.tozeret_cd } })
      .then(res => {
        setModels(prev => ({ ...prev, [cacheKey]: res.data.models || [] }));
      })
      .catch(() => setError('שגיאה בטעינת דגמים'))
      .finally(() => setLoading(false));
  }, [models]);

  // Select model
  const handleSelectModel = useCallback((model) => {
    setSelectedModel(model);
    setLevel('details');
    setSearchQuery('');

    const cacheKey = `${selectedManufacturer.tozeret_cd}-${model.degem_cd}`;
    if (details[cacheKey]) return;

    setLoading(true);
    axios.get(`${API}/encyclopedia/model-details`, {
      params: {
        manufacturer_code: selectedManufacturer.tozeret_cd,
        model_code: model.degem_cd
      }
    })
      .then(res => {
        setDetails(prev => ({ ...prev, [cacheKey]: res.data.vehicles || [] }));
      })
      .catch(() => setError('שגיאה בטעינת פרטי דגם'))
      .finally(() => setLoading(false));
  }, [selectedManufacturer, details]);

  // Navigation helpers
  const goToManufacturers = () => {
    setLevel('manufacturers');
    setSelectedManufacturer(null);
    setSelectedModel(null);
    setSearchQuery('');
    setError('');
  };

  const goToModels = () => {
    setLevel('models');
    setSelectedModel(null);
    setSearchQuery('');
    setError('');
  };

  // Filtered data
  const filteredManufacturers = useMemo(() => {
    if (!manufacturers) return [];
    if (!searchQuery.trim()) return manufacturers;
    const q = searchQuery.trim().toLowerCase();
    return manufacturers.filter(m => m.tozeret_nm?.toLowerCase().includes(q));
  }, [manufacturers, searchQuery]);

  const currentModels = selectedManufacturer ? models[selectedManufacturer.tozeret_cd] : null;

  const filteredModels = useMemo(() => {
    if (!currentModels) return [];
    if (!searchQuery.trim()) return currentModels;
    const q = searchQuery.trim().toLowerCase();
    return currentModels.filter(m =>
      m.degem_nm?.toLowerCase().includes(q) ||
      m.kinuy_mishari?.toLowerCase().includes(q)
    );
  }, [currentModels, searchQuery]);

  const currentDetails = (selectedManufacturer && selectedModel)
    ? details[`${selectedManufacturer.tozeret_cd}-${selectedModel.degem_cd}`]
    : null;

  /* ── Shared search bar ── */
  const SearchBar = ({ placeholder, testId }) => (
    <div className="relative group">
      <Search
        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl pr-11 pl-4 py-3.5 text-sm transition-all duration-300 outline-none"
        style={{
          background: 'var(--border-glass, rgba(255,255,255,0.04))',
          border: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#6390ff';
          e.target.style.boxShadow = '0 0 0 3px rgba(99,144,255,0.15), 0 4px 24px rgba(99,144,255,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-glass, rgba(255,255,255,0.08))';
          e.target.style.boxShadow = 'none';
        }}
        data-testid={testId}
      />
    </div>
  );

  return (
    <div className="min-h-screen ambient-bg pt-20 px-4 pb-safe" data-testid="encyclopedia-page">
      <div className="max-w-5xl mx-auto">

        {/* ========== LEVEL 1: MANUFACTURERS ========== */}
        <AnimatePresence mode="wait">
          {level === 'manufacturers' && (
            <motion.div
              key="manufacturers"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease }}
            >
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="text-center mb-10"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg, rgba(99,144,255,0.15), rgba(167,139,250,0.15))' }}
                >
                  <Book className="w-8 h-8" style={{ color: '#6390ff' }} />
                </div>
                <h1 className="gradient-text font-rubik font-bold text-2xl sm:text-3xl md:text-4xl mb-3">
                  אנציקלופדיית רכבים
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>כל היצרנים והדגמים בישראל — חפש, גלה, בדוק</p>
              </motion.div>

              {/* Search */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="mb-8 max-w-md mx-auto"
              >
                <SearchBar placeholder="חפש יצרן..." testId="encyclopedia-search" />
              </motion.div>

              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

              {/* Loading */}
              {loading && !manufacturers && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Manufacturers Grid */}
              {manufacturers && (
                <>
                  <div className="text-center text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
                    {filteredManufacturers.length} יצרנים
                  </div>
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredManufacturers.map((mfr, i) => (
                      <motion.button
                        key={mfr.tozeret_cd}
                        variants={fadeUp}
                        onClick={() => handleSelectManufacturer(mfr)}
                        className="glass-card p-5 text-right w-full transition-all group cursor-pointer relative overflow-hidden"
                        whileHover={{ y: -2, transition: { duration: 0.2, ease } }}
                        data-testid={`mfr-card-${mfr.tozeret_cd}`}
                        style={{ '--hover-border': '#6390ff' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,144,255,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                      >
                        <div className="flex items-center justify-between">
                          <ArrowRight
                            className="w-4 h-4 transition-all transform rotate-180 group-hover:translate-x-[-4px]"
                            style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
                          />
                          <div className="flex-1 text-right">
                            <h3 className="font-rubik font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                              {mfr.tozeret_nm}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs justify-end" style={{ color: 'var(--text-secondary)' }}>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(99,144,255,0.08)', color: '#6390ff' }}
                              >
                                {mfr.vehicle_count?.toLocaleString()} רכבים
                              </span>
                              <Car className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>

                  {filteredManufacturers.length === 0 && (
                    <div className="text-center text-sm py-12" style={{ color: 'var(--text-secondary)' }}>
                      לא נמצאו יצרנים עבור "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ========== LEVEL 2: MODELS ========== */}
          {level === 'models' && selectedManufacturer && (
            <motion.div
              key="models"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease }}
            >
              <Breadcrumb items={[
                { label: 'אנציקלופדיה', onClick: goToManufacturers },
                { label: selectedManufacturer.tozeret_nm }
              ]} />

              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={goToManufacturers}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125"
                  style={{
                    background: 'var(--border-glass, rgba(255,255,255,0.04))',
                    border: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
                  }}
                  data-testid="back-to-manufacturers"
                >
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </button>
                <div>
                  <h2 className="font-rubik font-bold text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                    {selectedManufacturer.tozeret_nm}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedManufacturer.vehicle_count?.toLocaleString()} רכבים במאגר
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6 max-w-md">
                <SearchBar placeholder="חפש דגם..." testId="models-search" />
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              {loading && !currentModels && <SkeletonRows count={6} />}

              {currentModels && (
                <>
                  <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{filteredModels.length} דגמים</div>

                  {/* Table header */}
                  <div
                    className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 text-xs font-medium mb-1 rounded-xl"
                    style={{ color: 'var(--text-secondary)', background: 'var(--border-glass, rgba(255,255,255,0.02))' }}
                  >
                    <div className="col-span-4">דגם</div>
                    <div className="col-span-3">שם מסחרי</div>
                    <div className="col-span-3">שנים</div>
                    <div className="col-span-2 text-center">כמות</div>
                  </div>

                  <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-2">
                    {filteredModels.map((model) => (
                      <motion.button
                        key={model.degem_cd}
                        variants={fadeUp}
                        onClick={() => handleSelectModel(model)}
                        className="glass-card p-4 w-full text-right transition-all group cursor-pointer"
                        whileHover={{ y: -1, transition: { duration: 0.15, ease } }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,144,255,0.25)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                        data-testid={`model-card-${model.degem_cd}`}
                      >
                        {/* Desktop */}
                        <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-4 font-rubik font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {model.degem_nm}
                          </div>
                          <div className="col-span-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {model.kinuy_mishari || '—'}
                          </div>
                          <div className="col-span-3 text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Calendar className="w-3 h-3" />
                            {model.years && model.years.length > 0 ? (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span
                                  className="inline-block px-1.5 py-0.5 rounded text-[11px]"
                                  style={{ background: 'rgba(99,144,255,0.1)', color: '#6390ff' }}
                                >
                                  {model.years[0]}
                                </span>
                                {model.years.length > 1 && (
                                  <>
                                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>—</span>
                                    <span
                                      className="inline-block px-1.5 py-0.5 rounded text-[11px]"
                                      style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}
                                    >
                                      {model.years[model.years.length - 1]}
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span>{model.shnat_yitzur || '—'}</span>
                            )}
                          </div>
                          <div className="col-span-2 text-center">
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(99,144,255,0.08)', color: '#6390ff' }}
                            >
                              <Hash className="w-3 h-3" />
                              {model.count?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {/* Mobile */}
                        <div className="sm:hidden">
                          <div className="flex items-center justify-between mb-1">
                            <ArrowRight
                              className="w-4 h-4 transition-all transform rotate-180 group-hover:translate-x-[-4px]"
                              style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
                            />
                            <h4 className="font-rubik font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {model.degem_nm}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 text-xs justify-end" style={{ color: 'var(--text-secondary)' }}>
                            {model.kinuy_mishari && <span>{model.kinuy_mishari}</span>}
                            {model.years && model.years.length > 0 ? (
                              <span>{model.years[0]}–{model.years[model.years.length - 1]}</span>
                            ) : model.shnat_yitzur ? (
                              <span>{model.shnat_yitzur}</span>
                            ) : null}
                            <span>{model.count?.toLocaleString()} רכבים</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>

                  {filteredModels.length === 0 && (
                    <div className="text-center text-sm py-12" style={{ color: 'var(--text-secondary)' }}>
                      לא נמצאו דגמים עבור "{searchQuery}"
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ========== LEVEL 3: MODEL DETAILS ========== */}
          {level === 'details' && selectedManufacturer && selectedModel && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease }}
            >
              <Breadcrumb items={[
                { label: 'אנציקלופדיה', onClick: goToManufacturers },
                { label: selectedManufacturer.tozeret_nm, onClick: goToModels },
                { label: selectedModel.kinuy_mishari || selectedModel.degem_nm }
              ]} />

              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={goToModels}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:brightness-125"
                  style={{
                    background: 'var(--border-glass, rgba(255,255,255,0.04))',
                    border: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
                  }}
                  data-testid="back-to-models"
                >
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </button>
                <div>
                  <h2 className="font-rubik font-bold text-xl sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                    {selectedManufacturer.tozeret_nm} — {selectedModel.kinuy_mishari || selectedModel.degem_nm}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedModel.degem_nm} {selectedModel.count ? `(${selectedModel.count.toLocaleString()} רכבים)` : ''}
                  </p>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              {loading && !currentDetails && <SkeletonRows count={5} />}

              {currentDetails && (
                <>
                  <div className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    מציג {Math.min(currentDetails.length, 20)} רכבים לדוגמה
                  </div>

                  <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-3">
                    {currentDetails.slice(0, 20).map((v, idx) => (
                      <motion.div
                        key={v.mispar_rechev || idx}
                        variants={fadeUp}
                        className="glass-card p-5 relative overflow-hidden"
                        whileHover={{ y: -1, transition: { duration: 0.15, ease } }}
                      >
                        {/* Mini license plate preview */}
                        {v.mispar_rechev && (
                          <div
                            className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99,144,255,0.1), rgba(167,139,250,0.1))',
                              border: '1px solid rgba(99,144,255,0.15)',
                              color: '#6390ff',
                              direction: 'ltr',
                            }}
                          >
                            {v.mispar_rechev}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mt-8 sm:mt-0">
                            {/* Year */}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#6390ff' }} />
                              <div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>שנת ייצור</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v.shnat_yitzur || '—'}</div>
                              </div>
                            </div>
                            {/* Trim */}
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 flex-shrink-0" style={{ color: '#6390ff' }} />
                              <div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>רמת גימור</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v.ramat_gimur || v.kinuy_mishari || '—'}</div>
                              </div>
                            </div>
                            {/* Fuel */}
                            <div className="flex items-center gap-2">
                              <Fuel className="w-4 h-4 flex-shrink-0" style={{ color: '#22d3ee' }} />
                              <div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>דלק</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v.sug_delek_nm || '—'}</div>
                              </div>
                            </div>
                            {/* Color */}
                            <div className="flex items-center gap-2">
                              <Palette className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                              <div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>צבע</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v.tzeva_rechev || '—'}</div>
                              </div>
                            </div>
                            {/* Test expiry */}
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#22d3ee' }} />
                              <div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>תוקף טסט</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {v.tokef_dt
                                    ? new Date(v.tokef_dt).toLocaleDateString('he-IL')
                                    : '—'}
                                </div>
                              </div>
                            </div>
                            {/* Tires */}
                            <div className="flex items-center gap-2">
                              <CircleDot className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                              <div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>צמיגים</div>
                                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {v.zmig_kidmi || v.zmig_ahori
                                    ? `${v.zmig_kidmi || '?'} / ${v.zmig_ahori || '?'}`
                                    : '—'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Check vehicle button */}
                          {v.mispar_rechev && (
                            <button
                              onClick={() => navigate(`/vehicle/${v.mispar_rechev}`)}
                              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all self-start flex-shrink-0 hover:brightness-110"
                              style={{
                                background: 'linear-gradient(135deg, #6390ff, #a78bfa)',
                                color: '#fff',
                                boxShadow: '0 4px 16px rgba(99,144,255,0.25)',
                              }}
                              data-testid={`check-vehicle-${v.mispar_rechev}`}
                            >
                              <Search className="w-4 h-4" />
                              בדוק רכב
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {currentDetails.length === 0 && (
                    <div className="glass-card p-10 text-center">
                      <Car className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>לא נמצאו רכבים לדגם זה</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
