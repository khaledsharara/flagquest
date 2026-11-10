import { Flag, type Country } from '../../atlas';
import { cn } from '../../shared';

interface FlagStripProps {
  countries: Country[];
  max?: number;
  className?: string;
}

export function FlagStrip({ countries, max = countries.length, className }: FlagStripProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {countries.slice(0, max).map((c) => (
        <Flag key={c.id} country={c} className="h-5" />
      ))}
      {countries.length > max && <span className="text-xs text-slate-400">+{countries.length - max}</span>}
    </div>
  );
}
