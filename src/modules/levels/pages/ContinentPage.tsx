import { continentName, useAtlas, type ContinentId } from '../../atlas';
import { Screen } from '../../shared';
import { useNavigation } from '../../../navigation';
import { LevelCard } from '../components/LevelCard';
import { ModePicker } from '../components/ModePicker';
import { useProgress } from '../components/ProgressProvider';
import { levelsOf } from '../utils/levels';

export function ContinentPage({ continent }: { continent: ContinentId }) {
  const atlas = useAtlas();
  const { mode, resultFor, isUnlocked } = useProgress();
  const { push, pop } = useNavigation();
  const levels = levelsOf(atlas, continent);

  return (
    <Screen title={continentName(continent)} onBack={pop} backLabel="Home">
      <div className="mx-auto max-w-xl px-4 pb-safe">
        <div className="pt-4">
          <ModePicker />
        </div>
        <div className="mt-4 space-y-3 pb-6">
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              result={resultFor(mode, level)}
              unlocked={isUnlocked(mode, level)}
              onOpen={() => push({ name: 'level', continent, level: level.number })}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}
