import React from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import { BarChart3, Target } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Filler, Title, Tooltip, Legend
);

const COLORS = {
  gold:   '#F59E0B',
  silver: '#94A3B8',
  bronze: '#CD7C2B',
  green:  '#00C46A',
  blue:   '#0066FF',
  teal:   '#00C8D4',
};

const Charts = ({ ranking, weights }) => {
  if (!ranking || ranking.length === 0 || !weights) return null;

  const top10 = ranking.slice(0, 10);

  // ── Bar Chart ──
  const barData = {
    labels: top10.map(c => {
      const parts = c.name.split(' ');
      return parts.length > 2 ? parts.slice(0, 2).join(' ') + '…' : c.name;
    }),
    datasets: [{
      label: 'Skor SAW (%)',
      data: top10.map(c => parseFloat((c.score * 100).toFixed(2))),
      backgroundColor: top10.map((_, i) =>
        i === 0 ? COLORS.gold :
        i === 1 ? COLORS.silver :
        i === 2 ? COLORS.bronze :
        COLORS.green
      ),
      borderRadius: 0,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0A1628',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        callbacks: { label: (ctx) => ` ${ctx.parsed.y.toFixed(2)}%` }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#6B7FA3',
          font: { family: 'Barlow Condensed, sans-serif', size: 10, weight: '700' },
          maxRotation: 30,
        },
        border: { color: '#DDE3ED' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: {
          color: '#6B7FA3',
          font: { family: 'Barlow Condensed, sans-serif', size: 10, weight: '700' },
          callback: (v) => `${v}%`
        },
        border: { display: false },
        min: 0,
        max: 100
      }
    }
  };

  // ── Radar Chart ──
  const radarData = {
    labels: ['Harga', 'Range', 'Top Speed', 'Baterai'],
    datasets: [{
      label: 'Bobot Prioritas',
      data: [
        weights.price * 100,
        weights.range * 100,
        weights.top_speed * 100,
        weights.battery * 100,
      ],
      backgroundColor: 'rgba(0, 196, 106, 0.15)',
      borderColor: COLORS.green,
      pointBackgroundColor: COLORS.green,
      pointBorderColor: '#fff',
      pointRadius: 5,
      borderWidth: 2.5,
      fill: true,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0A1628',
        callbacks: { label: (ctx) => ` ${ctx.parsed.r.toFixed(1)}%` }
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(0,0,0,0.1)' },
        grid: { color: 'rgba(0,0,0,0.08)' },
        pointLabels: {
          color: '#3D5278',
          font: { family: 'Barlow Condensed, sans-serif', size: 12, weight: '700' }
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#6B7FA3',
          font: { family: 'Barlow Condensed, sans-serif', size: 9 },
          callback: (v) => `${v}%`
        },
        min: 0,
        max: 100,
      }
    }
  };

  return (
    <div className="anim-fade">
      <div className="section-label" style={{ marginBottom: 6 }}>Langkah 3 — Analisis</div>
      <h2 style={{ marginBottom: 20 }}>Visualisasi Data</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

        {/* Bar Chart */}
        <div className="card card-accent-green" style={{ height: 360, display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} style={{ color: 'var(--green)' }} />
            <h3 style={{ fontSize: '0.85rem', marginBottom: 0 }}>Komparasi Skor Top 10</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card card-accent-blue" style={{ height: 360, display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Target size={16} style={{ color: 'var(--blue)' }} />
            <h3 style={{ fontSize: '0.85rem', marginBottom: 0 }}>Distribusi Bobot Kriteria</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Charts;
