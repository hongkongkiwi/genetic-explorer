import { cn } from '~/utils/shared/cn';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  className?: string;
}

export function PageHeader({ title, description, backTo, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
      )}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
}
