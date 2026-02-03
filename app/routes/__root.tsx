import { createRootRoute, HeadContent, Scripts, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '~/hooks/useAuth';
import { CsrfProvider } from '~/hooks/useCsrf';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';
import { MobileNav } from '~/components/MobileNav';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { OnboardingModal } from '~/components/Onboarding';
import { useAppShortcuts, KeyboardShortcutsModal, useShortcutsModal } from '~/hooks/useKeyboardShortcuts';
import { useEffect, useState } from 'react';
import appCss from '~/styles.css?url';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Genetic Explorer - AI-Powered Genetic Analysis' },
      { name: 'description', content: 'Upload your genetic data and get AI-powered health insights, personalized recommendations, and comprehensive genetic reports.' },
      { name: 'theme-color', content: '#4f46e5' },
      { name: 'color-scheme', content: 'light dark' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CsrfProvider>
          <ErrorBoundary>
            <AppContent mounted={mounted} />
          </ErrorBoundary>
        </CsrfProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent({ mounted }: { mounted: boolean }) {
  // Enable keyboard shortcuts
  useAppShortcuts();
  const { isOpen: shortcutsOpen, setIsOpen: setShortcutsOpen } = useShortcutsModal();

  // Handle theme (system preference)
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial check
    if (mediaQuery.matches) {
      document.documentElement.classList.add('dark');
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <html lang="en" className="h-full">
        <head>
          <HeadContent />
          <style>{`
            .no-fouc { visibility: hidden; }
            @media (prefers-color-scheme: dark) {
              html { background-color: #0f172a; }
            }
          `}</style>
        </head>
        <body className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading...</div>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-16 sm:pb-0 antialiased">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Skip to main content
        </a>

        <Navbar />
        
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          <Outlet />
        </main>
        
        <Footer />
        <MobileNav />
        
        {/* Onboarding for new users */}
        <OnboardingModal />
        
        {/* Keyboard shortcuts help modal */}
        <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        
        {/* Accessibility announcer for screen readers */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
          id="a11y-announcer"
        />
        
        <Scripts />
      </body>
    </html>
  );
}
