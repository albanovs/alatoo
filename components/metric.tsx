export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-24 rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
