'use client';

import { useState } from 'react';

interface ServiceRow {
  date: string;
  miles: number;
  provider: string;
  service: string;
  cost: number | null;
}

interface ServiceTableProps {
  events: ServiceRow[];
  color: string;
}

function formatCost(cost: number | null): string {
  if (cost === null) return '—';
  return cost.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
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

  const filtered = query
    ? events.filter(
        (e) => fuzzyMatch(e.provider ?? '', query) || fuzzyMatch(e.service ?? '', query)
      )
    : events;

  const totalCost = filtered
    .filter((e) => e.cost !== null)
    .reduce((sum, e) => sum + (e.cost ?? 0), 0);

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm my-5">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Service History</h2>
        <input
          type="text"
          placeholder="Search provider or service…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
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
                  <td className="px-3 py-2 whitespace-nowrap">{e.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.miles.toLocaleString()}</td>
                  <td className="px-3 py-2">{e.provider}</td>
                  <td className="px-3 py-2">{e.service}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{formatCost(e.cost)}</td>
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
                {query ? 'Filtered Cost' : 'Total Service Cost'}
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
