import type { Atlas, ContinentId, Country, WorldShape } from '../types';

interface CountriesFile {
  continents: ContinentId[];
  countries: Country[];
}

let pending: Promise<Atlas> | null = null;

async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
  return (await response.json()) as T;
}

/** Loads the bundled country data and geometry once. */
export function loadAtlas(): Promise<Atlas> {
  pending ??= Promise.all([
    fetchJSON<CountriesFile>('data/countries.json'),
    fetchJSON<WorldShape[]>('data/world.json'),
  ]).then(([{ continents, countries }, shapes]) => ({
    continents,
    countries,
    byId: new Map(countries.map((c) => [c.id, c])),
    shapes,
    shapeById: new Map(shapes.map((s) => [s.id, s])),
  }));
  pending.catch(() => {
    pending = null;
  });
  return pending;
}

export const flagUrl = (country: Country): string => `flags/${country.code}.svg`;
