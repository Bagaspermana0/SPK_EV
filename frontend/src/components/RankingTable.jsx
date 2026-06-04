import React, { useState, useCallback } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';

// ─── Car image helper ────────────────────────────────────────────────────────
// Handpicked, high-quality stable Unsplash direct CDN images for key EV brands
const BRAND_IMAGES = {
  tesla: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  byd: 'https://images.unsplash.com/photo-1718816434407-7ce85f26ea13?auto=format&fit=crop&w=800&q=80',
  bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
  hyundai: 'https://images.unsplash.com/photo-1669864432115-bbf07a1027ad?auto=format&fit=crop&w=800&q=80',
  ioniq: 'https://images.unsplash.com/photo-1669864432115-bbf07a1027ad?auto=format&fit=crop&w=800&q=80',
  kia: 'https://images.unsplash.com/photo-1652495393080-60b64be167d3?auto=format&fit=crop&w=800&q=80',
  nissan: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
  porsche: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
  audi: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
  mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
  eqe: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
  eqs: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
  volkswagen: 'https://images.unsplash.com/photo-1621993202323-f438e4068ff7?auto=format&fit=crop&w=800&q=80',
  vw: 'https://images.unsplash.com/photo-1621993202323-f438e4068ff7?auto=format&fit=crop&w=800&q=80',
  ford: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
  volvo: 'https://images.unsplash.com/photo-1667083078426-36a51d2f9547?auto=format&fit=crop&w=800&q=80',
  polestar: 'https://images.unsplash.com/photo-1667083078426-36a51d2f9547?auto=format&fit=crop&w=800&q=80',
  generic: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
};

const getCarImageUrl = (name) => {
  const n = name.toLowerCase();
  for (const brand in BRAND_IMAGES) {
    if (n.includes(brand)) {
      return BRAND_IMAGES[brand];
    }
  }
  return BRAND_IMAGES.generic;
};

// ─── Rank badge styles ────────────────────────────────────────────────────────
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return 'rank-other';
};

const getRankLabel = (rank) => {
  if (rank === 1) return '🥇 #1 Terbaik';
  if (rank === 2) return '🥈 #2';
  if (rank === 3) return '🥉 #3';
  return `#${rank}`;
};

// ─── Export Utilities ────────────────────────────────────────────────────────
const exportToCSV = (ranking) => {
  const headers = ['Peringkat', 'Nama Kendaraan', 'Harga (EUR)', 'Range (km)', 'Top Speed (km/h)', 'Kapasitas Baterai (kWh)', 'Skor SAW (%)'];
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

const exportToPDF = (ranking, weights, cr) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Izinkan pop-up untuk mencetak laporan PDF.');
    return;
  }
  
  const weightsInfo = weights ? `
    <div class="weights-box">
      <strong>Parameter Analisis AHP:</strong><br/>
      <div style="margin-top: 8px;">
        <span class="weight-item">💰 Bobot Harga: <strong>${(weights.price * 100).toFixed(1)}%</strong></span>
        <span class="weight-item">🔋 Bobot Jarak Tempuh (Range): <strong>${(weights.range * 100).toFixed(1)}%</strong></span>
        <span class="weight-item">⚡ Bobot Kecepatan (Top Speed): <strong>${(weights.top_speed * 100).toFixed(1)}%</strong></span>
        <span class="weight-item">📦 Bobot Kapasitas Baterai: <strong>${(weights.battery * 100).toFixed(1)}%</strong></span>
      </div>
      <div style="margin-top: 6px; font-size: 0.82rem; color: #475569;">
        Consistency Ratio (CR) Matriks AHP: <strong>${cr !== null && cr !== undefined ? cr.toFixed(4) : 'N/A'}</strong> (Konsisten)
      </div>
    </div>
  ` : '';

  printWindow.document.write(`
    <html>
      <head>
        <title>Laporan Hasil Rekomendasi SPK EV</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
          .header-title { font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; color: #0f172a; margin-bottom: 2px; font-size: 2.2rem; letter-spacing: 0.02em; }
          .subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px 14px; text-align: left; font-size: 0.88rem; }
          th { background-color: #f8fafc; font-weight: 700; color: #334155; text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.05em; }
          tr:nth-child(even) { background-color: #fcfdfe; }
          .badge { background-color: #e6fcf5; color: #00a85a; border: 1px solid #c2f9e1; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; letter-spacing: 0.02em; }
          .weights-box { background-color: #f1f5f9; padding: 18px; border-radius: 0px; border-left: 4px solid #0066FF; margin-bottom: 25px; font-size: 0.9rem; }
          .weight-item { margin-right: 25px; display: inline-block; }
          .footer-note { font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px dashed #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px;">
          <div>
            <div class="header-title">Laporan Hasil Rekomendasi EV</div>
            <div class="subtitle">Sistem Pendukung Keputusan Pemilihan Mobil Listrik</div>
          </div>
          <div style="text-align: right; font-size: 0.8rem; color: #64748b;">
            Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        
        ${weightsInfo}

        <h3 style="margin-top: 30px; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; font-size: 1.2rem; letter-spacing: 0.04em;">Top 10 Rekomendasi Teratas (Metode SAW)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Peringkat</th>
              <th>Nama Kendaraan EV</th>
              <th>Harga</th>
              <th>Jarak Tempuh</th>
              <th>Kecepatan Maks</th>
              <th>Kapasitas Baterai</th>
              <th style="text-align: right;">Skor Kecocokan (SAW)</th>
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
          Laporan ini digenerate secara otomatis oleh EVFinder Decision Support System menggunakan integrasi Metode AHP & SAW.
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
const CarModal = ({ car, totalVehicles, onClose }) => {
  if (!car) return null;
  const imgUrl = getCarImageUrl(car.name);
  const score = (car.score * 100).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className="modal-close" onClick={onClose} title="Tutup">
          <X size={18} />
        </button>

        {/* Hero Image */}
        <div className="modal-header-img">
          <img
            src={imgUrl}
            alt={car.name}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="modal-header-overlay">
            <div className="modal-rank-row">
              <span
                className={`modal-rank-label ${getRankClass(car.rank)}`}
                style={{ fontSize: '0.7rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, letterSpacing: '0.12em' }}
              >
                {getRankLabel(car.rank)}
              </span>
            </div>
            <div className="modal-car-name">{car.name}</div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Specs Grid */}
          <div style={{ marginBottom: 8 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Spesifikasi Lengkap</div>
          </div>
          <div className="modal-specs-grid">
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--gold)' }}>
              <div className="modal-spec-label">💰 Harga</div>
              <div className="modal-spec-value">
                €{car.price.toLocaleString('de-DE')}
              </div>
            </div>
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--green)' }}>
              <div className="modal-spec-label">🔋 Range</div>
              <div className="modal-spec-value">
                {car.range}<span className="modal-spec-unit">km</span>
              </div>
            </div>
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--blue)' }}>
              <div className="modal-spec-label">⚡ Top Speed</div>
              <div className="modal-spec-value">
                {car.top_speed}<span className="modal-spec-unit">km/h</span>
              </div>
            </div>
            <div className="modal-spec-box" style={{ borderLeftColor: 'var(--teal)' }}>
              <div className="modal-spec-label">📦 Kapasitas Baterai</div>
              <div className="modal-spec-value">
                {car.battery}<span className="modal-spec-unit">kWh</span>
              </div>
            </div>
          </div>

          {/* SAW Score bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}>Skor SAW</span>
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '0.8rem', fontWeight: 800,
                color: 'var(--green)'
              }}>{score}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-3)', position: 'relative' }}>
              <div style={{
                height: '100%',
                width: `${score}%`,
                background: 'linear-gradient(90deg, var(--green), var(--teal))',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>

          {/* Score block */}
          <div className="modal-score-section">
            <div>
              <div className="modal-score-label">Skor Kecocokan SAW</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Peringkat #{car.rank} dari {totalVehicles} semua kendaraan
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
const CarCard = ({ car, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getCarImageUrl(car.name);
  const score = (car.score * 100).toFixed(1);

  return (
    <div className="car-card anim-slide-up" onClick={() => onClick(car)} title="Klik untuk detail spesifikasi">
      {/* Image */}
      <div className="car-card-image">
        {!imgError ? (
          <img
            src={imgUrl}
            alt={car.name}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #0A1628 0%, #1A3A6A 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8
          }}>
            <div style={{ fontSize: '2rem' }}>⚡</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)'
            }}>{car.name}</div>
          </div>
        )}

        {/* Rank badge */}
        <div className={`car-rank-badge ${getRankClass(car.rank)}`}>
          {car.rank === 1 ? '🥇' : car.rank === 2 ? '🥈' : car.rank === 3 ? '🥉' : `#${car.rank}`}
          {car.rank <= 3 ? ' TERBAIK' : ''}
        </div>

        {/* Score badge */}
        <div className="car-score-badge">{score}%</div>
      </div>

      {/* Body */}
      <div className="car-card-body">
        <div className="car-name">{car.name}</div>

        {/* Score bar */}
        <div className="car-score-bar">
          <div className="car-score-bar-fill" style={{ width: `${score}%` }} />
        </div>

        {/* Mini specs */}
        <div className="car-specs-mini">
          <div className="car-spec-mini">
            <span className="spec-label">💰 Harga</span>
            <span className="spec-value">€{Math.round(car.price / 1000)}k</span>
          </div>
          <div className="car-spec-mini">
            <span className="spec-label">🔋 Range</span>
            <span className="spec-value">{car.range} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>km</span></span>
          </div>
          <div className="car-spec-mini">
            <span className="spec-label">⚡ Speed</span>
            <span className="spec-value">{car.top_speed} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>km/h</span></span>
          </div>
          <div className="car-spec-mini">
            <span className="spec-label">📦 Baterai</span>
            <span className="spec-value">{car.battery} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kWh</span></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="car-card-footer">
        <span>Klik untuk detail</span>
        <ExternalLink size={12} />
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const RankingTable = ({ ranking, totalVehicles, weights, cr }) => {
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);

  const filtered = (ranking || []).filter(car =>
    car.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = useCallback((car) => setSelectedCar(car), []);
  const handleCloseModal = useCallback(() => setSelectedCar(null), []);

  if (!ranking || ranking.length === 0) return null;

  return (
    <div className="anim-fade">
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 6 }}>Langkah 2 — Hasil SAW</div>
          <h2 style={{ marginBottom: 4 }}>Top 10 Rekomendasi</h2>
          <p style={{ margin: 0 }}>
            Diproses dari <strong>{totalVehicles}</strong> kendaraan EV. Klik kartu untuk melihat spesifikasi lengkap.
          </p>
        </div>
        
        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            onClick={() => exportToCSV(ranking)} 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '0.75rem', height: 'auto' }}
          >
            📥 Ekspor CSV
          </button>
          <button 
            onClick={() => exportToPDF(ranking, weights, cr)} 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '0.75rem', height: 'auto' }}
          >
            📄 Cetak Laporan (PDF)
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-box" style={{ marginBottom: 20, maxWidth: 380 }}>
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Cari nama mobil listrik..."
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

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="cars-grid">
          {filtered.map((car) => (
            <CarCard key={car.rank} car={car} onClick={handleOpenModal} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Tidak ada hasil untuk "<em>{search}</em>"
        </div>
      )}

      {/* Modal */}
      {selectedCar && (
        <CarModal car={selectedCar} totalVehicles={totalVehicles} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default RankingTable;
