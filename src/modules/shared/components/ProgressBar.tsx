import { cn } from '../utils/cn';

interface ProgressBarProps {
  value: number; // 0..1
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)}>
      <div
        className="h-full rounded-full bg-indigo-500 transition-[width] duration-300 ease-out"
        style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }}
      />
    </div>
  );
}
