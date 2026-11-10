import { Flag } from './Flag';
import type { Country } from '../types';

interface CountryChipProps {
  country: Country;
  onClick?: () => void;
}

/** Small pill with a flag and a country name; a button when `onClick` is given. */
export function CountryChip({ country, onClick }: CountryChipProps) {
  const className =
    'flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-3 text-sm font-medium ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800';
  const content = (
    <>
      <Flag country={country} className="h-4" />
      {country.name}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={`${className} active:bg-slate-100 dark:active:bg-slate-800`}>
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  );
}
