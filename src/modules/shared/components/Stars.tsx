import { StarIcon } from './Icon';
import { cn } from '../utils/cn';

interface StarsProps {
  count: number;
  size?: 'sm' | 'lg';
  className?: string;
}

export function Stars({ count, size = 'sm', className }: StarsProps) {
  const iconClass = size === 'lg' ? 'h-12 w-12' : 'h-4 w-4';
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <StarIcon key={i} filled={i < count} className={iconClass} />
      ))}
    </div>
  );
}
