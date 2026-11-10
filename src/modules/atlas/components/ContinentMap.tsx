import { useMemo } from 'react';
import type { Tone } from '../../shared';
import { continentFrame } from '../utils/geometry';
import { useAtlas } from './AtlasProvider';
import { WorldMap } from './WorldMap';
import type { ContinentId } from '../types';

interface ContinentMapProps {
  continent: ContinentId;
  highlights?: Readonly<Record<string, Tone>>;
  onSelect?: (countryId: string) => void;
  zoomToId?: string | null;
  className?: string;
}

/** Zoomable map of a continent; small countries get tappable markers. */
export function ContinentMap({ continent, highlights, onSelect, zoomToId, className }: ContinentMapProps) {
  const atlas = useAtlas();
  const frame = continentFrame(continent);
  const { activeIds, markerIds } = useMemo(() => {
    const inContinent = atlas.countries.filter((c) => c.continent === continent);
    return {
      activeIds: new Set(inContinent.map((c) => c.id)),
      markerIds: inContinent.filter((c) => c.tiny).map((c) => c.id),
    };
  }, [atlas, continent]);
  return (
    <WorldMap
      interactive
      frame={frame}
      activeIds={activeIds}
      markerIds={markerIds}
      highlights={highlights}
      onSelect={onSelect}
      zoomToId={zoomToId}
      className={className}
    />
  );
}
