import { useMemo, useState } from 'react';
import { Icon, Screen } from '../../shared';
import { useNavigation } from '../../../navigation';
import { useAtlas } from '../components/AtlasProvider';
import { Flag } from '../components/Flag';
import { continentName } from '../utils/continents';
import { matchesQuery } from '../utils/search';

export function AtlasPage() {
  const atlas = useAtlas();
  const { pop, push } = useNavigation();
  const [query, setQuery] = useState('');

  const sections = useMemo(
    () =>
      atlas.continents
        .map((continent) => ({
          continent,
          countries: atlas.countries
            .filter((c) => c.continent === continent && matchesQuery(c, query))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((s) => s.countries.length > 0),
    [atlas, query],
  );
  const ids = sections.flatMap((s) => s.countries.map((c) => c.id));

  return (
    <Screen title="Atlas" onBack={pop} backLabel="Home">
      <div className="sticky top-0 z-10 bg-slate-50/95 px-4 py-3 backdrop-blur dark:bg-slate-950/95">
        <label className="flex items-center gap-2 rounded-xl bg-slate-200/70 px-3 py-2 dark:bg-slate-800">
          <Icon name="search" className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Country or capital"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
          />
        </label>
      </div>
      <div className="mx-auto max-w-xl px-4 pb-safe">
        {sections.length === 0 && <p className="py-10 text-center text-slate-400">No country matches “{query}”.</p>}
        {sections.map((section) => (
          <section key={section.continent} className="pb-4">
            <h2 className="pb-2 pt-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {continentName(section.continent)}
            </h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
              {section.countries.map((country) => (
                <li key={country.id}>
                  <button
                    type="button"
                    onClick={() => push({ name: 'country', ids, index: ids.indexOf(country.id) })}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left active:bg-slate-100 dark:active:bg-slate-800"
                  >
                    <Flag country={country} className="w-10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{country.name}</div>
                      <div className="truncate text-sm text-slate-500 dark:text-slate-400">{country.capital}</div>
                    </div>
                    <Icon name="forward" className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Screen>
  );
}
