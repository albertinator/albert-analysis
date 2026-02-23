import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import StatCard from '@/components/StatCard';
import BarChart from '@/components/BarChart';
import { loadWaterRecords, processWaterData, formatCurrency } from '@/lib/data';

export const metadata: Metadata = { title: '110 Tudor St — Water & Sewer' };

const COLOR_CF = 'rgba(21, 101, 192, 0.7)';
const COLOR_WATER = 'rgba(33, 150, 243, 0.7)';
const COLOR_SEWER = 'rgba(100, 181, 246, 0.7)';
const COLOR_STAT = '#1565C0';

export default function Page() {
  const records = loadWaterRecords('water_110_tudor.json');
  const d = processWaterData(records);

  return (
    <main className="max-w-[1400px] mx-auto px-5 py-5 min-h-screen">
      <BackButton />
      <h1 className="text-2xl font-bold text-center text-gray-800 mt-6">
        110 Tudor St — Water & Sewer Usage History
      </h1>
      <p className="text-center text-gray-500 mb-4">
        Boston Water &amp; Sewer Commission &nbsp;|&nbsp; {d.dateRange} &nbsp;|&nbsp;{' '}
        {d.periodCount} billing periods
      </p>

      <div className="flex flex-wrap justify-around my-5">
        <StatCard
          value={d.totalCf.toLocaleString()}
          label="Total Cubic Feet Used"
          color={COLOR_STAT}
        />
        <StatCard value={d.avgCf.toLocaleString()} label="Avg CF / Period" color={COLOR_STAT} />
        <StatCard
          value={d.peakCf.toLocaleString()}
          label="Peak CF (Single Period)"
          color={COLOR_STAT}
        />
        <StatCard
          value={formatCurrency(d.totalCost, 0)}
          label="Total Water + Sewer Cost"
          color={COLOR_STAT}
        />
      </div>

      <BarChart
        title="Water Consumption (Cubic Feet) per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Cubic Feet Used',
            data: d.cfData,
            backgroundColor: COLOR_CF,
            borderColor: 'rgba(21, 101, 192, 1)',
          },
        ]}
        yLabel="Cubic Feet (1 CF = 7.481 gallons)"
        tooltipMode="usage"
        usageUnit="CF"
        showGallons
      />

      <BarChart
        title="Water Cost ($) — Water vs Sewer per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Water',
            data: d.waterData,
            backgroundColor: COLOR_WATER,
            borderColor: 'rgba(33, 150, 243, 1)',
          },
          {
            label: 'Sewer',
            data: d.sewerData,
            backgroundColor: COLOR_SEWER,
            borderColor: 'rgba(100, 181, 246, 1)',
          },
        ]}
        stacked
        yLabel="Cost ($)"
        tooltipMode="cost"
      />

      <BarChart
        title="Water Price ($/CF) — Water vs Sewer Rate per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Water Rate ($/CF)',
            data: d.waterPerCf,
            backgroundColor: COLOR_WATER,
            borderColor: 'rgba(33, 150, 243, 1)',
          },
          {
            label: 'Sewer Rate ($/CF)',
            data: d.sewerPerCf,
            backgroundColor: COLOR_SEWER,
            borderColor: 'rgba(100, 181, 246, 1)',
          },
        ]}
        stacked
        yLabel="Price ($/CF)"
        tooltipMode="rate"
        rateUnit="/CF"
      />
    </main>
  );
}
