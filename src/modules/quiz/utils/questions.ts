import type { Country } from '../../atlas/types';
import type { Level, Mode, Skill } from '../../levels/types';
import { sample, shuffle } from '../../shared';
import type { OptionState, Question, QuestionType } from '../types';

export const MODE_QUESTION_TYPES: Record<Mode, QuestionType[]> = {
  mixed: ['flag-name', 'name-flag', 'shape-name', 'map-name', 'locate'],
  flags: ['flag-name', 'name-flag'],
  shapes: ['shape-name', 'name-shape'],
  map: ['map-name', 'locate'],
  capitals: ['capital'],
};

export const QUESTION_SKILL: Record<QuestionType, Skill> = {
  'flag-name': 'flags',
  'name-flag': 'flags',
  'shape-name': 'shapes',
  'name-shape': 'shapes',
  'map-name': 'map',
  locate: 'map',
  capital: 'capitals',
};

/** Question types of a mode that test the given skill. */
export const typesForSkill = (mode: Mode, skill: Skill): QuestionType[] =>
  MODE_QUESTION_TYPES[mode].filter((type) => QUESTION_SKILL[type] === skill);

const OPTION_COUNT = 4;
let keySeed = 0;

export function makeQuestion(country: Country, type: QuestionType, pool: Country[], review = false): Question {
  const candidates = pool.filter(
    (c) => c.id !== country.id && (type !== 'capital' || c.capital !== country.capital),
  );
  const options = type === 'locate' ? [] : shuffle([country, ...sample(candidates, OPTION_COUNT - 1)]);
  return { key: `${country.id}-${type}-${keySeed++}`, type, country, options, review };
}

/** One question per country in the level, with the mode's question types spread evenly. */
export function buildQuiz(level: Level, pool: Country[], mode: Mode): Question[] {
  const types = MODE_QUESTION_TYPES[mode];
  const countries = shuffle(level.countries);
  const typeBag = shuffle(countries.map((_, i) => types[i % types.length] as QuestionType));
  return countries.map((country, i) => makeQuestion(country, typeBag[i] as QuestionType, pool));
}

/** A second chance at a missed country, asked a different way when the mode allows it. */
export function reviewQuestion(missed: Question, pool: Country[], mode: Mode): Question {
  const types = MODE_QUESTION_TYPES[mode];
  const others = types.filter((t) => t !== missed.type);
  const type = others.length ? (shuffle(others)[0] as QuestionType) : missed.type;
  return makeQuestion(missed.country, type, pool, true);
}

export function optionState(question: Question, chosenId: string | null, optionId: string): OptionState {
  if (!chosenId) return 'idle';
  if (optionId === question.country.id) return 'correct';
  if (optionId === chosenId) return 'wrong';
  return 'dimmed';
}
