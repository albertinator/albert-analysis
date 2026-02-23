'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth?: number;
}

interface BarChartProps {
  title: string;
  labels: string[];
  datasets: BarChartDataset[];
  stacked?: boolean;
  yLabel?: string;
  /** Controls tooltip formatting */
  tooltipMode: 'usage' | 'cost' | 'rate';
  /** Unit label for usage mode (e.g. "kWh", "therms", "CF") */
  usageUnit?: string;
  /** Unit suffix for rate mode total (e.g. "/kWh", "/Therm", "/CF") */
  rateUnit?: string;
  /** Show gallons conversion (for water usage) */
  showGallons?: boolean;
}

export default function BarChart({
  title,
  labels,
  datasets,
  stacked = false,
  yLabel,
  tooltipMode,
  usageUnit,
  rateUnit,
  showGallons,
}: BarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 16 },
        padding: { bottom: 12 },
      },
      legend: {
        display: datasets.length > 1,
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            if (tooltipMode === 'usage') {
              const val = ctx.parsed.y ?? 0;
              if (showGallons) {
                return `${val.toLocaleString()} CF (${Math.round(val * 7.481).toLocaleString()} gallons)`;
              }
              return `${val.toLocaleString()} ${usageUnit ?? ''}`;
            }
            if (tooltipMode === 'cost') {
              return `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(2)}`;
            }
            if (tooltipMode === 'rate') {
              return `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(4)}`;
            }
            return String(ctx.parsed.y ?? 0);
          },
          afterBody:
            tooltipMode === 'rate'
              ? (tooltipItems: TooltipItem<'bar'>[]) => {
                  if (tooltipItems.length === 0) return '';
                  const idx = tooltipItems[0].dataIndex;
                  const total = datasets.reduce(
                    (sum, ds) => sum + (ds.data[idx] ?? 0),
                    0
                  );
                  return `Total: $${total.toFixed(4)}${rateUnit ?? ''}`;
                }
              : undefined,
        },
      },
    },
    scales: {
      x: {
        stacked,
        ticks: {
          maxRotation: 90,
          autoSkip: true,
          maxTicksLimit: 40,
        },
      },
      y: {
        stacked,
        beginAtZero: true,
        title: {
          display: !!yLabel,
          text: yLabel ?? '',
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      borderWidth: ds.borderWidth ?? 1,
    })),
  };

  if (!mounted) {
    return (
      <div
        className="bg-white rounded-lg p-5 shadow-sm my-5 flex items-center justify-center"
        style={{ height: '400px' }}
      >
        <span className="text-gray-300 text-sm">Loading chart…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm my-5" style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
