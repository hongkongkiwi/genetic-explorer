import { forwardRef } from 'react';
import { cn } from '~/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, padding = 'md', children, ...props }, ref) => {
    const paddings = {
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
          hoverable && 'hover:shadow-md transition-shadow',
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
