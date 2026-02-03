import { defineConfig } from '@tanstack/start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    preset: 'cloudflare-pages',
    unenv: {
      // Cloudflare Workers specific configuration
      external: ['node:crypto', 'node:buffer', 'node:stream', 'node:util', 'node:events'],
    },
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    build: {
      rollupOptions: {
        external: ['better-sqlite3'],
      },
    },
  },
})
