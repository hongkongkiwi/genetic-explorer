/**
 * Route Type Definitions
 * 
 * This file provides type declarations for TanStack Router routes.
 * It helps avoid 'as any' casts when using createFileRoute.
 */

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof import('../routes/index').Route
    }
    '/about': {
      preLoaderRoute: typeof import('../routes/about').Route
    }
    '/accept-terms': {
      preLoaderRoute: typeof import('../routes/accept-terms').Route
    }
    '/carrier': {
      preLoaderRoute: typeof import('../routes/carrier').Route
    }
    '/dashboard': {
      preLoaderRoute: typeof import('../routes/dashboard').Route
    }
    '/explore': {
      preLoaderRoute: typeof import('../routes/explore').Route
    }
    '/explorer': {
      preLoaderRoute: typeof import('../routes/explorer').Route
    }
    '/features': {
      preLoaderRoute: typeof import('../routes/features').Route
    }
    '/login': {
      preLoaderRoute: typeof import('../routes/login').Route
    }
    '/not-found': {
      preLoaderRoute: typeof import('../routes/not-found').Route
    }
    '/pricing': {
      preLoaderRoute: typeof import('../routes/pricing').Route
    }
    '/privacy': {
      preLoaderRoute: typeof import('../routes/privacy').Route
    }
    '/relatives': {
      preLoaderRoute: typeof import('../routes/relatives').Route
    }
    '/reports': {
      preLoaderRoute: typeof import('../routes/reports').Route
    }
    '/settings': {
      preLoaderRoute: typeof import('../routes/settings').Route
    }
    '/sharing': {
      preLoaderRoute: typeof import('../routes/sharing').Route
    }
    '/terms': {
      preLoaderRoute: typeof import('../routes/terms').Route
    }
    '/traits': {
      preLoaderRoute: typeof import('../routes/traits').Route
    }
    '/upload': {
      preLoaderRoute: typeof import('../routes/upload').Route
    }
    '/verify-2fa': {
      preLoaderRoute: typeof import('../routes/verify-2fa').Route
    }
    '/whats-new': {
      preLoaderRoute: typeof import('../routes/whats-new').Route
    }
    '/ancestry': {
      preLoaderRoute: typeof import('../routes/ancestry').Route
    }
    '/auth/magic': {
      preLoaderRoute: typeof import('../routes/auth/magic').Route
    }
    '/login/magic': {
      preLoaderRoute: typeof import('../routes/login/magic').Route
    }
    '/settings/authorized-apps': {
      preLoaderRoute: typeof import('../routes/settings/authorized-apps').Route
    }
    '/settings/cookies': {
      preLoaderRoute: typeof import('../routes/settings/cookies').Route
    }
    '/settings/notifications': {
      preLoaderRoute: typeof import('../routes/settings/notifications').Route
    }
    '/settings/privacy': {
      preLoaderRoute: typeof import('../routes/settings/privacy').Route
    }
  }
}

export {};
