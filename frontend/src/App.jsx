import React, { useState } from 'react';
import axios from 'axios';
import AHPForm from './components/AHPForm';
import RankingTable from './components/RankingTable';
import Charts from './components/Charts';
import { Zap, BarChart2, List } from 'lucide-react';

function App() {
  const [weights, setWeights] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loadingSAW, setLoadingSAW] = useState(false);
  const [activeTab, setActiveTab] = useState('ahp');

  const handleWeightsCalculated = (w) => {
    setWeights(w);
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
      alert('Backend tidak tersedia. Pastikan Flask berjalan di port 5000.');
    } finally {
      setLoadingSAW(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* TOP NAV */}
      <header className="site-header">
        <div className="site-logo">
          <span className="logo-dot"></span>
          EV<span style={{ color: 'var(--green)' }}>Finder</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>|</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 400, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Decision Support</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="nav-pill">AHP + SAW</span>
          <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }}></span>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}>
            {totalVehicles > 0 ? `${totalVehicles} kendaraan` : 'Live'}
          </span>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-label">
          <Zap size={12} style={{ flexShrink: 0 }} />
          Sistem Pendukung Keputusan Mobil Listrik
        </div>
        <h1>Temukan Mobil <span>Listrik</span><br />Terbaik Untukmu</h1>
        <p>Bandingkan ratusan kendaraan EV secara cerdas. Atur prioritas kriteria sesuai kebutuhanmu, sistem kami menghitung rekomendasi optimal.</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">282<span>+</span></div>
            <div className="hero-stat-label">Kendaraan EV</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" style={{ color: 'var(--green)' }}>2</div>
            <div className="hero-stat-label">Metode Analisis</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">4</div>
            <div className="hero-stat-label">Kriteria Utama</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-layout">

        {/* STEP TABS */}
        <div className="step-tabs">
          <button
            className={`step-tab ${activeTab === 'ahp' ? 'active' : ''}`}
            onClick={() => setActiveTab('ahp')}
          >
            <span className="step-num">1</span>
            Bobot Prioritas (AHP)
          </button>
          <button
            className={`step-tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => {
              if (ranking) setActiveTab('results');
              else if (weights) handleCalculateSAW();
            }}
            disabled={!weights}
            style={{ opacity: !weights ? 0.45 : 1, cursor: !weights ? 'not-allowed' : 'pointer' }}
          >
            <span className="step-num">2</span>
            Rekomendasi (SAW)
          </button>
          {ranking && (
            <button
              className={`step-tab ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              <span className="step-num">3</span>
              Analisis Visual
            </button>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="two-col">

          {/* LEFT COLUMN */}
          <div>
            {activeTab === 'ahp' && (
              <AHPForm onWeightsCalculated={handleWeightsCalculated} />
            )}
            {activeTab === 'results' && (
              <RankingTable ranking={ranking} totalVehicles={totalVehicles} />
            )}
            {activeTab === 'charts' && ranking && (
              <Charts ranking={ranking} weights={weights} />
            )}
          </div>

          {/* RIGHT COLUMN — Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* HOW IT WORKS */}
            <div className="card card-accent-blue anim-fade">
              <div className="section-label" style={{ color: 'var(--blue)' }}>
                <span style={{ background: 'var(--blue)', width: 20, height: 2, display: 'inline-block' }}></span>
                Cara Kerja
              </div>
              <h3 style={{ marginBottom: 16, marginTop: 6 }}>2 Langkah Mudah</h3>
              {[
                { step: '01', title: 'Set Prioritas', desc: 'Gunakan slider untuk membandingkan seberapa penting Harga, Range, Speed, dan Baterai.' },
                { step: '02', title: 'Lihat Hasil', desc: 'SAW memproses 282 kendaraan EV dan menampilkan rekomendasi terbaik sesuai prioritasmu.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
                    fontSize: '1.4rem', color: 'var(--border-strong)',
                    flexShrink: 0, lineHeight: 1, marginTop: 2
                  }}>{s.step}</div>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text)', marginBottom: 3 }}>{s.title}</div>
                    <p style={{ fontSize: '0.82rem' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WEIGHT SUMMARY — shown after AHP */}
            {weights && (
              <div className="card card-accent-green anim-slide-up">
                <div className="section-label">Hasil Bobot AHP</div>
                <h3 style={{ marginBottom: 20, marginTop: 6 }}>Prioritas Anda</h3>
                {[
                  { key: 'price', label: 'Harga' },
                  { key: 'range', label: 'Range' },
                  { key: 'top_speed', label: 'Top Speed' },
                  { key: 'battery', label: 'Baterai' },
                ].map(c => (
                  <div className="weight-bar-row" key={c.key}>
                    <span className="weight-bar-label">{c.label}</span>
                    <div className="weight-bar-track">
                      <div className="weight-bar-fill" style={{ width: `${(weights[c.key] * 100).toFixed(1)}%` }} />
                    </div>
                    <span className="weight-bar-pct">{(weights[c.key] * 100).toFixed(0)}%</span>
                  </div>
                ))}

                {activeTab === 'ahp' && (
                  <button
                    className="btn btn-green"
                    style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
                    onClick={handleCalculateSAW}
                    disabled={loadingSAW}
                  >
                    <BarChart2 size={18} />
                    {loadingSAW ? 'Memproses...' : 'Hitung & Lihat Rekomendasi'}
                  </button>
                )}

                {ranking && activeTab === 'results' && (
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                    onClick={() => setActiveTab('charts')}
                  >
                    <List size={16} />
                    Lihat Analisis Visual
                  </button>
                )}
              </div>
            )}

            {/* CRITERIA INFO */}
            <div className="card anim-fade" style={{ padding: '20px 24px' }}>
              <div className="section-label">Kriteria</div>
              <h3 style={{ marginBottom: 16, marginTop: 6, fontSize: '0.95rem' }}>Penjelasan Faktor</h3>
              {[
                { icon: '💰', name: 'Harga (Price)', note: 'Lebih murah = nilai lebih baik' },
                { icon: '🔋', name: 'Range', note: 'Jarak tempuh sekali charge (km)' },
                { icon: '⚡', name: 'Top Speed', note: 'Kecepatan puncak (km/h)' },
                { icon: '📦', name: 'Kapasitas Baterai', note: 'Ukuran baterai dalam kWh' },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
