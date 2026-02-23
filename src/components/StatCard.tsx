interface StatCardProps {
  value: string;
  label: string;
  color?: string;
}

export default function StatCard({ value, label, color = '#2196F3' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg px-6 py-4 shadow-sm text-center m-1.5 min-w-[140px]">
      <div className="text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
