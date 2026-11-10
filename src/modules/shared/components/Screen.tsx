import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '../utils/cn';

interface ScreenProps {
  title?: ReactNode;
  /** Shows a back button in the header when provided. */
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** When false the body does not scroll (the content manages its own layout). */
  scroll?: boolean;
  bodyClassName?: string;
}

/** Full-height page layout with a safe-area aware header, scrolling body and optional footer. */
export function Screen({ title, onBack, backLabel = 'Back', right, footer, children, scroll = true, bodyClassName }: ScreenProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe shrink-0 border-b border-slate-200/70 bg-slate-50/90 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90">
        <div className="relative flex h-12 items-center px-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="relative z-10 flex h-11 items-center gap-0.5 rounded-lg pl-1 pr-3 text-[17px] text-indigo-600 active:opacity-60 dark:text-indigo-400"
            >
              <Icon name="back" className="h-6 w-6" />
              <span className="max-w-[7rem] truncate">{backLabel}</span>
            </button>
          )}
          <div className="pointer-events-none absolute inset-x-24 truncate text-center text-[17px] font-semibold">{title}</div>
          <div className="relative z-10 ml-auto flex items-center">{right}</div>
        </div>
      </header>
      <main
        className={cn(
          'min-h-0 flex-1',
          scroll ? 'overflow-y-auto overscroll-contain' : 'flex flex-col overflow-hidden',
          bodyClassName,
        )}
      >
        {children}
      </main>
      {footer && (
        <footer className="pb-safe shrink-0 border-t border-slate-200/70 bg-slate-50/95 px-4 pt-3 dark:border-slate-800/70 dark:bg-slate-950/95">
          {footer}
        </footer>
      )}
    </div>
  );
}
