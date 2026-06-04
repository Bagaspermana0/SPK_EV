import React, { useState, useCallback } from 'react';
import { 
  Search, 
  X, 
  ExternalLink, 
  CircleDollarSign, 
  Battery, 
  Zap, 
  Cpu, 
  Download, 
  Printer,
  Award
} from 'lucide-react';

// ─── Hash-Based Gradient Generator ───────────────────────────────────────────
// Generates unique, rich CSS linear-gradients based on the car's name hash
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const getGradientBg = (name) => {
  const hash = hashCode(name);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 60) % 360;
  // Dynamic rich deep tones suitable for glassmorphism panels
  return `linear-gradient(135deg, hsl(${h1}, 45%, 11%) 0%, hsl(${h2}, 50%, 18%) 100%)`;
};

const getBrandInitial = (name) => {
  const firstWord = name.split(' ')[0] || 'EV';
  return firstWord.substring(0, 2).toUpperCase();
};

// ─── Rank badge styles ────────────────────────────────────────────────────────
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1-badge';
  if (rank === 2) return 'rank-2-badge';
  if (rank === 3) return 'rank-3-badge';
  return 'rank-other-badge';
};

const getRankLabel = (rank, lang) => {
  if (rank === 1) return lang === 'id' ? '#1 Terbaik' : '#1 Best';
  if (rank === 2) return '#2';
  if (rank === 3) return '#3';
  return `#${rank}`;
};

// ─── Export Utilities ────────────────────────────────────────────────────────
const exportToCSV = (ranking, t) => {
  const headers = [
    t.tabLocked ? 'Rank' : 'Peringkat', 
    t.tabLocked ? 'EV Name' : 'Nama Kendaraan', 
    t.price, 
    t.range, 
    t.topSpeed, 
    t.battery, 
    'SAW Score (%)'
  ];
  
  const rows = (ranking || []).map(c => [
    `#${c.rank}`,
    c.name,
    c.price,
    c.range,
    c.top_speed,
    c.battery,
    (c.score * 100).toFixed(2)
  ]);
  
  const csvRows = [
    headers.join(','),
    ...rows.map(r => r.map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(','))
  ];
  
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Hasil_Rekomendasi_SPK_EV.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = (ranking, weights, cr, lang, t) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert(lang === 'id' ? 'Pop-up terblokir. Izinkan pop-up untuk mencetak PDF.' : 'Pop-up blocked. Enable pop-ups to print PDF.');
    return;
  }
  
  const weightsInfo = weights ? `
    <div class="weights-box">
      <strong>${lang === 'id' ? 'Parameter Analisis AHP:' : 'AHP Analysis Parameters:'}</strong><br/>
      <div style="margin-top: 8px;">
        <span class="weight-item">💰 ${t.price}: <strong>${(weights.price * 100).toFixed(1)}%</strong></span>
        <span class="weight-item">🔋 ${t.range}: <strong>${(weights.range * 100).toFixed(1)}%</strong></span>
        <span class="weight-item">⚡ ${t.topSpeed}: <strong>${(weights.top_speed * 100).toFixed(1)}%</strong></span>
        <span class="weight-item">📦 ${t.battery}: <strong>${(weights.battery * 100).toFixed(1)}%</strong></span>
      </div>
      <div style="margin-top: 8px; font-size: 0.82rem; color: #475569;">
        Consistency Ratio (CR): <strong>${cr !== null && cr !== undefined ? cr.toFixed(4) : 'N/A'}</strong>
      </div>
    </div>
  ` : '';

  printWindow.document.write(`
    <html>
      <head>
        <title>${t.sawTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
          .header-title { font-weight: 700; text-transform: uppercase; color: #0f172a; margin-bottom: 2px; font-size: 2rem; letter-spacing: 0.02em; }
          .subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px 14px; text-align: left; font-size: 0.88rem; }
          th { background-color: #f8fafc; font-weight: 700; color: #334155; text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.05em; }
          tr:nth-child(even) { background-color: #fcfdfe; }
          .badge { background-color: #e6fcf5; color: #00a85a; border: 1px solid #c2f9e1; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 0.95rem; }
          .weights-box { background-color: #f1f5f9; padding: 18px; border-left: 4px solid #3B82F6; margin-bottom: 25px; font-size: 0.9rem; }
          .weight-item { margin-right: 25px; display: inline-block; }
          .footer-note { font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px dashed #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px;">
          <div>
            <div class="header-title">${t.heroTitle}</div>
            <div class="subtitle">${t.heroLabel}</div>
          </div>
          <div style="text-align: right; font-size: 0.8rem; color: #64748b;">
            ${lang === 'id' ? 'Tanggal Cetak' : 'Date Printed'}: ${new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        
        ${weightsInfo}

        <h3 style="margin-top: 30px; text-transform: uppercase; font-size: 1.15rem; letter-spacing: 0.04em;">Top 10 Rekomendasi Teratas (SAW)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">${lang === 'id' ? 'Rank' : 'Rank'}</th>
              <th>${lang === 'id' ? 'Nama Mobil Listrik' : 'EV Name'}</th>
              <th>${t.price}</th>
              <th>${t.range}</th>
              <th>${t.topSpeed}</th>
              <th>${t.battery}</th>
              <th style="text-align: right;">${lang === 'id' ? 'Skor SAW' : 'SAW Score'}</th>
            </tr>
          </thead>
          <tbody>
            ${ranking.map(c => `
              <tr>
                <td><strong>#${c.rank}</strong></td>
                <td style="font-weight: 600; color: #0f172a;">${c.name}</td>
                <td>€${c.price.toLocaleString('de-DE')}</td>
                <td>${c.range} km</td>
                <td>${c.top_speed} km/h</td>
                <td>${c.battery} kWh</td>
                <td style="text-align: right;"><span class="badge">${(c.score * 100).toFixed(2)}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer-note">
          ${lang === 'id' 
            ? 'Laporan ini digenerate secara otomatis oleh EVFinder DSS menggunakan integrasi Metode AHP & SAW.' 
            : 'This report is auto-generated by EVFinder DSS using integrated AHP & SAW Methods.'}
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── Car Detail Modal ────────────────────────────────────────────────────────
const CarModal = ({ car, totalVehicles, lang, t, onClose }) => {
  if (!car) return null;
  const gradient = getGradientBg(car.name);
  const monogram = getBrandInitial(car.name);
  const score = (car.score * 100).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className="modal-close" onClick={onClose} title="Tutup">
          <X size={15} />
        </button>

        {/* Dynamic Abstract Gradient Hero */}
        <div className="modal-header-img modal-header-gradient" style={{ background: gradient }}>
          <div className="modal-header-overlay" />
          
          <div style={{ position: 'absolute', right: 28, bottom: -10, fontSize: '6.5rem', fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255, 255, 255, 0.04)', userSelect: 'none', pointerEvents: 'none', zIndex: 1 }}>
            {monogram}
          </div>

          <div className="modal-header-content">
            <div className="modal-rank-row">
              <span className={`modal-rank-label ${getRankClass(car.rank)}`}>
                {getRankLabel(car.rank, lang)}
              </span>
            </div>
            <div className="modal-car-name">{car.name}</div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Specs Grid */}
          <div style={{ marginBottom: 12 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>
              <Award size={12} />
              {t.modalSpecs}
            </div>
          </div>
          <div className="modal-specs-grid">
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--amber)' }}>
              <div className="modal-spec-label">
                <CircleDollarSign size={13} style={{ color: 'var(--amber)' }} />
                {t.modalSpecPrice}
              </div>
              <div className="modal-spec-value numeric">
                €{car.price.toLocaleString('de-DE')}
              </div>
            </div>
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--green)' }}>
              <div className="modal-spec-label">
                <Battery size={13} style={{ color: 'var(--green)' }} />
                {t.modalSpecRange}
              </div>
              <div className="modal-spec-value numeric">
                {car.range}<span className="modal-spec-unit">km</span>
              </div>
            </div>
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--blue)' }}>
              <div className="modal-spec-label">
                <Zap size={13} style={{ color: 'var(--blue)' }} />
                {t.modalSpecSpeed}
              </div>
              <div className="modal-spec-value numeric">
                {car.top_speed}<span className="modal-spec-unit">km/h</span>
              </div>
            </div>
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--teal)' }}>
              <div className="modal-spec-label">
                <Cpu size={13} style={{ color: 'var(--teal)' }} />
                {t.modalSpecBattery}
              </div>
              <div className="modal-spec-value numeric">
                {car.battery}<span className="modal-spec-unit">kWh</span>
              </div>
            </div>
          </div>

          {/* SAW Score Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="section-label">{t.modalScore}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green)', fontFamily: 'monospace' }}>
                {score}%
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-overlay)', position: 'relative' }}>
              <div style={{
                height: '100%',
                width: `${score}%`,
                background: 'var(--green)',
                boxShadow: '0 0 6px var(--green-glow)',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>

          {/* Score status block */}
          <div className="modal-score-section">
            <div>
              <div className="modal-score-label">{t.modalScore}</div>
              <div className="modal-score-sub numeric">
                Peringkat #{car.rank} {t.modalRankOf.replace('{total}', totalVehicles)}
              </div>
            </div>
            <div className="modal-score-value">{score}%</div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Car Card ────────────────────────────────────────────────────────────────
const CarCard = ({ car, lang, t, onClick }) => {
  const gradient = getGradientBg(car.name);
  const monogram = getBrandInitial(car.name);
  const score = (car.score * 100).toFixed(1);

  return (
    <div className="car-card glass-card" onClick={() => onClick(car)} title={t.sawClickDetail}>
      {/* Monogram Gradient Box */}
      <div className="car-card-image-wrap">
        <div className="car-card-gradient-bg" style={{ background: gradient }}>
          <div style={{ fontSize: '4.8rem', fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255, 255, 255, 0.035)', userSelect: 'none', pointerEvents: 'none' }}>
            {monogram}
          </div>
          <div className="car-card-gradient-overlay" />
        </div>

        {/* Rank Badge */}
        <div className={`car-rank-badge ${getRankClass(car.rank)}`}>
          {getRankLabel(car.rank, lang)}
        </div>

        {/* Score Badge */}
        <div className="car-score-badge">{score}%</div>
      </div>

      {/* Card Body */}
      <div className="car-card-body">
        <div className="car-name">{car.name}</div>

        {/* Mini progress bar */}
        <div className="car-score-bar">
          <div className="car-score-bar-fill" style={{ width: `${score}%` }} />
        </div>

        {/* Mini criteria spec boxes */}
        <div className="car-specs-mini">
          <div className="car-spec-mini">
            <span className="spec-mini-label">
              <CircleDollarSign size={10} style={{ color: 'var(--amber)' }} />
              {t.price}
            </span>
            <span className="spec-mini-value numeric">€{Math.round(car.price / 1000)}k</span>
          </div>
          <div className="car-spec-mini">
            <span className="spec-mini-label">
              <Battery size={10} style={{ color: 'var(--green)' }} />
              {t.range}
            </span>
            <span className="spec-mini-value numeric">{car.range} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>km</span></span>
          </div>
          <div className="car-spec-mini">
            <span className="spec-mini-label">
              <Zap size={10} style={{ color: 'var(--blue)' }} />
              Speed
            </span>
            <span className="spec-mini-value numeric">{car.top_speed} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>km/h</span></span>
          </div>
          <div className="car-spec-mini">
            <span className="spec-mini-label">
              <Cpu size={10} style={{ color: 'var(--teal)' }} />
              Bat.
            </span>
            <span className="spec-mini-value numeric">{car.battery} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>kWh</span></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="car-card-footer">
        <span>{t.sawClickDetail}</span>
        <ExternalLink size={11} />
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const RankingTable = ({ ranking, totalVehicles, weights, cr, lang, t }) => {
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);

  const filtered = (ranking || []).filter(car =>
    car.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = useCallback((car) => setSelectedCar(car), []);
  const handleCloseModal = useCallback(() => setSelectedCar(null), []);

  if (!ranking || ranking.length === 0) return null;

  return (
    <div className="tab-content anim-fade-up-1">
      {/* Header Container */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 6 }}>Langkah 2 — Hasil SAW</div>
          <h2 style={{ marginBottom: 6 }}>{t.sawTitle}</h2>
          <p style={{ margin: 0 }}>
            {t.sawDesc.replace('{total}', totalVehicles)}
          </p>
        </div>
        
        {/* Monotoned PDF / CSV export buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            onClick={() => exportToCSV(ranking, t)} 
            className="btn btn-outline" 
            style={{ padding: '8px 14px', fontSize: '0.72rem', height: 'auto' }}
          >
            <Download size={13} />
            {t.sawExportCsv}
          </button>
          <button 
            onClick={() => exportToPDF(ranking, weights, cr, lang, t)} 
            className="btn btn-outline" 
            style={{ padding: '8px 14px', fontSize: '0.72rem', height: 'auto' }}
          >
            <Printer size={13} />
            {t.sawExportPdf}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-box" style={{ marginBottom: 24, maxWidth: 380 }}>
        <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder={t.sawSearch}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Leaders Grid */}
      {filtered.length > 0 ? (
        <div className="cars-grid">
          {filtered.map((car) => (
            <CarCard 
              key={car.rank} 
              car={car} 
              lang={lang}
              t={t}
              onClick={handleOpenModal} 
            />
          ))}
        </div>
      ) : (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {t.sawNoResults} "<em>{search}</em>"
        </div>
      )}

      {/* Spec details Modal */}
      {selectedCar && (
        <CarModal 
          car={selectedCar} 
          totalVehicles={totalVehicles} 
          lang={lang}
          t={t}
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default RankingTable;
