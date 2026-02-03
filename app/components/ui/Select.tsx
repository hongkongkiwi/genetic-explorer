import { forwardRef } from 'react';
import { cn } from '~/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, helperText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full rounded-lg border shadow-sm transition-colors appearance-none',
              'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100',
              'dark:bg-slate-800 dark:text-white pr-10',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
                : 'border-slate-300 dark:border-slate-600',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        {error && (
          <p 
            id={`${selectId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p 
            id={`${selectId}-helper`}
            className="mt-1 text-sm text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
