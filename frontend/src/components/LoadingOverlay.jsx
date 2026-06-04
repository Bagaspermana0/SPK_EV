import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const LoadingOverlay = ({ lang, t }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    t.loadingStep1 || 'Mempersiapkan parameter kriteria...',
    t.loadingStep2 || 'Melakukan normalisasi matriks SAW...',
    t.loadingStep3 || 'Menghitung skor preferensi kendaraan...',
    t.loadingStep4 || 'Mengurutkan rekomendasi mobil listrik...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev; // hold on the last step
      });
    }, 700);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="loading-overlay">
      <div className="loading-container glass-card cut-top-right-lg">
        {/* Glowing border effects */}
        <div className="loading-glow-bg" />

        {/* Spinner block */}
        <div className="spinner-wrapper">
          <div className="spinner-ring" />
          <div className="spinner-ring-inner" />
          <div className="spinner-core">
            <Zap size={22} className="spinner-zap-icon" />
          </div>
        </div>

        {/* Status text */}
        <h3 className="loading-title">
          {lang === 'id' ? 'Memproses Rekomendasi' : 'Processing Recommendations'}
        </h3>

        <div className="loading-steps-track">
          <div 
            className="loading-steps-progress" 
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <p className="loading-step-text numeric">
          {steps[stepIndex]}
        </p>

        {/* Micro status indicator */}
        <div className="loading-indicator-strip">
          <span className="dot-pulse" />
          <span className="loading-sub-text">
            {lang === 'id' ? 'METODE AHP & SAW AKTIF' : 'AHP & SAW METHOD ACTIVE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
