/**
 * Breadcrumb Navigation Component
 * 
 * Provides hierarchical navigation for nested pages.
 * Helps users understand their location and navigate back to parent pages.
 * 
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'Reports', href: '/reports' },
 *   { label: 'Health Analysis', href: '/report/123' },
 * ]} />
 * ```
 */

import { Link } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '~/utils/shared/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
              
              {isLast || !item.href ? (
                <span 
                  className={cn(
                    'font-medium',
                    isLast 
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-slate-600 dark:text-slate-300'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Predefined breadcrumb configurations for common page hierarchies
 */
export const predefinedBreadcrumbs = {
  report: (reportName?: string) => [
    { label: 'Reports', href: '/reports' },
    { label: reportName || 'Health Report' },
  ],
  ancestry: (reportName?: string) => [
    { label: 'Reports', href: '/reports' },
    { label: reportName || 'Ancestry Report' },
  ],
  carrier: (conditionName?: string) => [
    { label: 'Carrier Status', href: '/carrier' },
    { label: conditionName || 'Condition Details' },
  ],
  traits: (traitName?: string) => [
    { label: 'Traits', href: '/traits' },
    { label: traitName || 'Trait Details' },
  ],
  settings: {
    root: () => [
      { label: 'Settings' },
    ],
    security: () => [
      { label: 'Settings', href: '/settings' },
      { label: 'Security' },
    ],
    privacy: () => [
      { label: 'Settings', href: '/settings' },
      { label: 'Privacy' },
    ],
    sessions: () => [
      { label: 'Settings', href: '/settings' },
      { label: 'Active Sessions' },
    ],
    twoFactor: () => [
      { label: 'Settings', href: '/settings' },
      { label: 'Two-Factor Authentication' },
    ],
  },
  explorer: () => [
    { label: 'SNP Explorer' },
  ],
  upload: () => [
    { label: 'Upload Genome' },
  ],
  profile: () => [
    { label: 'Profile' },
  ],
  notifications: () => [
    { label: 'Notifications' },
  ],
  activity: () => [
    { label: 'Activity Log' },
  ],
  sharing: () => [
    { label: 'Family Sharing' },
  ],
  relatives: () => [
    { label: 'DNA Relatives' },
  ],
  research: () => [
    { label: 'Research' },
  ],
};
