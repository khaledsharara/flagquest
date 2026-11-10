import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAtlas, type ContinentId } from '../../atlas';
import { readJSON, writeJSON } from '../../shared';
import { levelsOf } from '../utils/levels';
import { masteryKey, nextBox } from '../utils/mastery';
import { MODE_SKILLS } from '../utils/modes';
import { PASS_STARS, resultKey, starsFor } from '../utils/progress';
import type { Level, LevelResult, Mode, Skill } from '../types';

const MODE_KEY = 'flagquest.mode';
const RESULTS_KEY = 'flagquest.results.v1';
const MASTERY_KEY = 'flagquest.mastery.v1';

interface Progress {
  mode: Mode;
  setMode: (mode: Mode) => void;
  resultFor: (mode: Mode, level: Level) => LevelResult | undefined;
  isUnlocked: (mode: Mode, level: Level) => boolean;
  /** Saves a finished quiz; keeps the best result. Returns the stars earned this time. */
  recordResult: (mode: Mode, level: Level, score: number) => number;
  /** Updates a country's mastery after any answer (quiz or endless practice). */
  recordAnswer: (countryId: string, skill: Skill, correct: boolean) => void;
  skillBox: (countryId: string, skill: Skill) => number;
  /** A country's mastery in a mode: its weakest skill's box. */
  masteryOf: (countryId: string, mode: Mode) => number;
  /** Countries answered at least once, or in a level that was finished at least once (any mode). */
  practicedIds: ReadonlySet<string>;
  resetProgress: () => void;
}

const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const atlas = useAtlas();
  const [mode, setModeState] = useState<Mode>(() => readJSON<Mode>(MODE_KEY, 'mixed'));
  const [results, setResults] = useState<Record<string, LevelResult>>(() => readJSON(RESULTS_KEY, {}));
  const [mastery, setMastery] = useState<Record<string, number>>(() => readJSON(MASTERY_KEY, {}));

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    writeJSON(MODE_KEY, next);
  }, []);

  const resultFor = useCallback((m: Mode, level: Level) => results[resultKey(m, level.id)], [results]);

  const isUnlocked = useCallback(
    (m: Mode, level: Level) => {
      if (level.number === 1) return true;
      const previous = results[resultKey(m, `${level.continent}-${level.number - 1}`)];
      return (previous?.stars ?? 0) >= PASS_STARS;
    },
    [results],
  );

  const recordResult = useCallback((m: Mode, level: Level, score: number) => {
    const stars = starsFor(score);
    setResults((current) => {
      const key = resultKey(m, level.id);
      const previous = current[key];
      const next = {
        ...current,
        [key]: { stars: Math.max(stars, previous?.stars ?? 0), best: Math.max(score, previous?.best ?? 0) },
      };
      writeJSON(RESULTS_KEY, next);
      return next;
    });
    return stars;
  }, []);

  const recordAnswer = useCallback((countryId: string, skill: Skill, correct: boolean) => {
    setMastery((current) => {
      const key = masteryKey(skill, countryId);
      const next = { ...current, [key]: nextBox(current[key] ?? 0, correct) };
      writeJSON(MASTERY_KEY, next);
      return next;
    });
  }, []);

  const skillBox = useCallback((countryId: string, skill: Skill) => mastery[masteryKey(skill, countryId)] ?? 0, [mastery]);

  const masteryOf = useCallback(
    (countryId: string, m: Mode) => Math.min(...MODE_SKILLS[m].map((skill) => mastery[masteryKey(skill, countryId)] ?? 0)),
    [mastery],
  );

  const practicedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const key of Object.keys(mastery)) ids.add(key.slice(key.indexOf('/') + 1));
    for (const key of Object.keys(results)) {
      const levelId = key.slice(key.indexOf('/') + 1);
      const split = levelId.lastIndexOf('-');
      const level = levelsOf(atlas, levelId.slice(0, split) as ContinentId)[Number(levelId.slice(split + 1)) - 1];
      level?.countries.forEach((c) => ids.add(c.id));
    }
    return ids;
  }, [atlas, mastery, results]);

  const resetProgress = useCallback(() => {
    setResults({});
    setMastery({});
    writeJSON(RESULTS_KEY, {});
    writeJSON(MASTERY_KEY, {});
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      resultFor,
      isUnlocked,
      recordResult,
      recordAnswer,
      skillBox,
      masteryOf,
      practicedIds,
      resetProgress,
    }),
    [mode, setMode, resultFor, isUnlocked, recordResult, recordAnswer, skillBox, masteryOf, practicedIds, resetProgress],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Progress {
  const progress = useContext(ProgressContext);
  if (!progress) throw new Error('useProgress must be used inside <ProgressProvider>');
  return progress;
}
