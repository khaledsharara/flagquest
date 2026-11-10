export function formatPopulation(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} billion`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 0 : 1)} million`;
  if (value >= 1e3) return `${Math.round(value / 1e3)} thousand`;
  return value.toLocaleString('en-US');
}

export const formatArea = (km2: number): string => `${Math.round(km2).toLocaleString('en-US')} km²`;
