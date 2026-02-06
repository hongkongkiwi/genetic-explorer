/**
 * Vite plugin to stub @sentry/node for client builds
 */
export function sentryStubPlugin() {
  return {
    name: 'sentry-stub',
    enforce: 'pre' as const,
    resolveId(id: string) {
      // Stub @sentry/node and @sentry/node-core for client builds
      if (id === '@sentry/node' || id === '@sentry/node-core') {
        return './app/lib/sentry-node-stub.ts';
      }
      return null;
    },
  };
}
