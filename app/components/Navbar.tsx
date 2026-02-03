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
  Globe,
  Dna as DnaIcon,
  Heart,
  Users2,
  Menu,
  X
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

interface NavItem {
  to: string;
  icon: typeof Home;
  label: string;
  children?: { to: string; icon: typeof Home; label: string }[];
}

export function Navbar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user, isAuthenticated, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [isInsightsDropdownOpen, setIsInsightsDropdownOpen] = useState(false);
  const { isOpen: isSearchOpen, setIsOpen: setIsSearchOpen } = useGlobalSearch();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const reportsDropdownRef = useRef<HTMLDivElement>(null);
  const insightsDropdownRef = useRef<HTMLDivElement>(null);

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
      if (reportsDropdownRef.current && !reportsDropdownRef.current.contains(event.target as Node)) {
        setIsReportsDropdownOpen(false);
      }
      if (insightsDropdownRef.current && !insightsDropdownRef.current.contains(event.target as Node)) {
        setIsInsightsDropdownOpen(false);
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

  const mainNavItems: NavItem[] = isAuthenticated ? [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/genomes', icon: Dna, label: 'Genomes' },
  ] : [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/faq', icon: Activity, label: 'FAQ' },
    { to: '/contact', icon: Bell, label: 'Contact' },
  ];

  const reportsDropdownItems = [
    { to: '/reports', icon: FileText, label: 'Health Reports' },
    { to: '/ancestry', icon: Globe, label: 'Ancestry' },
    { to: '/traits', icon: DnaIcon, label: 'Traits' },
    { to: '/carrier', icon: Heart, label: 'Carrier Status' },
  ];

  const insightsDropdownItems = [
    { to: '/explorer', icon: Search, label: 'Explorer' },
    { to: '/research', icon: Database, label: 'Research' },
    { to: '/relatives', icon: Users2, label: 'DNA Relatives' },
  ];

  const isReportsActive = reportsDropdownItems.some(item => 
    currentPath === item.to || currentPath.startsWith(`${item.to}/`)
  );
  
  const isInsightsActive = insightsDropdownItems.some(item => 
    currentPath === item.to || currentPath.startsWith(`${item.to}/`)
  );

  const isWhatsNewActive = currentPath === '/whats-new';
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(currentPath);

  // Don't show navbar on auth pages
  if (isAuthPage) return null;

  return (
    <>
      <nav 
        className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 safe-area-pt"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group touch-target">
              <div className="w-7 h-7 sm:w-8 sm:h-8">
                <DNALogo size={28} />
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                <span className="hidden sm:inline">Genetic Explorer</span>
                <span className="sm:hidden">GenExp</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all mr-2"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                  ⌘K
                </kbd>
              </button>

              {mainNavItems.map((item) => {
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
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}

              {/* Reports Dropdown */}
              {isAuthenticated && (
                <div className="relative" ref={reportsDropdownRef}>
                  <button
                    onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isReportsActive || isReportsDropdownOpen
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                    )}
                    aria-expanded={isReportsDropdownOpen}
                    aria-haspopup="true"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden xl:inline">Reports</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', isReportsDropdownOpen && 'rotate-180')} />
                  </button>

                  {isReportsDropdownOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
                      role="menu"
                    >
                      {reportsDropdownItems.map((item) => {
                        const isActive = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsReportsDropdownOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            )}
                            role="menuitem"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Insights Dropdown */}
              {isAuthenticated && (
                <div className="relative" ref={insightsDropdownRef}>
                  <button
                    onClick={() => setIsInsightsDropdownOpen(!isInsightsDropdownOpen)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isInsightsActive || isInsightsDropdownOpen
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                    )}
                    aria-expanded={isInsightsDropdownOpen}
                    aria-haspopup="true"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden xl:inline">Insights</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', isInsightsDropdownOpen && 'rotate-180')} />
                  </button>

                  {isInsightsDropdownOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
                      role="menu"
                    >
                      {insightsDropdownItems.map((item) => {
                        const isActive = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsInsightsDropdownOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            )}
                            role="menuitem"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
                <span className="hidden xl:inline">What's New</span>
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
                      <span className="hidden xl:inline max-w-[100px] truncate">
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
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 touch-target"
                          role="menuitem"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>

                        <Link
                          to="/sharing"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 touch-target"
                          role="menuitem"
                        >
                          <Users className="w-4 h-4" />
                          Family Sharing
                        </Link>

                        <Link
                          to="/notifications"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 touch-target"
                          role="menuitem"
                        >
                          <Bell className="w-4 h-4" />
                          Notifications
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 touch-target"
                          role="menuitem"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          Settings
                        </Link>

                        <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 touch-target"
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
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link
                      to="/login"
                      className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 touch-target"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors touch-target"
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
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
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

              {mainNavItems.map((item) => {
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

              {/* Mobile Reports Section */}
              {isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Reports
                  </p>
                  {reportsDropdownItems.map((item) => {
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
                </div>
              )}

              {/* Mobile Insights Section */}
              {isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Insights
                  </p>
                  {insightsDropdownItems.map((item) => {
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
                </div>
              )}

              <Link
                to="/whats-new"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg font-medium mt-4',
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
