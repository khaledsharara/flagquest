import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl bg-white ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800', className)}
      {...rest}
    />
  );
}
