import { Card, Icon, ProgressBar, StarIcon } from '../../shared';
import { continentName, type ContinentId } from '../../atlas';
import { FlagStrip } from './FlagStrip';
import type { Level, LevelResult } from '../types';

interface ContinentCardProps {
  continent: ContinentId;
  levels: Level[];
  results: (LevelResult | undefined)[];
  onOpen: () => void;
}

export function ContinentCard({ continent, levels, results, onOpen }: ContinentCardProps) {
  const stars = results.reduce((sum, r) => sum + (r?.stars ?? 0), 0);
  const maxStars = levels.length * 3;
  const countryCount = levels.reduce((sum, l) => sum + l.countries.length, 0);
  const preview = levels[0]?.countries ?? [];
  return (
    <button type="button" onClick={onOpen} className="block w-full text-left active:scale-[0.99] transition-transform">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-rounded text-xl font-bold">{continentName(continent)}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {levels.length} levels · {countryCount} countries
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <StarIcon filled className="h-4 w-4" />
            {stars}/{maxStars}
            <Icon name="forward" className="ml-1 h-5 w-5 text-slate-400" />
          </div>
        </div>
        <FlagStrip countries={preview} max={7} className="mt-3" />
        <ProgressBar value={stars / maxStars} className="mt-3" />
      </Card>
    </button>
  );
}
