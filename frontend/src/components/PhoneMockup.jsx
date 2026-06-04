import React from 'react';
import { Zap, ShieldCheck, Award, BatteryCharging, DollarSign } from 'lucide-react';

const PhoneMockup = () => {
  return (
    <div className="phone-mockup-container">
      {/* Floating Card Left: AHP Consistency */}
      <div className="floating-card float-left-card">
        <div className="float-card-icon-box green-glow">
          <Zap size={16} className="text-green" />
        </div>
        <div className="float-card-body">
          <span className="float-card-tag">KONSISTENSI AHP</span>
          <span className="float-card-val numeric text-green">9.4% OK</span>
        </div>
      </div>

      {/* Floating Card Right: Top Recommendation */}
      <div className="floating-card float-right-card">
        <div className="float-card-icon-box blue-glow">
          <Award size={16} className="text-blue" />
        </div>
        <div className="float-card-body">
          <span className="float-card-tag">REKOMENDASI TOP</span>
          <span className="float-card-val numeric text-blue">IONIQ 5</span>
        </div>
      </div>

      {/* The Phone Body */}
      <div className="phone-mockup-wrapper">
        {/* Notch */}
        <div className="phone-notch">
          <div className="speaker-bar" />
          <div className="camera-lens" />
        </div>

        {/* Screen */}
        <div className="phone-screen">
          {/* Status bar */}
          <div className="phone-status-bar">
            <span className="numeric">09:41</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Zap size={10} className="text-green" />
              <span className="numeric">88%</span>
            </div>
          </div>

          {/* Mini App Content */}
          <div className="phone-app-content">
            {/* Header */}
            <div className="phone-app-header">
              <span className="logo-dot"></span>
              EV<span>Finder</span>
            </div>

            {/* Slider Showcase */}
            <div className="phone-section-card">
              <div className="phone-card-title">Kriteria Prioritas</div>
              
              <div className="mini-slider-row">
                <div className="mini-slider-label">
                  <span><DollarSign size={10} style={{ color: 'var(--amber)' }} /> Harga</span>
                  <span className="numeric text-amber">65%</span>
                </div>
                <div className="mini-slider-track">
                  <div className="mini-slider-bar bg-amber" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="mini-slider-row">
                <div className="mini-slider-label">
                  <span><BatteryCharging size={10} style={{ color: 'var(--green)' }} /> Jarak</span>
                  <span className="numeric text-green">85%</span>
                </div>
                <div className="mini-slider-track">
                  <div className="mini-slider-bar bg-green" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            {/* Live Ranking Showcase */}
            <div className="phone-section-card">
              <div className="phone-card-title">Hasil Rekomendasi (SAW)</div>
              
              <div className="mini-rank-list">
                <div className="mini-rank-item active-rank">
                  <div className="mini-rank-info">
                    <span className="mini-rank-num">1</span>
                    <span className="mini-rank-name">Hyundai Ioniq 5</span>
                  </div>
                  <span className="numeric text-green">94.2%</span>
                </div>

                <div className="mini-rank-item">
                  <div className="mini-rank-info">
                    <span className="mini-rank-num">2</span>
                    <span className="mini-rank-name">Wuling Air EV</span>
                  </div>
                  <span className="numeric text-secondary">88.7%</span>
                </div>

                <div className="mini-rank-item">
                  <div className="mini-rank-info">
                    <span className="mini-rank-num">3</span>
                    <span className="mini-rank-name">Tesla Model Y</span>
                  </div>
                  <span className="numeric text-secondary">85.1%</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button type="button" className="phone-app-btn">
              Hitung Ulang &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
