import React, { useState, useMemo } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

// Criteria definitions
const CRITERIA = [
  { key: 'price',     label: 'Harga',     icon: '💰', desc: 'Semakin murah semakin baik' },
  { key: 'range',     label: 'Range',     icon: '🔋', desc: 'Jarak tempuh (km)' },
  { key: 'top_speed', label: 'Top Speed', icon: '⚡', desc: 'Kecepatan puncak (km/h)' },
  { key: 'battery',   label: 'Baterai',   icon: '📦', desc: 'Kapasitas baterai (kWh)' },
];

// 6 pairwise comparisons (upper triangle of 4x4 matrix)
const PAIRS = [
  [0, 1], [0, 2], [0, 3],
  [1, 2], [1, 3],
  [2, 3],
];

// Slider maps position 1–17 → AHP scale
// position 9 = equal (1), 1..8 = 1/9..1/2, 10..17 = 2..9
const sliderToAHP = (pos) => {
  if (pos === 9) return 1;
  if (pos < 9) return 1 / (10 - pos);  // pos=8→1/2, pos=1→1/9
  return pos - 8;                        // pos=10→2, pos=17→9
};

const ahpLabel = (pos) => {
  if (pos === 9) return 'Sama Penting';
  
  const labels = {
    1: 'Mutlak Kurang',
    2: 'Sangat Jauh Kurang',
    3: 'Jauh Kurang',
    4: 'Lebih Kurang',
    5: 'Sangat Kurang',
    6: 'Cukup Kurang',
    7: 'Kurang Penting',
    8: 'Sedikit Kurang',
    10: 'Sedikit Lebih',
    11: 'Cukup Lebih',
    12: 'Lebih Penting',
    13: 'Sangat Lebih',
    14: 'Lebih Utama',
    15: 'Jauh Lebih',
    16: 'Sangat Jauh Lebih',
    17: 'Mutlak Lebih'
  };

  const factor = pos < 9 ? (10 - pos) : (pos - 8);
  const suffix = pos < 9 ? `1/${factor}×` : `${factor}×`;
  
  return labels[pos] ? `${labels[pos]} (${suffix})` : `${suffix}`;
};

const buildMatrix = (sliders) => {
  const n = CRITERIA.length;
  const m = Array.from({ length: n }, () => Array(n).fill(1));
  PAIRS.forEach(([i, j], idx) => {
    const v = sliderToAHP(sliders[idx]);
    m[i][j] = v;
    m[j][i] = parseFloat((1 / v).toFixed(6));
  });
  return m;
};

// Preset slider positions
const PRESETS = {
  equal:         [9, 9, 9, 9, 9, 9],
  price_first:   [13, 13, 12, 9, 9, 9],   // price >> range >> speed ≈ battery
  range_first:   [6,  9,  9, 12, 12, 9],  // range >> price, range >> speed, range >> battery
  speed_first:   [9,  6,  9, 6, 9, 12],
  balanced_ev:   [11, 10, 10, 9, 9, 9],   // price slightly more than rest
};

const AHPForm = ({ onWeightsCalculated }) => {
  const [sliders, setSliders] = useState(PRESETS.equal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cr, setCr] = useState(null);
  const [isConsistent, setIsConsistent] = useState(null);
  const [weights, setWeights] = useState(null);
  const [activePreset, setActivePreset] = useState('equal');

  const matrix = useMemo(() => buildMatrix(sliders), [sliders]);

  const applyPreset = (key) => {
    setSliders(PRESETS[key]);
    setActivePreset(key);
    setError('');
    setCr(null);
    setIsConsistent(null);
    setWeights(null);
  };

  const handleSliderChange = (idx, val) => {
    const next = [...sliders];
    next[idx] = parseInt(val);
    setSliders(next);
    setActivePreset(null);
    setError('');
    setCr(null);
    setIsConsistent(null);
    setWeights(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCr(null);
    setIsConsistent(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ahp/calculate', {
        pairwise_matrix: matrix,
      });
      const data = response.data;
      setCr(data.cr);
      setIsConsistent(data.is_consistent);
      setWeights(data.weights);

      if (data.is_consistent) {
        onWeightsCalculated(data.weights, data.cr);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#00C46A', '#0066FF', '#00C8D4'] });
      } else {
        setError(`Matriks tidak konsisten (CR = ${data.cr?.toFixed(4)}). Coba sesuaikan kembali perbandingan.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Koneksi ke backend Flask terputus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-fade">
      <div className="section-label" style={{ marginBottom: 6 }}>Langkah 1</div>
      <h2 style={{ marginBottom: 4 }}>Atur Prioritas Kriteria</h2>
      <p style={{ marginBottom: 24, maxWidth: 600 }}>
        Geser slider untuk menentukan seberapa penting satu kriteria dibanding yang lain.
        Tengah = sama penting, geser kanan = kriteria kiri lebih penting.
      </p>

      {/* PRESETS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', alignSelf: 'center' }}>Template:</span>
        {[
          { key: 'equal',       label: 'Seimbang' },
          { key: 'price_first', label: '💰 Prioritas Harga' },
          { key: 'range_first', label: '🔋 Prioritas Range' },
          { key: 'speed_first', label: '⚡ Prioritas Speed' },
          { key: 'balanced_ev', label: '🌿 EV Optimal' },
        ].map(p => (
          <button
            key={p.key}
            className={`preset-chip ${activePreset === p.key ? 'active' : ''}`}
            type="button"
            onClick={() => applyPreset(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* PAIRWISE SLIDERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {PAIRS.map(([i, j], idx) => {
            const pos = sliders[idx];
            const label = ahpLabel(pos);
            const isLeftDom = pos < 9;
            const isRightDom = pos > 9;
            return (
              <div className="comparison-row" key={idx}>
                <div className="criteria-labels">
                  <div className="criteria-name" style={{ color: isLeftDom ? 'var(--green-dark)' : 'var(--text-secondary)' }}>
                    <span className="criteria-icon" style={{ background: isLeftDom ? 'rgba(0,196,106,0.12)' : undefined }}>
                      {CRITERIA[i].icon}
                    </span>
                    {CRITERIA[i].label}
                    {isLeftDom && <span style={{ fontSize: '0.65rem', color: 'var(--green)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>▲</span>}
                  </div>

                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div className="slider-current" style={{ color: pos === 9 ? 'var(--text-muted)' : isLeftDom ? 'var(--green)' : 'var(--blue)' }}>
                      {label}
                    </div>
                  </div>

                  <div className="criteria-name" style={{ justifyContent: 'flex-end', color: isRightDom ? 'var(--blue)' : 'var(--text-secondary)' }}>
                    {isRightDom && <span style={{ fontSize: '0.65rem', color: 'var(--blue)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>▲</span>}
                    {CRITERIA[j].label}
                    <span className="criteria-icon" style={{ background: isRightDom ? 'rgba(0,102,255,0.1)' : undefined }}>
                      {CRITERIA[j].icon}
                    </span>
                  </div>
                </div>

                <div className="slider-wrap">
                  <input
                    type="range"
                    className="ahp-slider"
                    min="1" max="17" step="1"
                    value={pos}
                    onChange={(e) => handleSliderChange(idx, e.target.value)}
                    style={{
                      background: `linear-gradient(90deg, 
                        var(--green) 0%, 
                        var(--surface-3) ${((pos - 1) / 16 * 100)}%, 
                        var(--surface-3) ${((pos - 1) / 16 * 100)}%, 
                        var(--blue) 100%)`
                    }}
                  />
                  <div className="slider-value-display">
                    <span className="slider-val" style={{ color: 'var(--green-dark)' }}>←{CRITERIA[i].label}</span>
                    <span className="slider-val" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Sama</span>
                    <span className="slider-val" style={{ color: 'var(--blue)', textAlign: 'right' }}>{CRITERIA[j].label}→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUBMIT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-green" disabled={loading}>
            {loading ? (
              <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Menghitung...</>
            ) : (
              <><CheckCircle size={16} /> Hitung Bobot AHP</>
            )}
          </button>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Batas CR ≤ 0.10
          </div>
        </div>
      </form>

      {/* FEEDBACK */}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 20 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {cr !== null && isConsistent && weights && (
        <div className="alert alert-success" style={{ marginTop: 20 }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Konsisten! CR = {cr.toFixed(4)}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              {CRITERIA.map(c => (
                <span key={c.key} style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-dark)' }}>
                  {c.icon} {c.label}: <strong>{(weights[c.key] * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AHPForm;
