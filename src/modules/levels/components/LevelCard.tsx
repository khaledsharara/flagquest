import { Card, Icon, Stars, cn } from '../../shared';
import { FlagStrip } from './FlagStrip';
import type { Level, LevelResult } from '../types';

interface LevelCardProps {
  level: Level;
  result?: LevelResult;
  unlocked: boolean;
  onOpen: () => void;
}

export function LevelCard({ level, result, unlocked, onOpen }: LevelCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!unlocked}
      className="block w-full text-left transition-transform active:scale-[0.99] disabled:active:scale-100"
    >
      <Card className={cn('p-4', !unlocked && 'opacity-60')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl font-rounded text-lg font-bold',
                unlocked
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
              )}
            >
              {unlocked ? level.number : <Icon name="lock" className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-semibold">Level {level.number}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {unlocked
                  ? `${level.countries.length} countries${result ? ` · best ${Math.round(result.best * 100)}%` : ''}`
                  : `Earn a star in level ${level.number - 1} to unlock`}
              </div>
            </div>
          </div>
          {unlocked && <Stars count={result?.stars ?? 0} />}
        </div>
        {unlocked && <FlagStrip countries={level.countries} className="mt-3" />}
      </Card>
    </button>
  );
}
