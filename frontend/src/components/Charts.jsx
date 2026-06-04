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
  green:  '#00D97E',
  blue:   '#3B82F6',
  teal:   '#06B6D4',
};

const Charts = ({ ranking, weights, lang, t }) => {
  if (!ranking || ranking.length === 0 || !weights) return null;

  const top10 = ranking.slice(0, 10);

  // ── Bar Chart ──
  const barData = {
    labels: top10.map(c => {
      const parts = c.name.split(' ');
      return parts.length > 2 ? parts.slice(0, 2).join(' ') + '…' : c.name;
    }),
    datasets: [{
      label: t.chartTitle1,
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
        backgroundColor: '#0B1628',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        titleFont: { family: 'Arial', size: 11, weight: 'bold' },
        bodyFont: { family: 'monospace', size: 11 },
        callbacks: { label: (ctx) => ` ${ctx.parsed.y.toFixed(2)}%` }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Arial', size: 9, weight: 'bold' },
          maxRotation: 30,
        },
        border: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: {
          color: '#94A3B8',
          font: { family: 'monospace', size: 9 },
          callback: (v) => `${v}%`
        },
        border: { display: false },
        // Y-axis max removed for dynamic auto-scaling
      }
    }
  };

  // ── Horizontal Average line plugin ──
  const averageLinePlugin = {
    id: 'averageLine',
    afterDraw: (chart) => {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      const dataset = chart.data.datasets[0];
      if (!dataset) return;
      const data = dataset.data;
      const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
      
      const yPos = y.getPixelForValue(avg);
      
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 219, 126, 0.25)'; // Light glow green dashed line
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.closePath();
      
      // Dynamic translated label
      ctx.fillStyle = '#00D97E';
      ctx.font = "bold 9px monospace";
      ctx.fillText(`${t.chartAvgLine}: ${avg.toFixed(2)}%`, left + 8, yPos - 6);
      ctx.restore();
    }
  };

  // ── Radar Chart ──
  const radarData = {
    labels: [t.price, t.range, t.topSpeed, t.battery],
    datasets: [{
      label: t.chartPriority,
      data: [
        weights.price * 100,
        weights.range * 100,
        weights.top_speed * 100,
        weights.battery * 100,
      ],
      backgroundColor: 'rgba(0, 217, 126, 0.08)',
      borderColor: COLORS.green,
      pointBackgroundColor: COLORS.green,
      pointBorderColor: '#fff',
      pointRadius: 4,
      borderWidth: 1.5,
      fill: true,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B1628',
        titleFont: { family: 'Arial', size: 11, weight: 'bold' },
        bodyFont: { family: 'monospace', size: 11 },
        callbacks: { label: (ctx) => ` ${ctx.parsed.r.toFixed(1)}%` }
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        pointLabels: {
          color: '#94A3B8',
          font: { family: 'Arial', size: 10, weight: 'bold' }
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#475569',
          font: { family: 'monospace', size: 8 },
          callback: (v) => `${v}%`
        },
        min: 0,
        max: 100,
      }
    }
  };

  return (
    <div className="tab-content anim-fade-up-1">
      <div className="section-label" style={{ marginBottom: 6 }}>Langkah 3 — Analisis</div>
      <h2 style={{ marginBottom: 20 }}>Visualisasi Data</h2>

      <div className="chart-card-wrapper">

        {/* Bar Chart */}
        <div className="glass-card glass-card-green cut-top-right" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <BarChart3 size={15} style={{ color: 'var(--green)' }} />
            <h3 style={{ fontSize: '0.85rem', marginBottom: 0 }}>{t.chartTitle1}</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={barData} options={barOptions} plugins={[averageLinePlugin]} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-card glass-card-blue cut-top-right" style={{ height: 350, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Target size={15} style={{ color: 'var(--blue)' }} />
            <h3 style={{ fontSize: '0.85rem', marginBottom: 0 }}>{t.chartTitle2}</h3>
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
