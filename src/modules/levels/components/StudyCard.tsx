import { CountryShape, Flag, type Country } from '../../atlas';
import { Card } from '../../shared';

interface StudyCardProps {
  country: Country;
  onOpen: () => void;
}

export function StudyCard({ country, onOpen }: StudyCardProps) {
  return (
    <button type="button" onClick={onOpen} className="block w-full text-left transition-transform active:scale-[0.98]">
      <Card className="flex h-full flex-col p-3">
        <div className="flex items-center gap-2">
          <Flag country={country} className="min-w-0 flex-1" boxRatio={1.6} />
          <CountryShape country={country} className="h-14 w-14 shrink-0" />
        </div>
        <div className="mt-2 font-semibold leading-tight">{country.name}</div>
        <div className="text-sm leading-tight text-slate-500 dark:text-slate-400">{country.capital}</div>
      </Card>
    </button>
  );
}
