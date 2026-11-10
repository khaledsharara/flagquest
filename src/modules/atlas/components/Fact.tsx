interface FactProps {
  label: string;
  value: string;
}

export function Fact({ label, value }: FactProps) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-semibold leading-snug">{value}</div>
    </div>
  );
}
