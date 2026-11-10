import { Card, Icon, cn } from '../../shared';

interface EndlessCardProps {
  title: string;
  count: number;
  mastered: number;
  /** Shown instead of the counts when there is nothing to practice yet. */
  emptyHint: string;
  onOpen: () => void;
}

/** Entry point for endless practice over the countries already practiced. */
export function EndlessCard({ title, count, mastered, emptyHint, onOpen }: EndlessCardProps) {
  const empty = count === 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={empty}
      className="block w-full text-left transition-transform active:scale-[0.99] disabled:active:scale-100"
    >
      <Card className={cn('flex items-center gap-3 p-4', empty && 'opacity-60')}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Icon name="infinity" className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {empty ? emptyHint : `${count} ${count === 1 ? 'country' : 'countries'} · ${mastered} mastered`}
          </div>
        </div>
        {!empty && <Icon name="forward" className="h-5 w-5 shrink-0 text-slate-400" />}
      </Card>
    </button>
  );
}
