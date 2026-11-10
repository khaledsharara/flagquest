import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from '../../shared';
import { PASS_STARS, resultKey, starsFor } from '../utils/progress';
import type { Level, LevelResult, Mode } from '../types';

const MODE_KEY = 'flagquest.mode';
const RESULTS_KEY = 'flagquest.results.v1';

interface Progress {
  mode: Mode;
  setMode: (mode: Mode) => void;
  resultFor: (mode: Mode, level: Level) => LevelResult | undefined;
  isUnlocked: (mode: Mode, level: Level) => boolean;
  /** Saves a finished quiz; keeps the best result. Returns the stars earned this time. */
  recordResult: (mode: Mode, level: Level, score: number) => number;
  resetProgress: () => void;
}

const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => readJSON<Mode>(MODE_KEY, 'mixed'));
  const [results, setResults] = useState<Record<string, LevelResult>>(() => readJSON(RESULTS_KEY, {}));

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    writeJSON(MODE_KEY, next);
  }, []);

  const resultFor = useCallback(
    (m: Mode, level: Level) => results[resultKey(m, level.id)],
    [results],
  );

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

  const resetProgress = useCallback(() => {
    setResults({});
    writeJSON(RESULTS_KEY, {});
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, resultFor, isUnlocked, recordResult, resetProgress }),
    [mode, setMode, resultFor, isUnlocked, recordResult, resetProgress],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Progress {
  const progress = useContext(ProgressContext);
  if (!progress) throw new Error('useProgress must be used inside <ProgressProvider>');
  return progress;
}
