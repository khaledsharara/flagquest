import type { ContinentId, Country } from '../../atlas/types';

export type Mode = 'mixed' | 'flags' | 'shapes' | 'map' | 'capitals';

/** What a question tests. Mastery is tracked per country and skill. */
export type Skill = 'flags' | 'shapes' | 'map' | 'capitals';

export interface ModeInfo {
  id: Mode;
  label: string;
  description: string;
}

export interface Level {
  id: string;
  continent: ContinentId;
  number: number;
  countries: Country[];
}

export interface LevelResult {
  stars: number; // 0–3
  best: number; // best score, 0–1
}
