import { continentName, useAtlas, type ContinentId } from '../../atlas';
import { Button, Screen, Stars } from '../../shared';
import { useNavigation } from '../../../navigation';
import { StudyCard } from '../components/StudyCard';
import { useProgress } from '../components/ProgressProvider';
import { getLevel } from '../utils/levels';
import { modeInfo } from '../utils/modes';

interface LevelPageProps {
  continent: ContinentId;
  level: number;
}

export function LevelPage({ continent, level: number }: LevelPageProps) {
  const atlas = useAtlas();
  const { mode, resultFor } = useProgress();
  const { push, pop } = useNavigation();
  const level = getLevel(atlas, continent, number);
  if (!level) return null;
  const result = resultFor(mode, level);
  const ids = level.countries.map((c) => c.id);

  return (
    <Screen
      title={`Level ${level.number}`}
      onBack={pop}
      backLabel={continentName(continent)}
      footer={
        <div className="mx-auto flex max-w-xl items-center gap-3 pb-3">
          <Button block onClick={() => push({ name: 'quiz', continent, level: level.number, mode })}>
            Start {modeInfo(mode).label.toLowerCase()} quiz
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-xl px-4 pb-6">
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Study these {level.countries.length} countries, then take the quiz. Tap a card for details.
          </p>
          {result && <Stars count={result.stars} className="ml-3 shrink-0" />}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {level.countries.map((country, index) => (
            <StudyCard key={country.id} country={country} onOpen={() => push({ name: 'country', ids, index })} />
          ))}
        </div>
      </div>
    </Screen>
  );
}
