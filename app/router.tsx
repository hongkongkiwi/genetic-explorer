import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query'

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    defaultErrorComponent: ({ error }) => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">404</h1>
          <p className="text-slate-600">Page not found</p>
        </div>
      </div>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
