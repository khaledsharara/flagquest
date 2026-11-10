import type { Skill } from '../types';

/**
 * Leitner-style mastery: each country/skill pair sits in a box from 0 to MAX_BOX.
 * A right answer moves it up one box, a wrong one drops it two. MASTERED_BOX or more counts as mastered.
 */
export const MASTERED_BOX = 3;
export const MAX_BOX = 5;

export const nextBox = (box: number, correct: boolean): number =>
  correct ? Math.min(MAX_BOX, box + 1) : Math.max(0, box - 2);

export const isMastered = (box: number): boolean => box >= MASTERED_BOX;

export const masteryKey = (skill: Skill, countryId: string): string => `${skill}/${countryId}`;
