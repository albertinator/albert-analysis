'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface MileageEvent {
  date: string;
  miles: number;
  label: string;
  detail: string;
}

interface MileageLineChartProps {
  events: MileageEvent[];
  color: string;
}

function wrapText(text: string, maxLen = 60): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > maxLen) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function MileageLineChart({ events, color }: MileageLineChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = {
    datasets: [
      {
        label: 'Odometer (miles)',
        data: events.map((e) => ({ x: e.date, y: e.miles })),
        borderColor: color,
        backgroundColor: color,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 7,
        pointHoverRadius: 10,
        borderWidth: 2,
        tension: 0,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Odometer Reading at Each Auto Service Event',
        font: { size: 16 },
        padding: { bottom: 12 },
      },
      legend: { display: false },
      tooltip: {
        displayColors: false,
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            const idx = items[0].dataIndex;
            const e = events[idx];
            const d = new Date(e.date + 'T12:00:00');
            const dateStr = d.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            return `${dateStr} — ${e.label}`;
          },
          label: (ctx: TooltipItem<'line'>) => {
            return `${(ctx.parsed.y ?? 0).toLocaleString()} miles`;
          },
          afterLabel: (ctx: TooltipItem<'line'>) => {
            return wrapText(events[ctx.dataIndex].detail);
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: { month: 'MMM yyyy' },
        },
        title: { display: true, text: 'Date' },
      },
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Odometer (miles)' },
        ticks: {
          callback: (val: number | string) =>
            typeof val === 'number' ? val.toLocaleString() : val,
        },
      },
    },
  };

  if (!mounted) {
    return (
      <div
        className="bg-white rounded-lg p-5 shadow-sm my-5 flex items-center justify-center"
        style={{ height: '420px' }}
      >
        <span className="text-gray-300 text-sm">Loading chart…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm my-5" style={{ height: '420px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
