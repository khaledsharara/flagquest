import type { Country } from '../../atlas';
import { MODE_SKILLS, isMastered, type Mode, type Skill } from '../../levels';
import { makeQuestion, typesForSkill, type Question } from '../../quiz';
import { pick } from '../../shared';

export interface MasteryReader {
  masteryOf: (countryId: string, mode: Mode) => number;
  skillBox: (countryId: string, skill: Skill) => number;
}

// Countries further from mastery come up more often; mastered ones still appear now and then.
const WEIGHT_BY_BOX = [6, 4, 2.5];
const MASTERED_WEIGHT = 0.6;
// A country isn't asked again until this many others have been asked (when the scope is big enough).
const RECENT_GAP = 3;

function weightedPick<T>(items: T[], weight: (item: T) => number): T {
  const weights = items.map(weight);
  let remaining = Math.random() * weights.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < items.length; i++) {
    remaining -= weights[i] ?? 0;
    if (remaining <= 0) return items[i] as T;
  }
  return items[items.length - 1] as T;
}

/** Picks the next endless question: a weak country, tested on its weakest skill in this mode. */
export function nextPracticeQuestion(
  countries: Country[],
  mode: Mode,
  mastery: MasteryReader,
  recent: string[],
  poolFor: (country: Country) => Country[],
): Question {
  const gap = Math.min(RECENT_GAP, countries.length - 1);
  const avoid = new Set(gap > 0 ? recent.slice(-gap) : []);
  const candidates = countries.filter((c) => !avoid.has(c.id));
  const country = weightedPick(candidates.length ? candidates : countries, (c) => {
    const box = mastery.masteryOf(c.id, mode);
    return isMastered(box) ? MASTERED_WEIGHT : (WEIGHT_BY_BOX[box] ?? MASTERED_WEIGHT);
  });

  const skills = MODE_SKILLS[mode];
  const lowest = Math.min(...skills.map((s) => mastery.skillBox(country.id, s)));
  const skill = pick(skills.filter((s) => mastery.skillBox(country.id, s) === lowest));
  return makeQuestion(country, pick(typesForSkill(mode, skill)), poolFor(country));
}
