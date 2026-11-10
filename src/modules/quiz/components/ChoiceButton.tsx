import type { ReactNode } from 'react';
import { Icon, cn } from '../../shared';
import type { OptionState } from '../types';

const styles: Record<OptionState, string> = {
  idle: 'bg-white ring-slate-200 active:bg-slate-100 dark:bg-slate-900 dark:ring-slate-800 dark:active:bg-slate-800',
  correct: 'bg-emerald-500 text-white ring-emerald-500',
  wrong: 'bg-rose-500 text-white ring-rose-500',
  dimmed: 'bg-white ring-slate-200 opacity-40 dark:bg-slate-900 dark:ring-slate-800',
};

interface ChoiceButtonProps {
  state: OptionState;
  onClick: () => void;
  children: ReactNode;
}

/** Text answer option (country name or capital). */
export function ChoiceButton({ state, onClick, children }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== 'idle'}
      className={cn(
        'flex min-h-[52px] w-full items-center justify-between gap-2 rounded-2xl px-4 py-2 text-left text-[17px] font-semibold ring-1 transition-colors',
        styles[state],
      )}
    >
      <span>{children}</span>
      {state === 'correct' && <Icon name="check" className="h-5 w-5 shrink-0" />}
      {state === 'wrong' && <Icon name="close" className="h-5 w-5 shrink-0" />}
    </button>
  );
}

const tileRing: Record<OptionState, string> = {
  idle: 'ring-1 ring-slate-200 active:bg-slate-100 dark:ring-slate-800 dark:active:bg-slate-800',
  correct: 'ring-4 ring-emerald-500',
  wrong: 'ring-4 ring-rose-500',
  dimmed: 'ring-1 ring-slate-200 opacity-40 dark:ring-slate-800',
};

/** Picture answer option (flag or shape). */
export function ChoiceTile({ state, onClick, children }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== 'idle'}
      className={cn(
        'relative flex items-center justify-center rounded-2xl bg-white p-3 transition-all dark:bg-slate-900',
        tileRing[state],
      )}
    >
      {children}
      {(state === 'correct' || state === 'wrong') && (
        <span
          className={cn(
            'absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-white',
            state === 'correct' ? 'bg-emerald-500' : 'bg-rose-500',
          )}
        >
          <Icon name={state === 'correct' ? 'check' : 'close'} className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
