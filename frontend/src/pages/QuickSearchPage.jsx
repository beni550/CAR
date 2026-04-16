import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Camera, Upload } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function QuickSearchPage() {
  const navigate = useNavigate();
  const [plate, setPlate] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const handleSearch = () => {
    const clean = plate.replace(/\D/g, '');
    if (clean.length >= 5 && clean.length <= 8) {
      navigate(`/vehicle/${clean}`);
    } else {
      setError('מספר רכב לא תקין');
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await axios.post(`${API}/vehicle/ai-recognize`, formData);
      if (resp.data.success && resp.data.plate) {
        navigate(`/vehicle/${resp.data.plate}`);
      } else {
        setError('לא הצלחנו לזהות לוחית');
      }
    } catch {
      setError('שגיאה בזיהוי');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen ambient-bg flex flex-col items-center justify-center px-4" data-testid="quick-search-page">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <h2 className="font-rubik font-bold text-xl text-center mb-6">חיפוש מהיר</h2>

        <input
          data-testid="quick-plate-input"
          type="text"
          value={plate}
          onChange={(e) => { setPlate(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="מספר רכב"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-2xl text-center font-rubik font-bold tracking-widest placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all mb-4"
          dir="ltr"
        />

        {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

        <button
          data-testid="quick-search-btn"
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-xl mb-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-5 h-5" /> חפש
        </button>

        <div className="flex gap-3">
          <button
            data-testid="quick-camera-btn"
            onClick={() => cameraRef.current?.click()}
            disabled={aiLoading}
            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-5 h-5" /> {aiLoading ? 'מנתח...' : 'צלם'}
          </button>
          <button
            data-testid="quick-gallery-btn"
            onClick={() => galleryRef.current?.click()}
            disabled={aiLoading}
            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" /> גלריה
          </button>
        </div>
      </motion.div>
    </div>
  );
}
