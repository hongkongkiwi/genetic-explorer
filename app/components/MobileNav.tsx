import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '~/utils/cn';
import { Home, Upload, Dna, Search, Users, FileText, Database, LayoutDashboard } from 'lucide-react';
import { useAuth } from '~/hooks/useAuth';

export function MobileNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isAuthenticated } = useAuth();

  const navItems = isAuthenticated ? [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/genomes', icon: Dna, label: 'Genomes' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/explorer', icon: Search, label: 'Explore' },
  ] : [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/login', icon: Users, label: 'Sign In' },
  ];

  const isAuthPage = currentPath === '/login' || currentPath === '/register' || 
                     currentPath === '/forgot-password' || currentPath === '/reset-password';

  if (isAuthPage) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sm:hidden safe-area-pb"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 min-w-0 px-1 touch-target',
                isActive
                  ? 'text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn(
                'relative flex items-center justify-center',
                isActive && 'after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-indigo-600 after:rounded-full'
              )}>
                <item.icon 
                  className={cn(
                    'w-5 h-5 transition-all',
                    isActive ? 'fill-current' : ''
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className="text-[10px] font-medium truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
