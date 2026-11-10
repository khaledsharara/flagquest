import { cn } from '../../shared';
import { flagUrl } from '../utils/loadAtlas';
import type { Country } from '../types';

interface FlagProps {
  country: Country;
  /** Aspect ratio (width / height) of the box the flag is fitted into. */
  boxRatio?: number;
  className?: string;
}

/** A flag drawn at its real proportions, centred inside a box of `boxRatio`. */
export function Flag({ country, boxRatio = 1.5, className }: FlagProps) {
  const wide = country.flagRatio >= boxRatio;
  return (
    <div className={cn('flex items-center justify-center', className)} style={{ aspectRatio: boxRatio }}>
      <img
        src={flagUrl(country)}
        alt="Flag"
        draggable={false}
        className="flag-image max-h-full max-w-full rounded-[3px]"
        style={{ aspectRatio: country.flagRatio, width: wide ? '100%' : 'auto', height: wide ? 'auto' : '100%' }}
      />
    </div>
  );
}
