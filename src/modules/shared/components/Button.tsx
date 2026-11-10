import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white active:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700',
  secondary:
    'bg-white text-slate-900 ring-1 ring-slate-200 active:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:active:bg-slate-800',
  ghost: 'text-indigo-600 active:bg-indigo-50 dark:text-indigo-400 dark:active:bg-slate-900',
};

export function Button({ variant = 'primary', block, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition-colors',
        variants[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}
