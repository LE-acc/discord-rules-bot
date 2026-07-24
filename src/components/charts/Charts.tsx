'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

const gridColor = 'rgba(128,128,128,0.12)';

const baseOptions: ChartOptions<'line' | 'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(13,20,32,0.95)',
      padding: 10,
      cornerRadius: 12,
      titleFont: { weight: 'bold' },
      displayColors: false,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8a94a6', font: { size: 11 } } },
    y: {
      grid: { color: gridColor },
      ticks: { color: '#8a94a6', font: { size: 11 } },
      beginAtZero: true,
    },
  },
};

export function LineChart({
  labels,
  data,
  color = '#16c26b',
  fill = true,
  height = 220,
}: {
  labels: string[];
  data: (number | null)[];
  color?: string;
  fill?: boolean;
  height?: number;
}) {
  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        data: data as number[],
        borderColor: color,
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return `${color}22`;
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, `${color}55`);
          g.addColorStop(1, `${color}00`);
          return g;
        },
        borderWidth: 3,
        tension: 0.4,
        fill,
        pointRadius: 3,
        pointBackgroundColor: color,
        pointHoverRadius: 6,
        spanGaps: true,
      },
    ],
  };
  return (
    <div style={{ height }}>
      <Line data={chartData} options={baseOptions as ChartOptions<'line'>} />
    </div>
  );
}

export function BarChart({
  labels,
  data,
  color = '#a855f7',
  goal,
  height = 220,
}: {
  labels: string[];
  data: number[];
  color?: string;
  goal?: number;
  height?: number;
}) {
  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: data.map((v) => (goal && v >= goal ? '#16c26b' : color)),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 30,
      },
    ],
  };
  return (
    <div style={{ height }}>
      <Bar data={chartData} options={baseOptions as ChartOptions<'bar'>} />
    </div>
  );
}
