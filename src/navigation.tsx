import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ContinentId } from './modules/atlas/types';
import type { Mode } from './modules/levels/types';
import type { PracticeScope } from './modules/practice/types';

export type Route =
  | { name: 'home' }
  | { name: 'continent'; continent: ContinentId }
  | { name: 'level'; continent: ContinentId; level: number }
  | { name: 'quiz'; continent: ContinentId; level: number; mode: Mode }
  | { name: 'practice'; scope: PracticeScope; mode: Mode }
  | { name: 'atlas' }
  | { name: 'country'; ids: string[]; index: number };

export interface StackEntry {
  key: number;
  route: Route;
}

interface Navigation {
  stack: StackEntry[];
  push: (route: Route) => void;
  pop: () => void;
  replace: (route: Route) => void;
}

const NavigationContext = createContext<Navigation | null>(null);

let nextKey = 1;

/** Minimal stack navigator: pages stay mounted underneath so they keep their scroll position. */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<StackEntry[]>([{ key: 0, route: { name: 'home' } }]);
  const push = useCallback((route: Route) => setStack((s) => [...s, { key: nextKey++, route }]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const replace = useCallback(
    (route: Route) => setStack((s) => [...s.slice(0, -1), { key: nextKey++, route }]),
    [],
  );
  const value = useMemo(() => ({ stack, push, pop, replace }), [stack, push, pop, replace]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): Navigation {
  const navigation = useContext(NavigationContext);
  if (!navigation) throw new Error('useNavigation must be used inside <NavigationProvider>');
  return navigation;
}
