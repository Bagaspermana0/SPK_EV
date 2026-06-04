import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  AlertTriangle, 
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

const computeAHP = (matrix) => {
  const n = 4;
  const colSums = [0, 0, 0, 0];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  const weights = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += matrix[i][j] / colSums[j];
    }
    weights[i] = rowSum / n;
  }

  const Aw = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      Aw[i] += matrix[i][j] * weights[j];
    }
  }

  let lambdaMaxSum = 0;
  for (let i = 0; i < n; i++) {
    lambdaMaxSum += Aw[i] / weights[i];
  }
  const lambdaMax = lambdaMaxSum / n;

  const ci = (lambdaMax - n) / (n - 1);
  const ri = 0.9; // For n=4
  const cr = ci / ri;

  return {
    weights: {
      price: weights[0],
      range: weights[1],
      top_speed: weights[2],
      battery: weights[3],
    },
    cr: cr,
    isConsistent: cr <= 0.10,
  };
};

const AHPForm = ({ onWeightsCalculated, lang, t }) => {
  const [sliders, setSliders] = useState([9, 9, 9, 9, 9, 9]);
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

  const liveResult = useMemo(() => {
    return computeAHP(matrix);
  }, [matrix]);

  const applyPreset = (key) => {
    setSliders(PRESETS[key]);
    setActivePreset(key);
  };

  const handleSliderChange = (idx, val) => {
    const next = [...sliders];
    next[idx] = parseInt(val);
    setSliders(next);
    setActivePreset(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!liveResult || !liveResult.isConsistent) return;
    
    onWeightsCalculated(liveResult.weights, liveResult.cr);
    
    confetti({ 
      particleCount: 120, 
      spread: 80, 
      origin: { y: 0.55 }, 
      colors: ['#00D97E', '#3B82F6', '#06B6D4'] 
    });
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
              <li><strong>{t.ahpGuideLeft}</strong></li>
              <li><strong>{t.ahpGuideCenter}</strong></li>
              <li><strong>{t.ahpGuideRight}</strong></li>
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

      {/* LIVE LOGIC / CONSISTENCY METER */}
      <div 
        className="glass-card sticky-consistency-meter" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: 28, 
          borderLeft: `4px solid ${liveResult.isConsistent ? 'var(--green)' : 'var(--red)'}`,
          background: liveResult.isConsistent ? 'rgba(0, 217, 126, 0.02)' : 'rgba(239, 68, 68, 0.02)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: liveResult.isConsistent ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {liveResult.isConsistent ? (
              <><CheckCircle size={14} /> {lang === 'id' ? 'Logika Pilihan: Konsisten (Logis)' : 'Logic Status: Consistent'}</>
            ) : (
              <><AlertTriangle size={14} /> {lang === 'id' ? 'Logika Pilihan: Ada Kontradiksi' : 'Logic Status: Inconsistent'}</>
            )}
          </span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {lang === 'id' ? 'Tingkat Kontradiksi' : 'Contradiction Level'}: <strong style={{ color: liveResult.isConsistent ? 'var(--green)' : 'var(--red)' }}>{(liveResult.cr * 100).toFixed(1)}%</strong> ({lang === 'id' ? 'Batas' : 'Limit'}: 10.0%)
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {liveResult.isConsistent 
            ? (lang === 'id' 
                ? 'Pilihan Anda logis dan selaras secara matematis. Anda dapat melihat hasil rekomendasi.' 
                : 'Your choices are mathematically consistent. You are ready to see recommendations.')
            : (lang === 'id' 
                ? 'Terdapat kontradiksi (misal: A > B, B > C, tapi C > A). Kurangi slider yang terlalu mentok kiri/kanan agar pilihan lebih logis.' 
                : 'Your options contradict. Try reducing extreme slider values to make them logically aligned.')
          }
        </p>

        {/* Real-time Weights Preview in Consistency Meter */}
        {liveResult.isConsistent && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>
              {lang === 'id' ? 'Preview Distribusi Bobot Kriteria:' : 'Weight Distribution Preview:'}
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {CRITERIA.map(c => (
                <span key={c.key} style={{ fontSize: '0.76rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: c.color }}>{c.icon}</span>
                  {t[c.labelKey]}: <strong className="numeric">{(liveResult.weights[c.key] * 100).toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FORM OF PAIRWISE COMPARISONS */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 28 }}>
          {PAIRS.map(([i, j], idx) => {
            const pos = sliders[idx];
            const isLeftDom = pos < 9;
            const isRightDom = pos > 9;
            
            return (
              <div 
                className={`comparison-row ${isLeftDom ? 'criteria-active-left' : isRightDom ? 'criteria-active-right' : ''}`} 
                key={idx}
              >
                <div className="comparison-header">
                  {/* Left Label */}
                  <div className="criteria-name criteria-left">
                    <span className="criteria-icon-box criteria-icon-left">
                      {CRITERIA[i].icon}
                    </span>
                    <span className="criteria-name-left">{t[CRITERIA[i].labelKey]}</span>
                  </div>

                  {/* Right Label */}
                  <div className="criteria-name criteria-right">
                    <span className="criteria-name-right">{t[CRITERIA[j].labelKey]}</span>
                    <span className="criteria-icon-box criteria-icon-right">
                      {CRITERIA[j].icon}
                    </span>
                  </div>
                </div>

                {/* Dynamic comparison natural description */}
                <div className="comparison-desc" style={{ color: pos === 9 ? 'var(--text-muted)' : isLeftDom ? 'var(--green)' : 'var(--blue)' }}>
                  {getComparisonText(i, j, pos)}
                </div>

                {/* Range Input element */}
                <div className="slider-wrap">
                  <div className="slider-controls-row">
                    <button 
                      type="button" 
                      className="slider-step-btn" 
                      onClick={() => handleSliderChange(idx, Math.max(1, pos - 1))}
                    >
                      &larr;
                    </button>
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
                    <button 
                      type="button" 
                      className="slider-step-btn" 
                      onClick={() => handleSliderChange(idx, Math.min(17, pos + 1))}
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button 
            type="submit" 
            className={`btn ${liveResult.isConsistent ? 'btn-green' : 'btn-outline'}`}
            disabled={!liveResult.isConsistent}
            style={{ 
              opacity: liveResult.isConsistent ? 1 : 0.4,
              cursor: liveResult.isConsistent ? 'pointer' : 'not-allowed'
            }}
          >
            <CheckCircle size={14} /> {t.ahpSubmit}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <Info size={12} />
            {t.ahpCrInfo}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AHPForm;
