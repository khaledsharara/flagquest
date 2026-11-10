interface PracticeStatusProps {
  label: string;
  answered: number;
  correct: number;
  streak: number;
  allMastered: boolean;
}

/** One-line session info shown above each endless question. */
export function PracticeStatus({ label, answered, correct, streak, allMastered }: PracticeStatusProps) {
  const stats = [
    answered > 0 && `${Math.round((correct / answered) * 100)}% right`,
    streak >= 3 && `streak ${streak}`,
  ].filter(Boolean);
  return (
    <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 pt-3 text-xs font-semibold uppercase tracking-wide">
      <span className="truncate text-slate-400">{label}</span>
      <span className="shrink-0 text-slate-500 dark:text-slate-400">
        {allMastered && <span className="text-emerald-600 dark:text-emerald-400">All mastered{stats.length ? ' · ' : ''}</span>}
        {stats.join(' · ')}
      </span>
    </div>
  );
}
