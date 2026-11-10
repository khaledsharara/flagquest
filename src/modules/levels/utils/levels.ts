import type { Atlas, ContinentId, Country } from '../../atlas/types';
import type { Level } from '../types';

const cache = new WeakMap<Atlas, Map<ContinentId, Level[]>>();

export const levelId = (continent: ContinentId, number: number): string => `${continent}-${number}`;

export function levelsOf(atlas: Atlas, continent: ContinentId): Level[] {
  let byContinent = cache.get(atlas);
  if (!byContinent) {
    byContinent = new Map();
    cache.set(atlas, byContinent);
  }
  const cached = byContinent.get(continent);
  if (cached) return cached;
  const countries = atlas.countries.filter((c) => c.continent === continent);
  const count = Math.max(...countries.map((c) => c.level));
  const levels = Array.from({ length: count }, (_, i) => ({
    id: levelId(continent, i + 1),
    continent,
    number: i + 1,
    countries: countries.filter((c) => c.level === i + 1).sort((a, b) => a.name.localeCompare(b.name)),
  }));
  byContinent.set(continent, levels);
  return levels;
}

export const getLevel = (atlas: Atlas, continent: ContinentId, number: number): Level | undefined =>
  levelsOf(atlas, continent)[number - 1];

/** Wrong answer options come from the same continent, mostly from nearby levels. */
export function distractorPool(atlas: Atlas, level: Level): Country[] {
  const continent = atlas.countries.filter((c) => c.continent === level.continent);
  const nearby = continent.filter((c) => Math.abs(c.level - level.number) <= 1);
  return nearby.length >= 12 ? nearby : continent;
}
