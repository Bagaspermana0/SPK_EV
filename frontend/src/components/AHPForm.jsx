import React, { useState, useMemo } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CircleDollarSign, 
  Battery, 
  Zap, 
  Cpu,
  Info
} from 'lucide-react';

const sliderToAHP = (pos) => {
  if (pos === 9) return 1;
  if (pos < 9) return 1 / (10 - pos);
  return pos - 8;
};

const AHPForm = ({ onWeightsCalculated, lang, t }) => {
  const [sliders, setSliders] = useState([9, 9, 9, 9, 9, 9]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cr, setCr] = useState(null);
  const [isConsistent, setIsConsistent] = useState(null);
  const [weights, setWeights] = useState(null);
  const [activePreset, setActivePreset] = useState('equal');
  const [showGuide, setShowGuide] = useState(true);

  // Criteria metadata mapping to translation keys and icons
  const CRITERIA = useMemo(() => [
    { key: 'price',     labelKey: 'price',     icon: <CircleDollarSign size={14} />, color: 'var(--amber)' },
    { key: 'range',     labelKey: 'range',     icon: <Battery size={14} />, color: 'var(--green)' },
    { key: 'top_speed', labelKey: 'topSpeed',  icon: <Zap size={14} />, color: 'var(--blue)' },
    { key: 'battery',   labelKey: 'battery',   icon: <Cpu size={14} />, color: 'var(--teal)' },
  ], []);

  // 6 upper-triangular pairwise comparisons
  const PAIRS = useMemo(() => [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 3],
    [2, 3],
  ], []);

  const PRESETS = useMemo(() => ({
    equal:         [9, 9, 9, 9, 9, 9],
    price_first:   [13, 13, 12, 9, 9, 9],
    range_first:   [6,  9,  9, 12, 12, 9],
    speed_first:   [9,  6,  9, 6, 9, 12],
    balanced_ev:   [11, 10, 10, 9, 9, 9],
  }), []);

  const buildMatrix = (currentSliders) => {
    const n = 4;
    const m = Array.from({ length: n }, () => Array(n).fill(1));
    PAIRS.forEach(([i, j], idx) => {
      const v = sliderToAHP(currentSliders[idx]);
      m[i][j] = v;
      m[j][i] = parseFloat((1 / v).toFixed(6));
    });
    return m;
  };

  const matrix = useMemo(() => buildMatrix(sliders), [sliders, PAIRS]);

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

  const getSliderClass = (pos) => {
    if (pos === 9) return 'ahp-slider-center';
    return pos < 9 ? 'ahp-slider-left' : 'ahp-slider-right';
  };

  const getComparisonText = (i, j, pos) => {
    const leftName = t[CRITERIA[i].labelKey];
    const rightName = t[CRITERIA[j].labelKey];
    
    if (pos === 9) {
      return lang === 'id' ? 'Kedua kriteria sama penting' : 'Both criteria are equally important';
    }
    if (pos < 9) {
      const factor = 10 - pos;
      return lang === 'id'
        ? `${leftName} ${factor}× lebih penting dari ${rightName}`
        : `${leftName} ${factor}× more important than ${rightName}`;
    }
    const factor = pos - 8;
    return lang === 'id'
      ? `${rightName} ${factor}× lebih penting dari ${leftName}`
      : `${rightName} ${factor}× more important than ${leftName}`;
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
        confetti({ 
          particleCount: 120, 
          spread: 80, 
          origin: { y: 0.55 }, 
          colors: ['#00D97E', '#3B82F6', '#06B6D4'] 
        });
      } else {
        // Inconsistent matrix error
        setError('inconsistent');
      }
    } catch (err) {
      setError('network');
    } finally {
      setLoading(false);
    }
  };

  const presetDescriptions = {
    equal: t.presetEqualDesc,
    price_first: t.presetPriceDesc,
    range_first: t.presetRangeDesc,
    speed_first: t.presetSpeedDesc,
    balanced_ev: t.presetOptimalDesc,
  };

  return (
    <div className="tab-content">
      <div className="section-label" style={{ marginBottom: 6 }}>Langkah 1</div>
      <h2 style={{ marginBottom: 8 }}>{t.ahpTitle}</h2>
      <p style={{ marginBottom: 24, maxWidth: 640 }}>{t.ahpDesc}</p>

      {/* COLLAPSIBLE GUIDE PANEL */}
      <div className="glass-card guide-panel" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div className="guide-header" onClick={() => setShowGuide(!showGuide)}>
          <span className="guide-title">
            <HelpCircle size={15} />
            {t.ahpGuideTitle}
          </span>
          {showGuide ? <ChevronUp size={15} style={{ color: 'var(--blue)' }} /> : <ChevronDown size={15} style={{ color: 'var(--blue)' }} />}
        </div>
        
        {showGuide && (
          <div style={{ marginTop: 12, fontSize: '0.82rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>👈 <strong>{t.ahpGuideLeft}</strong></li>
              <li>⚪ <strong>{t.ahpGuideCenter}</strong></li>
              <li>👉 <strong>{t.ahpGuideRight}</strong></li>
            </ul>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(59, 130, 246, 0.15)', color: 'var(--text-muted)' }}>
              {t.ahpGuideExample}
            </div>
          </div>
        )}
      </div>

      {/* PRESETS LIST WITH DYNAMIC DESCRIPTION */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {t.presetTitle}
          </span>
          {[
            { key: 'equal',       label: t.presetEqual },
            { key: 'price_first', label: t.presetPrice },
            { key: 'range_first', label: t.presetRange },
            { key: 'speed_first', label: t.presetSpeed },
            { key: 'balanced_ev', label: t.presetOptimal },
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
        {activePreset && (
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            » {presetDescriptions[activePreset]}
          </div>
        )}
      </div>

      {/* FORM OF PAIRWISE COMPARISONS */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: 28 }}>
          {PAIRS.map(([i, j], idx) => {
            const pos = sliders[idx];
            const isLeftDom = pos < 9;
            const isRightDom = pos > 9;
            
            return (
              <div 
                className={`comparison-row ${isLeftDom ? 'criteria-active-left' : isRightDom ? 'criteria-active-right' : ''}`} 
                key={idx}
              >
                <div className="criteria-labels">
                  {/* Left Label */}
                  <div className="criteria-name" style={{ justifyContent: 'flex-start' }}>
                    <span className="criteria-icon-box criteria-icon-left">
                      {CRITERIA[i].icon}
                    </span>
                    <span className="criteria-name-left">{t[CRITERIA[i].labelKey]}</span>
                  </div>

                  {/* Dynamic comparison natural description */}
                  <div className="slider-current-text" style={{ color: pos === 9 ? 'var(--text-muted)' : isLeftDom ? 'var(--green)' : 'var(--blue)' }}>
                    {getComparisonText(i, j, pos)}
                  </div>

                  {/* Right Label */}
                  <div className="criteria-name" style={{ justifyContent: 'flex-end' }}>
                    <span className="criteria-name-right">{t[CRITERIA[j].labelKey]}</span>
                    <span className="criteria-icon-box criteria-icon-right">
                      {CRITERIA[j].icon}
                    </span>
                  </div>
                </div>

                {/* Range Input element */}
                <div className="slider-wrap">
                  <input
                    type="range"
                    className={`ahp-slider ${getSliderClass(pos)}`}
                    min="1" max="17" step="1"
                    value={pos}
                    onChange={(e) => handleSliderChange(idx, e.target.value)}
                    style={{
                      background: `linear-gradient(90deg, 
                        var(--green) 0%, 
                        var(--glass-border) ${((pos - 1) / 16 * 100)}%, 
                        var(--glass-border) ${((pos - 1) / 16 * 100)}%, 
                        var(--blue) 100%)`
                    }}
                  />
                  <div className="slider-value-display">
                    <span>← {t[CRITERIA[i].labelKey]}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Sama / Equal</span>
                    <span style={{ textAlign: 'right' }}>{t[CRITERIA[j].labelKey]} →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-green" disabled={loading}>
            {loading ? (
              <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t.ahpCalculating}</>
            ) : (
              <><CheckCircle size={14} /> {t.ahpSubmit}</>
            )}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <Info size={12} />
            {t.ahpCrInfo}
          </div>
        </div>
      </form>

      {/* ERROR PANELS */}
      {error === 'network' && (
        <div className="alert alert-error">
          <AlertTriangle size={16} style={{ flexShrink: 0, color: 'var(--red)' }} />
          <span>
            {lang === 'id' 
              ? 'Koneksi ke backend Flask terputus. Pastikan server Flask berjalan di port 5000.' 
              : 'Flask backend unreachable. Verify Flask server is active on port 5000.'}
          </span>
        </div>
      )}

      {error === 'inconsistent' && cr !== null && (
        <div className="glass-card glass-card-red alert" style={{ borderLeft: '3px solid var(--red)', marginTop: 24, display: 'block' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <AlertTriangle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.ahpErrorTitle} (CR = {cr.toFixed(3)})
            </strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t.ahpErrorTip}</p>
          
          {/* Quick template triggers in error box */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="preset-chip" 
              onClick={() => applyPreset('equal')}
              style={{ fontSize: '0.72rem', padding: '6px 12px' }}
            >
              🔄 {t.presetEqual}
            </button>
            <button 
              type="button" 
              className="preset-chip" 
              onClick={() => applyPreset('balanced_ev')}
              style={{ fontSize: '0.72rem', padding: '6px 12px' }}
            >
              🔄 {t.presetOptimal}
            </button>
          </div>
        </div>
      )}

      {cr !== null && isConsistent && weights && (
        <div className="alert alert-success">
          <CheckCircle size={16} style={{ flexShrink: 0, color: 'var(--green)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 6 }}>
              {t.ahpSuccess} (CR = {cr.toFixed(3)})
            </div>
            <div style={{ display: 'flex', gap: '16px 24px', flexWrap: 'wrap', marginTop: 10 }}>
              {CRITERIA.map(c => (
                <span key={c.key} style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: c.color }}>{c.icon}</span>
                  {t[c.labelKey]}: <strong className="numeric">{(weights[c.key] * 100).toFixed(1)}%</strong>
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
