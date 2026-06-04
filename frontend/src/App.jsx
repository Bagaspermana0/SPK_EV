import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { translations } from './translations';
import AHPForm from './components/AHPForm';
import RankingTable from './components/RankingTable';
import Charts from './components/Charts';
import { Zap, BarChart2, List, Lock, CircleDollarSign, Battery, Cpu } from 'lucide-react';

function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('evfinder_lang') || 'id';
  });
  const [weights, setWeights] = useState(null);
  const [cr, setCr] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loadingSAW, setLoadingSAW] = useState(false);
  const [activeTab, setActiveTab] = useState('ahp');

  const t = translations[lang];

  useEffect(() => {
    const fetchVehiclesCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles');
        if (response.data && Array.isArray(response.data)) {
          setTotalVehicles(response.data.length);
        }
      } catch {
        setTotalVehicles(281);
      }
    };
    fetchVehiclesCount();
  }, []);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('evfinder_lang', newLang);
  };

  const handleWeightsCalculated = (w, calculatedCr) => {
    setWeights(w);
    setCr(calculatedCr);
    setRanking(null);
    setActiveTab('ahp');
  };

  const handleCalculateSAW = async () => {
    if (!weights) return;
    setLoadingSAW(true);
    try {
      const response = await axios.post('http://localhost:5000/api/saw/rank', { weights });
      if (response.data.success) {
        setRanking(response.data.top_10);
        setTotalVehicles(response.data.total_vehicles);
        setActiveTab('results');
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'id'
        ? 'Koneksi ke backend Flask terputus. Pastikan Flask berjalan di port 5000.'
        : 'Flask backend unreachable. Verify Flask is running on port 5000.');
    } finally {
      setLoadingSAW(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header className="site-header">
        <div className="site-logo">
          <span className="logo-dot"></span>
          EV<span>Finder</span>
          <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 8px' }}>|</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            {t.navTitle}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Language Toggle */}
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'id' ? 'active' : ''}`} onClick={() => handleLanguageChange('id')} aria-label="Bahasa Indonesia">ID</button>
            <span className="lang-sep">|</span>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')} aria-label="English">EN</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }}></span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'monospace' }}>
              {totalVehicles > 0 ? `${totalVehicles} EV` : 'Live'}
            </span>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <div className="hero anim-fade-up-1">
        <div className="hero-label">
          <Zap size={10} />
          {t.heroLabel}
        </div>
        <h1>
          {lang === 'id'
            ? <><span style={{ color: 'var(--green)' }}>TEMUKAN</span> MOBIL LISTRIK<br />TERBAIK UNTUKMU</>
            : <><span style={{ color: 'var(--green)' }}>FIND</span> YOUR BEST<br />ELECTRIC VEHICLE</>
          }
        </h1>
        <p>{t.heroDesc}</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num numeric">{totalVehicles || 281}<span>+</span></div>
            <div className="hero-stat-label">{t.heroStat1}</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num numeric" style={{ color: 'var(--green)' }}>2</div>
            <div className="hero-stat-label">{t.heroStat2}</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num numeric">4</div>
            <div className="hero-stat-label">{t.heroStat3}</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="main-layout anim-fade-up-2">

        {/* Step Tabs with progress bar */}
        <div className="step-tab-wrapper">
          <div className="tab-progress-bg">
            <div className="tab-progress-fill" style={{ width: ranking ? '100%' : weights ? '50%' : '16%' }} />
          </div>
          <div className="step-tabs">
            <button className={`step-tab ${activeTab === 'ahp' ? 'active' : ''}`} onClick={() => setActiveTab('ahp')}>
              <span className="step-num">1</span>
              {t.tab1}
            </button>
            <button
              className={`step-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => { if (ranking) setActiveTab('results'); else if (weights) handleCalculateSAW(); }}
              disabled={!weights}
              title={!weights ? t.tabLocked : ''}
            >
              <span className="step-num">2</span>
              {t.tab2}
              {!weights && <Lock size={12} className="tab-lock-icon" />}
            </button>
            <button
              className={`step-tab ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => { if (ranking) setActiveTab('charts'); }}
              disabled={!ranking}
              title={!ranking ? t.tabLocked : ''}
            >
              <span className="step-num">3</span>
              {t.tab3}
              {!ranking && <Lock size={12} className="tab-lock-icon" />}
            </button>
          </div>
        </div>

        {/* ── AHP TAB — two-column: form left, info sidebar right ── */}
        {activeTab === 'ahp' && (
          <div className="two-col">
            {/* Left: Form */}
            <div className="tab-content">
              <AHPForm onWeightsCalculated={handleWeightsCalculated} lang={lang} t={t} />

              {/* CTA Button — shown BELOW the form once weights are ready */}
              {weights && (
                <div style={{ marginTop: 32 }}>
                  <div className="divider" />

                  {/* Weight summary compact strip */}
                  <div className="glass-card glass-card-green" style={{ marginBottom: 20, padding: '20px 24px' }}>
                    <div className="section-label" style={{ marginBottom: 14 }}>
                      <span style={{ background: 'var(--green)', width: 16, height: 2, display: 'inline-block' }}></span>
                      {t.sidebarWeightTitle}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                      {[
                        { key: 'price',     label: t.price,    icon: <CircleDollarSign size={13} style={{ color: 'var(--amber)' }} /> },
                        { key: 'range',     label: t.range,    icon: <Battery size={13} style={{ color: 'var(--green)' }} /> },
                        { key: 'top_speed', label: t.topSpeed, icon: <Zap size={13} style={{ color: 'var(--blue)' }} /> },
                        { key: 'battery',   label: t.battery,  icon: <Cpu size={13} style={{ color: 'var(--teal)' }} /> },
                      ].map(c => (
                        <div key={c.key} className="weight-bar-row" style={{ margin: 0 }}>
                          <div className="weight-bar-info">
                            <span className="weight-bar-label">{c.icon}{c.label}</span>
                            <span className="weight-bar-pct numeric">{(weights[c.key] * 100).toFixed(0)}%</span>
                          </div>
                          <div className="weight-bar-track">
                            <div className="weight-bar-fill" style={{ width: `${(weights[c.key] * 100).toFixed(1)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="sidebar-summary-total" style={{ marginTop: 12 }}>Total: 100% ✓</div>
                  </div>

                  <button
                    className="btn btn-green"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '16px 32px' }}
                    onClick={handleCalculateSAW}
                    disabled={loadingSAW}
                  >
                    <BarChart2 size={18} />
                    {loadingSAW ? t.ahpCalculating : t.sidebarCTA}
                  </button>
                </div>
              )}
            </div>

            {/* Right: How it works + Criteria info (only on AHP tab) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card cut-top-right glass-card-blue">
                <div className="section-label" style={{ color: 'var(--blue)', marginBottom: 12 }}>
                  <span style={{ background: 'var(--blue)', width: 16, height: 2, display: 'inline-block' }}></span>
                  {t.howStep}
                </div>
                <h3 style={{ marginBottom: 20, fontSize: '0.92rem' }}>{t.howTitle}</h3>
                {[
                  { num: '01', title: t.step1Title, desc: t.step1Desc },
                  { num: '02', title: t.step2Title, desc: t.step2Desc },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i === 0 ? 18 : 0 }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.25rem', color: 'rgba(255,255,255,0.12)', lineHeight: 1, marginTop: 2 }}>{s.num}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 4 }}>{s.title}</div>
                      <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card cut-top-right">
                <div className="section-label" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                  <span style={{ background: 'var(--text-muted)', width: 16, height: 2, display: 'inline-block' }}></span>
                  {t.criteriaExplanation}
                </div>
                <h3 style={{ marginBottom: 20, fontSize: '0.92rem' }}>Faktor Kriteria</h3>
                {[
                  { icon: <CircleDollarSign size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />, name: t.price, note: t.priceNote },
                  { icon: <Battery size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />, name: t.range, note: t.rangeNote },
                  { icon: <Zap size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />, name: t.topSpeed, note: t.speedNote },
                  { icon: <Cpu size={16} style={{ color: 'var(--teal)', flexShrink: 0 }} />, name: t.battery, note: t.batteryNote },
                ].map(c => (
                  <div key={c.name} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ marginTop: 2 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{c.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS TAB — full width ── */}
        {activeTab === 'results' && (
          <div className="tab-content">
            <RankingTable
              ranking={ranking}
              totalVehicles={totalVehicles}
              weights={weights}
              cr={cr}
              lang={lang}
              t={t}
            />
            {ranking && (
              <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setActiveTab('ahp')}>
                  ← {t.tab1}
                </button>
                <button className="btn btn-green" onClick={() => setActiveTab('charts')}>
                  <List size={14} />
                  {t.sidebarVisual}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CHARTS TAB — full width ── */}
        {activeTab === 'charts' && ranking && (
          <div className="tab-content">
            <Charts ranking={ranking} weights={weights} lang={lang} t={t} />
            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setActiveTab('results')}>
                ← {t.tab2}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
