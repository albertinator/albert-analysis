import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import StatCard from '@/components/StatCard';
import BarChart from '@/components/BarChart';
import { loadGasRecords, processGasData, formatCurrency } from '@/lib/data';

export const metadata: Metadata = { title: '110 Tudor St — Natural Gas' };

const COLOR_THERMS = 'rgba(230, 81, 0, 0.7)';
const COLOR_SUPPLY = 'rgba(239, 108, 0, 0.7)';
const COLOR_DELIVERY = 'rgba(255, 183, 77, 0.7)';
const COLOR_STAT = '#E65100';

export default function Page() {
  const records = loadGasRecords('gas_110_tudor.json');
  const d = processGasData(records);

  return (
    <main className="max-w-[1400px] mx-auto px-5 py-5 min-h-screen">
      <BackButton />
      <h1 className="text-2xl font-bold text-center text-gray-800 mt-6">
        110 Tudor St — Natural Gas Usage History
      </h1>
      <p className="text-center text-gray-500 mb-4">
        National Grid &nbsp;|&nbsp; {d.dateRange} &nbsp;|&nbsp; {d.periodCount} billing periods
      </p>

      <div className="flex flex-wrap justify-around my-5">
        <StatCard
          value={d.totalTherms.toLocaleString()}
          label="Total Therms Used"
          color={COLOR_STAT}
        />
        <StatCard
          value={d.avgTherms.toLocaleString()}
          label="Avg Therms / Period"
          color={COLOR_STAT}
        />
        <StatCard
          value={d.peakTherms.toLocaleString()}
          label="Peak Therms (Single Period)"
          color={COLOR_STAT}
        />
        <StatCard
          value={formatCurrency(d.totalCost, 0)}
          label="Total Gas Cost"
          color={COLOR_STAT}
        />
      </div>

      <BarChart
        title="Natural Gas Usage (Therms) per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Therms Used',
            data: d.thermsData,
            backgroundColor: COLOR_THERMS,
            borderColor: 'rgba(230, 81, 0, 1)',
          },
        ]}
        yLabel="Therms"
        tooltipMode="usage"
        usageUnit="therms"
      />

      <BarChart
        title="Natural Gas Cost ($) — Supply vs Delivery per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Supply',
            data: d.supplyData,
            backgroundColor: COLOR_SUPPLY,
            borderColor: 'rgba(239, 108, 0, 1)',
          },
          {
            label: 'Delivery',
            data: d.deliveryData,
            backgroundColor: COLOR_DELIVERY,
            borderColor: 'rgba(255, 183, 77, 1)',
          },
        ]}
        stacked
        yLabel="Cost ($)"
        tooltipMode="cost"
      />

      <BarChart
        title="Natural Gas Price ($/Therm) — Supply vs Delivery Rate per Billing Period"
        labels={d.labels}
        datasets={[
          {
            label: 'Supply Rate ($/Therm)',
            data: d.supplyPerTherm,
            backgroundColor: COLOR_SUPPLY,
            borderColor: 'rgba(239, 108, 0, 1)',
          },
          {
            label: 'Delivery Rate ($/Therm)',
            data: d.deliveryPerTherm,
            backgroundColor: COLOR_DELIVERY,
            borderColor: 'rgba(255, 183, 77, 1)',
          },
        ]}
        stacked
        yLabel="Price ($/Therm)"
        tooltipMode="rate"
        rateUnit="/Therm"
      />
    </main>
  );
}
