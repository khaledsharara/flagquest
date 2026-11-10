import { Flag, useAtlas } from '../../atlas';
import { Button, Icon, cn } from '../../shared';
import type { Question } from '../types';

interface AnswerFeedbackProps {
  question: Question;
  chosenId: string;
  onContinue: () => void;
}

function describeGuess(question: Question, guessName: string, guessCapital: string): string {
  switch (question.type) {
    case 'name-flag':
      return `You picked the flag of ${guessName}.`;
    case 'name-shape':
      return `You picked the shape of ${guessName}.`;
    case 'capital':
      return `${guessCapital} is the capital of ${guessName}.`;
    case 'locate':
      return `You tapped ${guessName}.`;
    default:
      return `You picked ${guessName}.`;
  }
}

export function AnswerFeedback({ question, chosenId, onContinue }: AnswerFeedbackProps) {
  const atlas = useAtlas();
  const correct = chosenId === question.country.id;
  const guess = atlas.byId.get(chosenId);
  const { country } = question;
  return (
    <div className="mx-auto max-w-xl pb-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white',
            correct ? 'bg-emerald-500' : 'bg-rose-500',
          )}
        >
          <Icon name={correct ? 'check' : 'close'} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn('font-bold', correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            {correct ? 'Correct!' : 'Not quite'}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Flag country={country} className="h-3.5 shrink-0" />
            <span className="truncate">
              <span className="font-semibold">{country.name}</span> · {country.capital}
            </span>
          </div>
        </div>
        <Button onClick={onContinue} className="shrink-0">
          Next
        </Button>
      </div>
      {!correct && guess && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{describeGuess(question, guess.name, guess.capital)}</p>
      )}
    </div>
  );
}
