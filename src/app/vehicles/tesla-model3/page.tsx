import type { Metadata } from 'next';
import BackButton from '@/components/BackButton';
import StatCard from '@/components/StatCard';
import ServiceTable from '@/components/ServiceTable';
import MileageLineChart from '@/components/MileageLineChart';
import { loadVehicleData, processVehicleData, formatCurrency, formatBillingLabel } from '@/lib/data';

export const metadata: Metadata = { title: '2023 Tesla Model 3 LR — Mileage & Service' };

export default function Page() {
  const vehicle = loadVehicleData('vehicle_tesla_model3.json');
  const summary = processVehicleData(vehicle);
  const { color } = vehicle;

  const chartEvents = vehicle.events.map((e) => ({
    date: e.date,
    miles: e.miles,
    label: e.label,
    detail: e.detail,
  }));

  const tableRows = vehicle.events
    .filter((e) => !e.is_purchase)
    .map((e) => ({
      date: e.date,
      miles: e.miles,
      provider: e.provider ?? '',
      service: e.service ?? '',
      cost: e.cost,
    }));

  const latestLabel = formatBillingLabel(vehicle.events[vehicle.events.length - 1].date);

  return (
    <main className="max-w-[1400px] mx-auto px-5 py-5 min-h-screen">
      <BackButton />
      <h1 className="text-2xl font-bold text-center text-gray-800 mt-6">
        {vehicle.year} {vehicle.make} {vehicle.model} — Mileage Over Time
      </h1>
      <p className="text-center text-gray-500 mb-4">
        VIN: {vehicle.vin} &nbsp;|&nbsp; Acquired {formatBillingLabel(vehicle.acquired_date)} at{' '}
        {vehicle.acquired_miles.toLocaleString()} mi &nbsp;|&nbsp; {summary.serviceEventCount}{' '}
        service events
      </p>

      <div className="flex flex-wrap justify-around my-5">
        <StatCard
          value={vehicle.acquired_miles.toLocaleString()}
          label="Starting Mileage (Purchase)"
          color={color}
        />
        <StatCard
          value={summary.latestMiles.toLocaleString()}
          label={`Latest Mileage (${latestLabel})`}
          color={color}
        />
        <StatCard
          value={summary.milesDriven.toLocaleString()}
          label="Miles Driven Since Purchase"
          color={color}
        />
        <StatCard
          value={`~${summary.avgMilesPerMonth.toLocaleString()}`}
          label="Avg Miles / Month"
          color={color}
        />
        <StatCard
          value={formatCurrency(summary.totalServiceCost, 0)}
          label="Total Service Cost"
          color={color}
        />
      </div>

      <MileageLineChart events={chartEvents} color={color} />

      <ServiceTable events={tableRows} color={color} />
    </main>
  );
}
