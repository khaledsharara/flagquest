import { continentName, useAtlas, type ContinentId } from '../../atlas';
import { Screen } from '../../shared';
import { useNavigation } from '../../../navigation';
import { EndlessCard } from '../components/EndlessCard';
import { LevelCard } from '../components/LevelCard';
import { ModePicker } from '../components/ModePicker';
import { useProgress } from '../components/ProgressProvider';
import { levelsOf } from '../utils/levels';
import { isMastered } from '../utils/mastery';

export function ContinentPage({ continent }: { continent: ContinentId }) {
  const atlas = useAtlas();
  const { mode, resultFor, isUnlocked, masteryOf, practicedIds } = useProgress();
  const { push, pop } = useNavigation();
  const levels = levelsOf(atlas, continent);
  const countMastered = (ids: string[]) => ids.filter((id) => isMastered(masteryOf(id, mode))).length;
  const practiced = atlas.countries.filter((c) => c.continent === continent && practicedIds.has(c.id)).map((c) => c.id);

  return (
    <Screen title={continentName(continent)} onBack={pop} backLabel="Home">
      <div className="mx-auto max-w-xl px-4 pb-safe">
        <div className="pt-4">
          <ModePicker />
        </div>
        <div className="mt-4 space-y-3 pb-6">
          <EndlessCard
            title={`Endless ${continentName(continent)}`}
            count={practiced.length}
            mastered={countMastered(practiced)}
            emptyHint="Practice a level first; its countries will show up here"
            onOpen={() => push({ name: 'practice', scope: { kind: 'continent', continent }, mode })}
          />
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              result={resultFor(mode, level)}
              mastered={countMastered(level.countries.map((c) => c.id))}
              unlocked={isUnlocked(mode, level)}
              onOpen={() => push({ name: 'level', continent, level: level.number })}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}
