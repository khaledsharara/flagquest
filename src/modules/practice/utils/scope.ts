import { continentName, type Atlas, type Country } from '../../atlas';
import { getLevel } from '../../levels';
import type { PracticeScope } from '../types';

/** Countries for a session: a level's countries, or the countries already practiced (in a continent or anywhere). */
export function scopeCountries(atlas: Atlas, scope: PracticeScope, practicedIds: ReadonlySet<string>): Country[] {
  switch (scope.kind) {
    case 'level':
      return getLevel(atlas, scope.continent, scope.level)?.countries ?? [];
    case 'continent':
      return atlas.countries.filter((c) => c.continent === scope.continent && practicedIds.has(c.id));
    case 'all':
      return atlas.countries.filter((c) => practicedIds.has(c.id));
  }
}

export function scopeLabel(scope: PracticeScope): string {
  switch (scope.kind) {
    case 'level':
      return `${continentName(scope.continent)} · Level ${scope.level}`;
    case 'continent':
      return continentName(scope.continent);
    case 'all':
      return 'Everything practiced';
  }
}
