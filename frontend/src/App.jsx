import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { translations } from './translations';
import AHPForm from './components/AHPForm';
import RankingTable from './components/RankingTable';
import Charts from './components/Charts';
import { Zap, BarChart2, List, Lock, CircleDollarSign, Battery, Cpu, HelpCircle } from 'lucide-react';

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

  // Fetch initial total vehicles count dynamically from API on mount
  useEffect(() => {
    const fetchVehiclesCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles');
        if (response.data && Array.isArray(response.data)) {
          setTotalVehicles(response.data.length);
        }
      } catch (err) {
        console.error('Failed to load initial vehicles count:', err);
        // Fallback to the known dataset count
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
      alert(lang === 'id' ? 'Koneksi ke backend Flask terputus. Pastikan Flask berjalan di port 5000.' : 'Connection to backend Flask lost. Verify Flask is running on port 5000.');
    } finally {
      setLoadingSAW(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* TOP HEADER */}
      <header className="site-header">
        <div className="site-logo">
          <span className="logo-dot"></span>
          EV<span>Finder</span>
          <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 8px' }}>|</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
            {t.navTitle}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Language Toggle UI */}
          <div className="lang-toggle">
            <button 
              className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('id')}
              aria-label="Bahasa Indonesia"
            >
              ID
            </button>
            <span className="lang-sep">|</span>
            <button 
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
              aria-label="English"
            >
              EN
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }}></span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'monospace' }}>
              {totalVehicles > 0 ? `${totalVehicles} EV` : 'Live'}
            </span>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="hero anim-fade-up-1">
        <div className="hero-label">
          <Zap size={10} style={{ color: 'var(--green)' }} />
          {t.heroLabel}
        </div>
        <h1>
          {lang === 'id' ? (
            <>TEMUKAN MOBIL <span style={{ textShadow: '0 0 20px var(--green-glow)' }}>LISTRIK</span><br />TERBAIK UNTUKMU</>
          ) : (
            <>FIND YOUR BEST <span style={{ textShadow: '0 0 20px var(--green-glow)' }}>ELECTRIC</span><br />VEHICLE</>
          )}
        </h1>
        <p>{t.heroDesc}</p>
        
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num numeric">
              {totalVehicles}<span>+</span>
            </div>
            <div className="hero-stat-label">{t.heroStat1}</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num numeric" style={{ color: 'var(--green)' }}>
              2
            </div>
            <div className="hero-stat-label">{t.heroStat2}</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num numeric">
              4
            </div>
            <div className="hero-stat-label">{t.heroStat3}</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <main className="main-layout anim-fade-up-2">
        
        {/* STEP TABS with progress bar */}
        <div className="step-tab-wrapper">
          <div className="tab-progress-bg">
            <div 
              className="tab-progress-fill" 
              style={{ width: ranking ? '100%' : weights ? '50%' : '16%' }}
            />
          </div>
          <div className="step-tabs">
            <button
              className={`step-tab ${activeTab === 'ahp' ? 'active' : ''}`}
              onClick={() => setActiveTab('ahp')}
            >
              <span className="step-num">1</span>
              {t.tab1}
            </button>
            
            <button
              className={`step-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => {
                if (ranking) setActiveTab('results');
                else if (weights) handleCalculateSAW();
              }}
              disabled={!weights}
              title={!weights ? t.tabLocked : ''}
            >
              <span className="step-num">2</span>
              {t.tab2}
              {!weights && <Lock size={12} className="tab-lock-icon" />}
            </button>
            
            <button
              className={`step-tab ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => {
                if (ranking) setActiveTab('charts');
              }}
              disabled={!ranking}
              title={!ranking ? t.tabLocked : ''}
            >
              <span className="step-num">3</span>
              {t.tab3}
              {!ranking && <Lock size={12} className="tab-lock-icon" />}
            </button>
          </div>
        </div>

        {/* TWO-COLUMN CONTENT LAYOUT */}
        <div className="two-col">

          {/* LEFT PANEL */}
          <div className="tab-content">
            {activeTab === 'ahp' && (
              <AHPForm 
                onWeightsCalculated={handleWeightsCalculated} 
                lang={lang} 
                t={t} 
              />
            )}
            {activeTab === 'results' && (
              <RankingTable 
                ranking={ranking} 
                totalVehicles={totalVehicles} 
                weights={weights} 
                cr={cr} 
                lang={lang} 
                t={t} 
              />
            )}
            {activeTab === 'charts' && ranking && (
              <Charts 
                ranking={ranking} 
                weights={weights} 
                lang={lang} 
                t={t} 
              />
            )}
          </div>

          {/* RIGHT PANEL - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* HOW IT WORKS */}
            <div className="glass-card cut-top-right glass-card-blue">
              <div className="section-label" style={{ color: 'var(--blue)' }}>
                <span style={{ background: 'var(--blue)', width: 16, height: 2, display: 'inline-block' }}></span>
                {t.howStep}
              </div>
              <h3 style={{ marginBottom: 20, marginTop: 8, fontSize: '0.92rem' }}>{t.howTitle}</h3>
              
              <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{
                  fontFamily: 'monospace', fontWeight: 700,
                  fontSize: '1.25rem', color: 'rgba(255,255,255,0.15)',
                  lineHeight: 1, marginTop: 2
                }}>01</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {t.step1Title}
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)' }}>{t.step1Desc}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  fontFamily: 'monospace', fontWeight: 700,
                  fontSize: '1.25rem', color: 'rgba(255,255,255,0.15)',
                  lineHeight: 1, marginTop: 2
                }}>02</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {t.step2Title}
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)' }}>{t.step2Desc}</p>
                </div>
              </div>
            </div>

            {/* WEIGHT SUMMARY SIDEBAR */}
            {weights && (
              <div className="glass-card cut-top-right glass-card-green">
                <div className="section-label">
                  <span style={{ background: 'var(--green)', width: 16, height: 2, display: 'inline-block' }}></span>
                  {t.sidebarWeightTitle}
                </div>
                <h3 style={{ marginBottom: 20, marginTop: 8, fontSize: '0.92rem' }}>{t.sidebarWeightSubtitle}</h3>
                
                {[
                  { key: 'price', label: t.price, icon: <CircleDollarSign size={13} style={{ color: 'var(--amber)' }} /> },
                  { key: 'range', label: t.range, icon: <Battery size={13} style={{ color: 'var(--green)' }} /> },
                  { key: 'top_speed', label: t.topSpeed, icon: <Zap size={13} style={{ color: 'var(--blue)' }} /> },
                  { key: 'battery', label: t.battery, icon: <Cpu size={13} style={{ color: 'var(--teal)' }} /> },
                ].map(c => (
                  <div className="weight-bar-row" key={c.key}>
                    <div className="weight-bar-info">
                      <span className="weight-bar-label">
                        {c.icon}
                        {c.label}
                      </span>
                      <span className="weight-bar-pct numeric">{(weights[c.key] * 100).toFixed(0)}%</span>
                    </div>
                    <div className="weight-bar-track">
                      <div className="weight-bar-fill" style={{ width: `${(weights[c.key] * 100).toFixed(1)}%` }} />
                    </div>
                  </div>
                ))}

                <div className="sidebar-summary-total">
                  Total: 100% ✓
                </div>

                {activeTab === 'ahp' && (
                  <button
                    className="btn btn-green btn-blue"
                    style={{ width: '100%', marginTop: 24 }}
                    onClick={handleCalculateSAW}
                    disabled={loadingSAW}
                  >
                    <BarChart2 size={15} />
                    {loadingSAW ? t.ahpCalculating : t.sidebarCTA}
                  </button>
                )}

                {ranking && activeTab === 'results' && (
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: 20 }}
                    onClick={() => setActiveTab('charts')}
                  >
                    <List size={14} />
                    {t.sidebarVisual}
                  </button>
                )}
              </div>
            )}

            {/* CRITERIA INFORMATION LIST */}
            <div className="glass-card cut-top-right">
              <div className="section-label" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ background: 'var(--text-secondary)', width: 16, height: 2, display: 'inline-block' }}></span>
                {t.criteriaExplanation}
              </div>
              <h3 style={{ marginBottom: 20, marginTop: 8, fontSize: '0.92rem' }}>Faktor Kriteria</h3>
              
              {[
                { icon: <CircleDollarSign size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />, name: t.price, note: t.priceNote },
                { icon: <Battery size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />, name: t.range, note: t.rangeNote },
                { icon: <Zap size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />, name: t.topSpeed, note: t.speedNote },
                { icon: <Cpu size={16} style={{ color: 'var(--teal)', flexShrink: 0 }} />, name: t.battery, note: t.batteryNote },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ marginTop: 2 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
