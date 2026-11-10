import type { ContinentId } from '../../atlas/types';

/** Which countries an endless session draws from. */
export type PracticeScope =
  | { kind: 'level'; continent: ContinentId; level: number }
  | { kind: 'continent'; continent: ContinentId }
  | { kind: 'all' };
