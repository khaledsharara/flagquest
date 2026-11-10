import type { Mode, ModeInfo, Skill } from '../types';

export const MODES: ModeInfo[] = [
  { id: 'mixed', label: 'Mix', description: 'Flags, shapes and map questions together.' },
  { id: 'flags', label: 'Flags', description: 'Name the flag, or find the flag for a country.' },
  { id: 'shapes', label: 'Shapes', description: 'Recognize countries by their outline.' },
  { id: 'map', label: 'Map', description: 'Name highlighted countries and find them on the map.' },
  { id: 'capitals', label: 'Capitals', description: 'Match countries with their capital cities.' },
];

/** Skills a mode practices. A country counts as mastered in a mode once every skill is mastered. */
export const MODE_SKILLS: Record<Mode, Skill[]> = {
  mixed: ['flags', 'shapes', 'map'],
  flags: ['flags'],
  shapes: ['shapes'],
  map: ['map'],
  capitals: ['capitals'],
};

export const modeInfo = (mode: Mode): ModeInfo => MODES.find((m) => m.id === mode) ?? (MODES[0] as ModeInfo);
