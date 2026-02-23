import type { Metadata } from 'next';
import Link from 'next/link';
import PropertyLabel from '@/components/PropertyLabel';
import {
  loadElectricRecords,
  processElectricData,
  loadGasRecords,
  processGasData,
  loadWaterRecords,
  processWaterData,
  loadVehicleData,
  processVehicleData,
  formatCurrency,
} from '@/lib/data';

export const metadata: Metadata = { title: 'Dashboard' };

function CarIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color}>
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

interface DashboardCardProps {
  href: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  title: string;
  detail: string;
  stats: { val: string; lbl: string }[];
}

function DashboardCard({ href, icon, label, title, detail, stats }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg px-6 py-5 shadow-sm no-underline text-inherit transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl leading-none">{icon}</span>
        {label}
      </div>
      <div className="text-[17px] font-semibold text-gray-800 mb-1.5">{title}</div>
      <div className="text-[13px] text-gray-400 leading-relaxed">{detail}</div>
      <div className="flex gap-4 mt-3 flex-wrap">
        {stats.map((s) => (
          <div key={s.lbl} className="text-[13px]">
            <div className="text-[16px] font-bold text-blue-500">{s.val}</div>
            <div className="text-[11px] text-gray-400">{s.lbl}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  // Load all data server-side
  const electric110 = processElectricData(loadElectricRecords('electric_110_tudor.json'));
  const electric69 = processElectricData(loadElectricRecords('electric_69hpl.json'));
  const gas110 = processGasData(loadGasRecords('gas_110_tudor.json'));
  const water110 = processWaterData(loadWaterRecords('water_110_tudor.json'));
  const nissanData = loadVehicleData('vehicle_nissan_rogue.json');
  const teslaData = loadVehicleData('vehicle_tesla_model3.json');
  const nissan = processVehicleData(nissanData);
  const tesla = processVehicleData(teslaData);

  return (
    <main className="max-w-[1400px] mx-auto px-5 py-8">
      <h1 className="text-center text-2xl font-bold text-gray-800 mb-1">Asset Analyses</h1>
      <p className="text-center text-gray-500 mb-8">
        Central dashboard for property energy usage and vehicle tracking
      </p>

      {/* Energy Usage */}
      <section className="mb-9">
        <h2 className="text-lg font-semibold text-gray-600 mb-4 pb-2 border-b-2 border-gray-200">
          Energy Usage — Properties
        </h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          <DashboardCard
            href="/properties/110-tudor-st/electric"
            icon="⚡"
            label={<PropertyLabel variant="tudor">110 Tudor St, Boston</PropertyLabel>}
            title="Electricity Usage"
            detail={`NStar / Eversource\n${electric110.dateRange}`}
            stats={[
              { val: electric110.totalKwh.toLocaleString(), lbl: 'Total kWh' },
              { val: formatCurrency(electric110.totalCost, 0), lbl: 'Total Cost' },
              { val: electric110.periodCount.toString(), lbl: 'Billing Periods' },
            ]}
          />
          <DashboardCard
            href="/properties/110-tudor-st/gas"
            icon="🔥"
            label={<PropertyLabel variant="tudor">110 Tudor St, Boston</PropertyLabel>}
            title="Natural Gas Usage"
            detail={`National Grid\n${gas110.dateRange}`}
            stats={[
              { val: gas110.totalTherms.toLocaleString(), lbl: 'Total Therms' },
              { val: formatCurrency(gas110.totalCost, 0), lbl: 'Total Cost' },
              { val: gas110.periodCount.toString(), lbl: 'Billing Periods' },
            ]}
          />
          <DashboardCard
            href="/properties/110-tudor-st/water"
            icon="💧"
            label={<PropertyLabel variant="tudor">110 Tudor St, Boston</PropertyLabel>}
            title="Water & Sewer Usage"
            detail={`Boston Water & Sewer Commission\n${water110.dateRange}`}
            stats={[
              { val: water110.totalCf.toLocaleString(), lbl: 'Total CF' },
              { val: formatCurrency(water110.totalCost, 0), lbl: 'Total Cost' },
              { val: water110.periodCount.toString(), lbl: 'Billing Periods' },
            ]}
          />
          <DashboardCard
            href="/properties/69-hitching-post-lane/electric"
            icon="⚡"
            label={
              <PropertyLabel variant="hpl">69 Hitching Post Ln, Bedford</PropertyLabel>
            }
            title="Electricity Usage"
            detail={`Eversource (NH)\n${electric69.dateRange}`}
            stats={[
              { val: electric69.totalKwh.toLocaleString(), lbl: 'Total kWh' },
              { val: formatCurrency(electric69.totalCost, 0), lbl: 'Total Cost' },
              { val: electric69.periodCount.toString(), lbl: 'Billing Periods' },
            ]}
          />
        </div>
      </section>

      {/* Vehicle Tracking */}
      <section className="mb-9">
        <h2 className="text-lg font-semibold text-gray-600 mb-4 pb-2 border-b-2 border-gray-200">
          Mileage & Service Tracking — Vehicles
        </h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          <DashboardCard
            href="/vehicles/nissan-rogue"
            icon={<CarIcon color="#E65100" />}
            label={
              <PropertyLabel variant="nissan">
                {nissanData.year} {nissanData.make} {nissanData.model}
              </PropertyLabel>
            }
            title="Mileage & Service Tracking"
            detail={nissan.dateRange}
            stats={[
              { val: nissan.milesDriven.toLocaleString(), lbl: 'Miles Driven' },
              {
                val: formatCurrency(nissan.totalServiceCost, 0),
                lbl: 'Service Cost',
              },
              { val: nissan.latestMiles.toLocaleString(), lbl: 'Current Miles' },
            ]}
          />
          <DashboardCard
            href="/vehicles/tesla-model3"
            icon={<CarIcon color="#4527A0" />}
            label={
              <PropertyLabel variant="tesla">
                {teslaData.year} {teslaData.make} {teslaData.model}
              </PropertyLabel>
            }
            title="Mileage & Service Tracking"
            detail={tesla.dateRange}
            stats={[
              { val: tesla.milesDriven.toLocaleString(), lbl: 'Miles Driven' },
              {
                val: formatCurrency(tesla.totalServiceCost, 0),
                lbl: 'Service Cost',
              },
              { val: tesla.latestMiles.toLocaleString(), lbl: 'Current Miles' },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
