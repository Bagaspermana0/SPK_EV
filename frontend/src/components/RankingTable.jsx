import React, { useState, useCallback } from 'react';
import { Search, X, ExternalLink } from 'lucide-react';

// ─── Car image helper ────────────────────────────────────────────────────────
// Maps known car brands to Unsplash search terms for better image relevance
const getBrandSearchTerm = (name) => {
  const n = name.toLowerCase();
  if (n.includes('tesla')) return 'tesla electric car';
  if (n.includes('byd')) return 'byd electric car china';
  if (n.includes('nio')) return 'nio electric car';
  if (n.includes('rivian')) return 'rivian electric truck';
  if (n.includes('lucid')) return 'lucid air electric sedan';
  if (n.includes('porsche')) return 'porsche taycan electric';
  if (n.includes('audi')) return 'audi e-tron electric';
  if (n.includes('bmw')) return 'bmw i4 electric car';
  if (n.includes('mercedes') || n.includes('eqe') || n.includes('eqs')) return 'mercedes electric car';
  if (n.includes('volkswagen') || n.includes('vw') || n.includes('id.')) return 'volkswagen id4 electric';
  if (n.includes('hyundai') || n.includes('ioniq')) return 'hyundai ioniq electric';
  if (n.includes('kia') || n.includes('ev6') || n.includes('ev9')) return 'kia ev6 electric';
  if (n.includes('ford') || n.includes('mustang') || n.includes('f-150')) return 'ford mustang mach e electric';
  if (n.includes('chevrolet') || n.includes('chevy') || n.includes('bolt')) return 'chevrolet bolt electric';
  if (n.includes('polestar')) return 'polestar electric car';
  if (n.includes('volvo')) return 'volvo electric car';
  if (n.includes('renault')) return 'renault zoe electric';
  if (n.includes('nissan') || n.includes('leaf') || n.includes('ariya')) return 'nissan ariya electric';
  if (n.includes('xpeng') || n.includes('xiaopeng')) return 'xpeng electric car';
  if (n.includes('li ') || n.includes('lixiang')) return 'li auto electric car china';
  if (n.includes('geely') || n.includes('zeekr')) return 'zeekr electric car';
  return 'electric vehicle car modern';
};

// Use Unsplash source for car images (no API key needed)
const getCarImageUrl = (name, size = '800x450') => {
  const term = encodeURIComponent(getBrandSearchTerm(name));
  return `https://source.unsplash.com/${size}/?${term}&sig=${encodeURIComponent(name)}`;
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

// ─── Car Detail Modal ────────────────────────────────────────────────────────
const CarModal = ({ car, onClose }) => {
  if (!car) return null;
  const imgUrl = getCarImageUrl(car.name, '1200x500');
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
                Peringkat #{car.rank} dari {/* total */} semua kendaraan
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
            <span className="spec-label">⚡ Top Speed</span>
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
const RankingTable = ({ ranking, totalVehicles }) => {
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
      <div style={{ marginBottom: 20 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Langkah 2 — Hasil SAW</div>
        <h2 style={{ marginBottom: 4 }}>Top 10 Rekomendasi</h2>
        <p>
          Diproses dari <strong>{totalVehicles}</strong> kendaraan EV. Klik kartu untuk melihat spesifikasi lengkap.
        </p>
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
        <CarModal car={selectedCar} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default RankingTable;
