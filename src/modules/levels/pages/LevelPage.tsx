import { continentName, useAtlas, type ContinentId } from '../../atlas';
import { Button, Icon, Screen, Stars } from '../../shared';
import { useNavigation } from '../../../navigation';
import { StudyCard } from '../components/StudyCard';
import { useProgress } from '../components/ProgressProvider';
import { getLevel } from '../utils/levels';
import { isMastered } from '../utils/mastery';
import { modeInfo } from '../utils/modes';

interface LevelPageProps {
  continent: ContinentId;
  level: number;
}

export function LevelPage({ continent, level: number }: LevelPageProps) {
  const atlas = useAtlas();
  const { mode, resultFor, masteryOf } = useProgress();
  const { push, pop } = useNavigation();
  const level = getLevel(atlas, continent, number);
  if (!level) return null;
  const result = resultFor(mode, level);
  const ids = level.countries.map((c) => c.id);
  const mastered = ids.filter((id) => isMastered(masteryOf(id, mode))).length;

  return (
    <Screen
      title={`Level ${level.number}`}
      onBack={pop}
      backLabel={continentName(continent)}
      footer={
        <div className="mx-auto flex max-w-xl items-center gap-3 pb-3">
          <Button
            variant="secondary"
            onClick={() => push({ name: 'practice', scope: { kind: 'level', continent, level: level.number }, mode })}
          >
            <Icon name="infinity" className="h-5 w-5" />
            Endless
          </Button>
          <Button className="flex-1" onClick={() => push({ name: 'quiz', continent, level: level.number, mode })}>
            Start {modeInfo(mode).label.toLowerCase()} quiz
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-xl px-4 pb-6">
        <div className="flex items-start justify-between pt-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>Study these {level.countries.length} countries, then take the quiz. Tap a card for details.</p>
            <p className="mt-1">
              {mastered} of {level.countries.length} mastered in {modeInfo(mode).label}. Endless keeps going until you stop.
            </p>
          </div>
          {result && <Stars count={result.stars} className="ml-3 mt-0.5 shrink-0" />}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {level.countries.map((country, index) => (
            <StudyCard
              key={country.id}
              country={country}
              mastery={masteryOf(country.id, mode)}
              onOpen={() => push({ name: 'country', ids, index })}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}
