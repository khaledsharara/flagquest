import { CountryChip, type Country } from '../../atlas';
import { Button, Card, ProgressBar } from '../../shared';

interface PracticeSummaryProps {
  answered: number;
  correct: number;
  bestStreak: number;
  mastered: number;
  total: number;
  newlyMastered: Country[];
  needsWork: Country[];
  onContinue: () => void;
  onFinish: () => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-3 text-center">
      <div className="font-rounded text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
    </Card>
  );
}

function ChipSection({ title, countries }: { title: string; countries: Country[] }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {countries.map((c) => (
          <CountryChip key={c.id} country={c} />
        ))}
      </div>
    </div>
  );
}

export function PracticeSummary(props: PracticeSummaryProps) {
  const { answered, correct, bestStreak, mastered, total, newlyMastered, needsWork, onContinue, onFinish } = props;
  const allMastered = mastered === total;
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-center font-rounded text-3xl font-bold">{allMastered ? 'Everything mastered!' : 'Nice practice!'}</h1>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Answered" value={answered} />
        <Stat label="Right" value={`${Math.round((correct / Math.max(answered, 1)) * 100)}%`} />
        <Stat label="Best streak" value={bestStreak} />
      </div>
      <Card className="mt-3 p-4">
        <div className="flex justify-between text-sm font-semibold">
          <span>Mastered</span>
          <span className="tabular-nums">
            {mastered} / {total}
          </span>
        </div>
        <ProgressBar value={mastered / total} className="mt-2" />
      </Card>
      {newlyMastered.length > 0 && <ChipSection title="Newly mastered" countries={newlyMastered} />}
      {needsWork.length > 0 && <ChipSection title="Needs more work" countries={needsWork} />}
      <div className="mt-8 space-y-3">
        <Button block onClick={onContinue}>
          Keep going
        </Button>
        <Button block variant="secondary" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
}
