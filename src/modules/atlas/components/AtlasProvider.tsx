import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Button } from '../../shared';
import { loadAtlas } from '../utils/loadAtlas';
import type { Atlas } from '../types';

const AtlasContext = createContext<Atlas | null>(null);

export function AtlasProvider({ children }: { children: ReactNode }) {
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    loadAtlas().then(setAtlas, (e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(load, [load]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-slate-500">Couldn't load the map data.</p>
        <p className="text-xs text-slate-400">{error}</p>
        <Button onClick={load}>Try again</Button>
      </div>
    );
  }
  if (!atlas) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-300 border-t-indigo-600" />
      </div>
    );
  }
  return <AtlasContext.Provider value={atlas}>{children}</AtlasContext.Provider>;
}

export function useAtlas(): Atlas {
  const atlas = useContext(AtlasContext);
  if (!atlas) throw new Error('useAtlas must be used inside <AtlasProvider>');
  return atlas;
}
