import type { Country } from '../../atlas/types';

export type QuestionType =
  | 'flag-name' // see a flag, pick the country
  | 'name-flag' // see a country, pick its flag
  | 'shape-name' // see an outline, pick the country
  | 'name-shape' // see a country, pick its outline
  | 'map-name' // see a highlighted country, pick its name
  | 'locate' // see a country name, tap it on the map
  | 'capital'; // see a country, pick its capital

export interface Question {
  key: string;
  type: QuestionType;
  country: Country;
  /** Multiple-choice options (includes the answer); empty for map taps. */
  options: Country[];
  /** A repeat of a missed country; doesn't count towards the score. */
  review: boolean;
}

export interface Answer {
  question: Question;
  chosenId: string;
  correct: boolean;
}

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed';
