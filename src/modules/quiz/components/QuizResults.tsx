import { CountryChip, type Country } from '../../atlas';
import { Button, Stars } from '../../shared';

interface QuizResultsProps {
  correct: number;
  total: number;
  stars: number;
  missed: Country[];
  canContinue: boolean;
  onRetry: () => void;
  onNext: () => void;
  onExit: () => void;
}

const messages = ['Keep practicing', 'Level passed!', 'Great job!', 'Perfect!'];

export function QuizResults({ correct, total, stars, missed, canContinue, onRetry, onNext, onExit }: QuizResultsProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-8 text-center">
      <Stars count={stars} size="lg" className="animate-pop" />
      <h1 className="mt-4 font-rounded text-3xl font-bold">{messages[stars]}</h1>
      <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">
        {correct} of {total} right on the first try ({Math.round((correct / total) * 100)}%)
      </p>
      {stars === 0 && (
        <p className="mt-1 text-sm text-slate-400">Score 60% or more to earn a star and unlock the next level.</p>
      )}

      {missed.length > 0 && (
        <div className="mt-6 w-full text-left">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">To review</h2>
          <div className="flex flex-wrap gap-2">
            {missed.map((c) => (
              <CountryChip key={c.id} country={c} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 w-full space-y-3">
        {canContinue && (
          <Button block onClick={onNext}>
            Next level
          </Button>
        )}
        <Button block variant={canContinue ? 'secondary' : 'primary'} onClick={onRetry}>
          Try again
        </Button>
        <Button block variant="ghost" onClick={onExit}>
          Back to level
        </Button>
      </div>
    </div>
  );
}
