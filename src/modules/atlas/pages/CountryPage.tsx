import { useRef, useState, type TouchEvent } from 'react';
import { Button, Card, Icon, Screen } from '../../shared';
import { useNavigation } from '../../../navigation';
import { useAtlas } from '../components/AtlasProvider';
import { CountryChip } from '../components/CountryChip';
import { CountryShape } from '../components/CountryShape';
import { Fact } from '../components/Fact';
import { Flag } from '../components/Flag';
import { FocusMap } from '../components/FocusMap';
import { continentName } from '../utils/continents';
import { formatArea, formatPopulation } from '../utils/format';

interface CountryPageProps {
  ids: string[];
  index: number;
}

const SWIPE_PX = 60;

/** Country details; with several ids it works like a deck of flashcards (buttons or swipe). */
export function CountryPage({ ids, index }: CountryPageProps) {
  const atlas = useAtlas();
  const { pop, push } = useNavigation();
  const [current, setCurrent] = useState(index);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const country = atlas.byId.get(ids[current] ?? '');
  if (!country) return null;

  const go = (delta: number) => setCurrent((i) => Math.min(ids.length - 1, Math.max(0, i + delta)));

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    const t = e.changedTouches[0];
    touchStart.current = null;
    if (!start || !t || ids.length < 2) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const neighbors = country.neighbors.map((id) => atlas.byId.get(id)).filter((c) => c !== undefined);

  return (
    <Screen
      title={country.name}
      onBack={pop}
      footer={
        ids.length > 1 && (
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 pb-3">
            <Button variant="secondary" onClick={() => go(-1)} disabled={current === 0} aria-label="Previous country">
              <Icon name="back" />
            </Button>
            <span className="text-sm font-medium text-slate-500">
              {current + 1} of {ids.length}
            </span>
            <Button
              variant="secondary"
              onClick={() => go(1)}
              disabled={current === ids.length - 1}
              aria-label="Next country"
            >
              <Icon name="forward" />
            </Button>
          </div>
        )
      }
    >
      <div key={country.id} className="animate-fade-in mx-auto max-w-xl space-y-4 px-4 py-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Card className="p-5">
          <Flag country={country} boxRatio={1.6} className="mx-auto w-full max-w-sm" />
        </Card>

        <div>
          <h1 className="font-rounded text-3xl font-bold leading-tight">{country.name}</h1>
          {country.official !== country.name && (
            <p className="text-slate-500 dark:text-slate-400">{country.official}</p>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="map-sea aspect-[10/7]">
            <FocusMap country={country} />
          </div>
        </Card>

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Card className="flex items-center justify-center p-3">
            <CountryShape country={country} className="h-28 w-28" />
          </Card>
          <Card className="grid grid-cols-1 gap-2 p-3">
            <Fact label="Capital" value={country.capital} />
            <Fact label="Region" value={`${country.subregion || continentName(country.continent)}`} />
          </Card>
        </div>

        <Card className="grid grid-cols-2 gap-3 p-3">
          <Fact label="Population" value={formatPopulation(country.population)} />
          <Fact label="Area" value={formatArea(country.area)} />
        </Card>

        {neighbors.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Neighbors</h2>
            <div className="flex flex-wrap gap-2">
              {neighbors.map((n) => (
                <CountryChip key={n.id} country={n} onClick={() => push({ name: 'country', ids: [n.id], index: 0 })} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
