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

export default function ServiceTable({ events, color }: ServiceTableProps) {
  const totalCost = events
    .filter((e) => e.cost !== null)
    .reduce((sum, e) => sum + (e.cost ?? 0), 0);

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm my-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Service History</h2>
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
            {events.map((e, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{e.date}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.miles.toLocaleString()}</td>
                <td className="px-3 py-2">{e.provider}</td>
                <td className="px-3 py-2">{e.service}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{formatCost(e.cost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={4}
                className="px-3 pt-2.5 font-bold border-t-2 border-gray-800"
              >
                Total Service Cost
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
