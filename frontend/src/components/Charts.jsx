import React, { useRef, useEffect } from 'react';
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
};

const Charts = ({ ranking, weights, lang, t }) => {
  if (!ranking || ranking.length === 0 || !weights) return null;

  const top10 = ranking.slice(0, 10);

  // ── Bar Chart data ──
  const scores = top10.map(c => parseFloat((c.score * 100).toFixed(2)));
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;

  const barData = {
    labels: top10.map(c => {
      const parts = c.name.split(' ');
      return parts.length > 2 ? parts.slice(0, 2).join(' ') + '…' : c.name;
    }),
    datasets: [{
      label: t.chartTitle1,
      data: scores,
      backgroundColor: scores.map((_, i) =>
        i === 0 ? COLORS.gold :
        i === 1 ? COLORS.silver :
        i === 2 ? COLORS.bronze :
        COLORS.green
      ),
      borderRadius: 0,
      borderSkipped: false,
    }],
  };

  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const pad = (maxScore - minScore) * 0.15 || 1;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B1628',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        titleFont: { family: 'Arial', size: 11, weight: 'bold' },
        bodyFont: { family: 'monospace', size: 11 },
        callbacks: {
          label: (ctx) => ` Score: ${ctx.parsed.y.toFixed(2)}%`,
        },
      },
      // Use annotation-style average line via afterDraw registered plugin
      averageLinePlugin: {
        avg,
        label: t.chartAvgLine || 'Avg',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Arial', size: 9, weight: 'bold' },
          maxRotation: 30,
        },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        min: Math.max(0, minScore - pad),
        max: maxScore + pad,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'monospace', size: 9 },
          callback: (v) => `${v.toFixed(1)}%`,
        },
        border: { display: false },
      },
    },
  };

  // Inline plugin — works reliably when passed directly to <Bar />
  const avgLinePlugin = {
    id: 'avgLine',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      const avgVal = chart.options.plugins.averageLinePlugin?.avg;
      const label  = chart.options.plugins.averageLinePlugin?.label || 'Avg';
      if (avgVal == null) return;
      const yPos = y.getPixelForValue(avgVal);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(0, 217, 126, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#00D97E';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${label}: ${avgVal.toFixed(2)}%`, left + 8, yPos - 7);
      ctx.restore();
    },
  };

  // ── Radar chart ──
  const radarData = {
    labels: [t.price, t.range, t.topSpeed, t.battery],
    datasets: [{
      label: t.chartPriority || 'Priority',
      data: [
        weights.price * 100,
        weights.range * 100,
        weights.top_speed * 100,
        weights.battery * 100,
      ],
      backgroundColor: 'rgba(0,217,126,0.08)',
      borderColor: COLORS.green,
      pointBackgroundColor: COLORS.green,
      pointBorderColor: '#fff',
      pointRadius: 4,
      borderWidth: 1.5,
      fill: true,
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B1628',
        titleFont: { family: 'Arial', size: 11, weight: 'bold' },
        bodyFont: { family: 'monospace', size: 11 },
        callbacks: { label: (ctx) => ` ${ctx.parsed.r.toFixed(1)}%` },
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        grid:       { color: 'rgba(255,255,255,0.06)' },
        pointLabels: {
          color: '#94A3B8',
          font: { family: 'Arial', size: 10, weight: 'bold' },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#475569',
          font: { family: 'monospace', size: 8 },
          callback: (v) => `${v}%`,
          stepSize: 25,
        },
        min: 0,
        max: 100,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="anim-fade-up-1">
      <div className="section-label" style={{ marginBottom: 6 }}>
        Langkah 3 — Analisis
      </div>
      <h2 style={{ marginBottom: 28 }}>Visualisasi Data</h2>

      <div className="chart-card-wrapper">

        {/* Bar Chart */}
        <div className="glass-card glass-card-green cut-top-right" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <BarChart3 size={15} style={{ color: 'var(--green)' }} />
            <h3 style={{ fontSize: '0.85rem', marginBottom: 0 }}>{t.chartTitle1}</h3>
          </div>
          <div style={{ height: 320, position: 'relative' }}>
            <Bar
              data={barData}
              options={barOptions}
              plugins={[avgLinePlugin]}
            />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-card glass-card-blue cut-top-right" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Target size={15} style={{ color: 'var(--blue)' }} />
            <h3 style={{ fontSize: '0.85rem', marginBottom: 0 }}>{t.chartTitle2}</h3>
          </div>
          <div style={{ height: 320, position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Charts;
