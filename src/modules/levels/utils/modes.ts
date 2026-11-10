import type { Mode, ModeInfo } from '../types';

export const MODES: ModeInfo[] = [
  { id: 'mixed', label: 'Mix', description: 'Flags, shapes and map questions together.' },
  { id: 'flags', label: 'Flags', description: 'Name the flag, or find the flag for a country.' },
  { id: 'shapes', label: 'Shapes', description: 'Recognise countries by their outline.' },
  { id: 'map', label: 'Map', description: 'Name highlighted countries and find them on the map.' },
  { id: 'capitals', label: 'Capitals', description: 'Match countries with their capital cities.' },
];

export const modeInfo = (mode: Mode): ModeInfo => MODES.find((m) => m.id === mode) ?? (MODES[0] as ModeInfo);
