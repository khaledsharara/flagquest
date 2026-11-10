import { useEffect, useState } from 'react';
import { useAtlas } from '../../atlas';
import { Card, Icon } from '../../shared';
import { useNavigation } from '../../../navigation';
import { ContinentCard } from '../components/ContinentCard';
import { ModePicker } from '../components/ModePicker';
import { useProgress } from '../components/ProgressProvider';
import { levelsOf } from '../utils/levels';

export function HomePage() {
  const atlas = useAtlas();
  const { mode, resultFor } = useProgress();
  const { push } = useNavigation();

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="pt-safe pb-safe mx-auto max-w-xl px-4">
        <header className="pb-5 pt-8">
          <h1 className="font-rounded text-4xl font-bold tracking-tight">FlagQuest</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Learn the world's flags, shapes and places.</p>
        </header>

        <ModePicker />

        <div className="mt-5 space-y-3">
          {atlas.continents.map((continent) => {
            const levels = levelsOf(atlas, continent);
            return (
              <ContinentCard
                key={continent}
                continent={continent}
                levels={levels}
                results={levels.map((l) => resultFor(mode, l))}
                onOpen={() => push({ name: 'continent', continent })}
              />
            );
          })}
        </div>

        <button type="button" onClick={() => push({ name: 'atlas' })} className="mt-3 block w-full text-left">
          <Card className="flex items-center gap-3 p-4 active:bg-slate-50 dark:active:bg-slate-800">
            <Icon name="book" className="h-6 w-6 text-indigo-500" />
            <div className="flex-1">
              <div className="font-semibold">Atlas</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Browse and search all {atlas.countries.length} countries</div>
            </div>
            <Icon name="forward" className="h-5 w-5 text-slate-400" />
          </Card>
        </button>

        <ResetProgressButton />

        <p className="pb-6 pt-2 text-center text-xs leading-relaxed text-slate-400">
          Maps: Natural Earth · Flags: public domain · Country facts: mledoze/countries (ODbL)
        </p>
      </div>
    </div>
  );
}

function ResetProgressButton() {
  const { resetProgress } = useProgress();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <div className="mt-8 text-center">
      <button
        type="button"
        onClick={() => {
          if (armed) {
            resetProgress();
            setArmed(false);
          } else setArmed(true);
        }}
        className={armed ? 'text-sm font-semibold text-rose-600' : 'text-sm text-slate-400'}
      >
        {armed ? 'Tap again to erase all stars' : 'Reset progress'}
      </button>
    </div>
  );
}
