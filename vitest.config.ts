import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()] as any,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/__tests__/setup.ts'],
    include: ['app/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.vinxi', '.output'],
    pool: 'forks',
    deps: {
      optimizer: {
        web: {
          include: ['vitest > @vitest/utils', 'vitest > expect-type', 'react-email', '@react-email/render'],
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'node_modules',
        'app/__tests__',
        'app/**/*.d.ts',
        'app/**/types.ts',
      ],
    },
  } as any,
  resolve: {
    alias: {
      'entities': 'entities/lib/escape.js',
    },
  },
});
