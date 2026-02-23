import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import StatCard from '@/components/StatCard';
import BarChart from '@/components/BarChart';
import { loadElectricRecords, processElectricData, formatCurrency } from '@/lib/data';

export const metadata: Metadata = { title: '110 Tudor St — Electricity' };

const COLOR_PRIMARY = 'rgba(33, 150, 243, 0.7)';
const COLOR_SUPPLY = 'rgba(76, 175, 80, 0.7)';
const COLOR_DELIVERY = 'rgba(255, 152, 0, 0.7)';
const COLOR_STAT = '#2196F3';

export default function Page() {
  const records = loadElectricRecords('electric_110_tudor.json');
  const d = processElectricData(records);

  return (
    <main className="max-w-[1400px] mx-auto px-5 py-5 min-h-screen">
      <BackButton />
      <h1 className="text-2xl font-bold text-center text-gray-800 mt-6">
        110 Tudor St — Electricity Usage History
      </h1>
      <p className="text-center text-gray-500 mb-4">
        NStar / Eversource &nbsp;|&nbsp; {d.dateRange} &nbsp;|&nbsp; {d.periodCount} billing
        periods
      </p>

      <div className="flex flex-wrap justify-around my-5">
        <StatCard value={d.totalKwh.toLocaleString()} label="Total kWh Used" color={COLOR_STAT} />
        <StatCard value={d.avgKwh.toLocaleString()} label="Avg kWh / Period" color={COLOR_STAT} />
        <StatCard
          value={d.peakKwh.toLocaleString()}
          label="Peak kWh (Single Period)"
          color={COLOR_STAT}
        />
        <StatCard
          value={formatCurrency(d.totalCost, 0)}
          label="Total Electricity Cost"
          color={COLOR_STAT}
        />
      </div>

      <BarChart
        title="Electricity Usage (kWh) per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'kWh Usage',
            data: d.kwhData,
            backgroundColor: COLOR_PRIMARY,
            borderColor: 'rgba(33, 150, 243, 1)',
          },
        ]}
        yLabel="kWh"
        tooltipMode="usage"
        usageUnit="kWh"
      />

      <BarChart
        title="Electricity Cost ($) — Supply vs Delivery per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Supply (Generation)',
            data: d.supplyData,
            backgroundColor: COLOR_SUPPLY,
            borderColor: 'rgba(76, 175, 80, 1)',
          },
          {
            label: 'Delivery',
            data: d.deliveryData,
            backgroundColor: COLOR_DELIVERY,
            borderColor: 'rgba(255, 152, 0, 1)',
          },
        ]}
        stacked
        yLabel="Cost ($)"
        tooltipMode="cost"
      />

      <BarChart
        title="Electricity Price ($/kWh) — Supply vs Delivery Rate per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Supply Rate ($/kWh)',
            data: d.supplyPerKwh,
            backgroundColor: COLOR_SUPPLY,
            borderColor: 'rgba(76, 175, 80, 1)',
          },
          {
            label: 'Delivery Rate ($/kWh)',
            data: d.deliveryPerKwh,
            backgroundColor: COLOR_DELIVERY,
            borderColor: 'rgba(255, 152, 0, 1)',
          },
        ]}
        stacked
        yLabel="Price ($/kWh)"
        tooltipMode="rate"
        rateUnit="/kWh"
      />
    </main>
  );
}
