import { cn } from '../../shared';
import { MASTERED_BOX, isMastered } from '../utils/mastery';

/** Three dots that fill up as a country moves towards mastery; green once mastered. */
export function MasteryDots({ value, className }: { value: number; className?: string }) {
  const mastered = isMastered(value);
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-label={mastered ? 'Mastered' : `${Math.min(value, MASTERED_BOX)} of ${MASTERED_BOX} towards mastery`}
    >
      {Array.from({ length: MASTERED_BOX }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            i < value ? (mastered ? 'bg-emerald-500' : 'bg-indigo-400') : 'bg-slate-200 dark:bg-slate-700',
          )}
        />
      ))}
    </div>
  );
}
