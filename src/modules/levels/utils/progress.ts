import type { Mode } from '../types';

export const PASS_STARS = 1;

export function starsFor(score: number): number {
  if (score >= 1) return 3;
  if (score >= 0.8) return 2;
  if (score >= 0.6) return 1;
  return 0;
}

export const resultKey = (mode: Mode, levelId: string): string => `${mode}/${levelId}`;
