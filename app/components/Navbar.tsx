import { Link, useRouterState } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { DNALogo } from './DNALogo';
import { UpdateNotificationCenter } from './UpdateNotification';
import { useAuth } from '~/hooks/useAuth';
import { GlobalSearch, useGlobalSearch } from './GlobalSearch';
import { 
  Upload, 
  FileText, 
  Activity, 
  Dna, 
  Home, 
  Search, 
  Database, 
  Sparkles, 
  User, 
  LogOut, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  ChevronDown,
  LayoutDashboard,
  Keyboard,
  Command
} from 'lucide-react';
import { cn } from '~/utils/cn';
import type { SNPStatus } from './SNPBadge';

interface NotificationItem {
  id: string;
  type: SNPStatus;
  title: string;
  description: string;
  relatedSnp?: string;
  actionLink?: string;
  actionText?: string;
  timestamp: Date;
}

// Mock notifications - in production these would come from an API
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'major-update',
    title: 'MTHFR Research Updated',
    description: '3 new studies added for rs1801133',
    relatedSnp: 'rs1801133',
    actionLink: '/whats-new',
    actionText: 'View details',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'new',
    title: 'New SNP Added',
    description: 'FTO variant for weight management',
    relatedSnp: 'rs9939609',
    actionLink: '/whats-new',
    actionText: 'Learn more',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export function Navbar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user, isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isOpen: isSearchOpen, setIsOpen: setIsSearchOpen } = useGlobalSearch();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDismissAll = () => {
    setNotifications([]);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const navItems = isAuthenticated ? [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/genomes', icon: Dna, label: 'Genomes' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/explorer', icon: Search, label: 'Explorer' },
    { to: '/research', icon: Database, label: 'Research' },
  ] : [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/faq', icon: Activity, label: 'FAQ' },
    { to: '/contact', icon: Bell, label: 'Contact' },
  ];

  const isWhatsNewActive = currentPath === '/whats-new';
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(currentPath);

  // Don't show navbar on auth pages
  if (isAuthPage) return null;

  return (
    <>
      <nav 
        className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <DNALogo size={32} />
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                Genetic Explorer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all mr-2"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                  ⌘K
                </kbd>
              </button>

              {navItems.map((item) => {
                const isActive = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}

              {/* What's New Link */}
              <Link
                to="/whats-new"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isWhatsNewActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                )}
                aria-current={isWhatsNewActive ? 'page' : undefined}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">What's New</span>
              </Link>

              {/* Update Notifications */}
              <div className="ml-2 border-l border-slate-200 dark:border-slate-700 pl-2">
                <UpdateNotificationCenter
                  notifications={notifications}
                  onDismiss={handleDismiss}
                  onDismissAll={handleDismissAll}
                />
              </div>

              {/* User Menu */}
              <div className="ml-2 border-l border-slate-200 dark:border-slate-700 pl-2" ref={userMenuRef}>
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isUserMenuOpen
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                      )}
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden lg:inline max-w-[100px] truncate">
                        {user?.displayName || user?.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {isUserMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
                        role="menu"
                      >
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {user?.displayName || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          role="menuitem"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>

                        <Link
                          to="/sharing"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          role="menuitem"
                        >
                          <Users className="w-4 h-4" />
                          Family Sharing
                        </Link>

                        <Link
                          to="/notifications"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          role="menuitem"
                        >
                          <Bell className="w-4 h-4" />
                          Notifications
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          role="menuitem"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          Settings
                        </Link>

                        <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            role="menuitem"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={cn(
                  "w-full h-0.5 bg-current transition-transform",
                  isMobileMenuOpen && "rotate-45 translate-y-1.5"
                )} />
                <span className={cn(
                  "w-full h-0.5 bg-current transition-opacity",
                  isMobileMenuOpen && "opacity-0"
                )} />
                <span className={cn(
                  "w-full h-0.5 bg-current transition-transform",
                  isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
                )} />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 mb-2"
              >
                <Search className="w-5 h-5" />
                Search
                <kbd className="ml-auto px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">⌘K</kbd>
              </button>
              {navItems.map((item) => {
                const isActive = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg font-medium',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/whats-new"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg font-medium mt-2',
                  isWhatsNewActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <Sparkles className="w-5 h-5" />
                What's New
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Global Search */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
