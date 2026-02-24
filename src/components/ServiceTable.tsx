'use client';

import { useState, useMemo } from 'react';

interface ServiceRow {
  date: string;
  miles: number;
  provider: string;
  service: string;
  cost: number | null;
  categories: string[];
}

interface ServiceTableProps {
  events: ServiceRow[];
  color: string;
}

const CATEGORY_META: Record<string, { label: string; pill: string }> = {
  oil_change:  { label: 'Oil Change',  pill: 'bg-amber-100 text-amber-800'   },
  tires:       { label: 'Tires',       pill: 'bg-blue-100 text-blue-800'     },
  alignment:   { label: 'Alignment',   pill: 'bg-indigo-100 text-indigo-800' },
  brakes:      { label: 'Brakes',      pill: 'bg-red-100 text-red-800'       },
  filters:     { label: 'Filters',     pill: 'bg-green-100 text-green-800'   },
  inspection:  { label: 'Inspection',  pill: 'bg-slate-100 text-slate-700'   },
  fluids:      { label: 'Fluids',      pill: 'bg-cyan-100 text-cyan-800'     },
  battery:     { label: 'Battery',     pill: 'bg-yellow-100 text-yellow-800' },
  electrical:  { label: 'Electrical',  pill: 'bg-purple-100 text-purple-800' },
  suspension:  { label: 'Suspension',  pill: 'bg-orange-100 text-orange-800' },
  drivetrain:  { label: 'Drivetrain',  pill: 'bg-rose-100 text-rose-800'     },
  belts:       { label: 'Belts',       pill: 'bg-teal-100 text-teal-800'     },
};

// Canonical display order for category filter buttons
const CATEGORY_ORDER = [
  'oil_change', 'tires', 'alignment', 'brakes', 'filters',
  'inspection', 'fluids', 'battery', 'electrical', 'suspension', 'drivetrain', 'belts',
];

function formatCost(cost: number | null): string {
  if (cost === null) return '—';
  return cost.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fuzzyMatch(text: string, query: string): boolean {
  let ti = 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  for (let qi = 0; qi < q.length; qi++) {
    ti = t.indexOf(q[qi], ti);
    if (ti === -1) return false;
    ti++;
  }
  return true;
}

export default function ServiceTable({ events, color }: ServiceTableProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Only show category buttons for categories present in this vehicle's data
  const presentCategories = useMemo(() => {
    const seen = new Set(events.flatMap((e) => e.categories));
    return CATEGORY_ORDER.filter((c) => seen.has(c));
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesText =
        !query ||
        fuzzyMatch(e.provider, query) ||
        fuzzyMatch(e.service, query);
      const matchesCategory =
        !activeCategory || e.categories.includes(activeCategory);
      return matchesText && matchesCategory;
    });
  }, [events, query, activeCategory]);

  const totalCost = filtered
    .filter((e) => e.cost !== null)
    .reduce((sum, e) => sum + (e.cost ?? 0), 0);

  const isFiltered = query || activeCategory;

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm my-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 shrink-0">Service History</h2>
        <input
          type="text"
          placeholder="Search provider or service…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {presentCategories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${meta.pill} ${
                isActive
                  ? 'ring-2 ring-current ring-offset-1 font-semibold'
                  : 'hover:opacity-80'
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: color }}>
              <th className="text-white text-left px-3 py-2.5 font-semibold">Date</th>
              <th className="text-white text-left px-3 py-2.5 font-semibold">Odometer</th>
              <th className="text-white text-left px-3 py-2.5 font-semibold">Provider</th>
              <th className="text-white text-left px-3 py-2.5 font-semibold">Service</th>
              <th className="text-white text-right px-3 py-2.5 font-semibold">Cost</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((e, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap align-top">{e.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap align-top">{e.miles.toLocaleString()}</td>
                  <td className="px-3 py-2 align-top">{e.provider}</td>
                  <td className="px-3 py-2 align-top">
                    <div>{e.service}</div>
                    {e.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {e.categories.map((cat) => {
                          const meta = CATEGORY_META[cat];
                          if (!meta) return null;
                          return (
                            <span
                              key={cat}
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.pill}`}
                            >
                              {meta.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap align-top">{formatCost(e.cost)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-gray-400 italic">
                  No matching records
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="px-3 pt-2.5 font-bold border-t-2 border-gray-800">
                {isFiltered ? 'Filtered Cost' : 'Total Service Cost'}
              </td>
              <td className="px-3 pt-2.5 text-right font-bold border-t-2 border-gray-800 whitespace-nowrap">
                {formatCost(totalCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
