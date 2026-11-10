import type { Country } from '../types';

/** Lowercases and strips accents so "cote" matches "Côte". */
export const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function matchesQuery(country: Country, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return [country.name, country.official, country.capital].some((field) => normalize(field).includes(q));
}
