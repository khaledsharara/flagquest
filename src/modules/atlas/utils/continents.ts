import type { ContinentId, ContinentInfo } from '../types';

export const CONTINENTS: Record<ContinentId, ContinentInfo> = {
  europe: { id: 'europe', name: 'Europe', view: { center: [14, 52], bounds: [[-24, 34], [42, 71]] } },
  asia: { id: 'asia', name: 'Asia', view: { center: [88, 27], bounds: [[26, -10], [146, 55]] } },
  africa: { id: 'africa', name: 'Africa', view: { center: [18, 1], bounds: [[-26, -36], [61, 38]] } },
  'north-america': {
    id: 'north-america',
    name: 'North America',
    // Centred on Central America and the Caribbean, where most of the continent's countries are.
    view: { center: [-88, 26], bounds: [[-124, 7], [-58, 52]] },
  },
  'south-america': {
    id: 'south-america',
    name: 'South America',
    view: { center: [-60, -20], bounds: [[-82, -56], [-34, 13]] },
  },
  oceania: { id: 'oceania', name: 'Oceania', view: { center: [160, -14], bounds: [[112, -47], [-155, 14]] } },
};

export const continentName = (id: ContinentId): string => CONTINENTS[id].name;
