import { useMemo } from 'react';
import type { Tone } from '../../shared';
import { focusFrame } from '../utils/geometry';
import { WorldMap } from './WorldMap';
import type { Country } from '../types';

interface FocusMapProps {
  country: Country;
  tone?: Tone;
  /** Additional countries to colour (e.g. a wrong guess). */
  extra?: Readonly<Record<string, Tone>>;
  width?: number;
  height?: number;
  className?: string;
}

/** Static map centred on a country, with the country highlighted. */
export function FocusMap({ country, tone = 'accent', extra, width = 1000, height = 700, className }: FocusMapProps) {
  const frame = focusFrame(country, width, height);
  const highlights = useMemo(() => ({ ...extra, [country.id]: tone }), [extra, country.id, tone]);
  return <WorldMap frame={frame} highlights={highlights} className={className} />;
}
