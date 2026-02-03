import { cn } from '~/utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
    destructive: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    destructive: XCircle,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        variants[variant],
        className
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
}
