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

function CategoryPills({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        if (!meta) return null;
        return (
          <span key={cat} className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.pill}`}>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

export default function ServiceTable({ events, color }: ServiceTableProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const presentCategories = useMemo(() => {
    const seen = new Set(events.flatMap((e) => e.categories));
    return CATEGORY_ORDER.filter((c) => seen.has(c));
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesText =
        !query || fuzzyMatch(e.provider, query) || fuzzyMatch(e.service, query);
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
    <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm my-5">

      {/* Controls */}
      <div className="flex flex-col gap-2 mb-3">
        {/* Title + search on same row; search goes full-width below on mobile */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800 shrink-0">Service History</h2>
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 md:flex-none md:w-56 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        {/* Category filter pills — single scrollable row */}
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {presentCategories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${meta.pill} ${
                  isActive ? 'ring-2 ring-current ring-offset-1 font-semibold' : 'hover:opacity-80'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block overflow-x-auto">
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
                    <CategoryPills categories={e.categories} />
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

      {/* ── Mobile cards (< md) ── */}
      <div className="md:hidden">
        {filtered.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {filtered.map((e, i) => (
                <div key={i} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs text-gray-500">
                      {e.date} &middot; {e.miles.toLocaleString()} mi
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap shrink-0">
                      {formatCost(e.cost)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{e.provider}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{e.service}</div>
                  <CategoryPills categories={e.categories} />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2.5 mt-1 border-t-2 border-gray-800 text-sm font-bold">
              <span>{isFiltered ? 'Filtered Cost' : 'Total Service Cost'}</span>
              <span>{formatCost(totalCost)}</span>
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-gray-400 italic text-sm">No matching records</p>
        )}
      </div>
    </div>
  );
}
