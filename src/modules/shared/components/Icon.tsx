import type { SVGProps } from 'react';

const paths = {
  back: 'M15 18l-6-6 6-6',
  forward: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
  globe:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9h17M3.5 15h17M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  zoomIn: 'M12 5v14M5 12h14',
  infinity: 'M12 12c-2-2.6-3.6-4-5.6-4a4 4 0 0 0 0 8c2 0 3.6-1.4 5.6-4zm0 0c2 2.6 3.6 4 5.6 4a4 4 0 0 0 0-8c-2 0-3.6 1.4-5.6 4z',
} as const;

export type IconName = keyof typeof paths;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className = 'h-5 w-5', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function StarIcon({ filled, className = 'h-4 w-4' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        className={filled ? 'fill-amber-400' : 'fill-slate-300 dark:fill-slate-700'}
      />
    </svg>
  );
}
