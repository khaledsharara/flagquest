import { useMemo } from 'react';
import { cn } from '../../shared';
import { silhouettePath } from '../utils/geometry';
import { useAtlas } from './AtlasProvider';
import type { Country } from '../types';

interface CountryShapeProps {
  country: Country;
  className?: string;
}

/** The outline of a country's main landmass, scaled to fill a square. */
export function CountryShape({ country, className }: CountryShapeProps) {
  const atlas = useAtlas();
  const d = useMemo(() => silhouettePath(atlas, country, 200, 8), [atlas, country]);
  return (
    <svg viewBox="0 0 200 200" className={cn('block', className)} role="img" aria-label="Country shape">
      <path d={d} className="fill-slate-700 dark:fill-slate-200" />
    </svg>
  );
}
