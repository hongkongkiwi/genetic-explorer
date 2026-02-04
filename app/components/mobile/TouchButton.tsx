import { cn } from '~/utils/shared/cn';
import { forwardRef } from 'react';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    fullWidth = false,
    className,
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
      outline: 'border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98] transform',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';
