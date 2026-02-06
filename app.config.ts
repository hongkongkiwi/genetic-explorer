import { defineConfig } from '@tanstack/start/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import { sentryStubPlugin } from './app/lib/vite-plugin-sentry-stub'

// Platform-specific configurations
const platformConfigs: Record<string, any> = {
  node: {
    preset: 'node-server',
    vitePlugins: [sentryStubPlugin()],
  },
  vercel: {
    preset: 'vercel',
    vitePlugins: [],
  },
  cloudflare: {
    preset: 'cloudflare-pages',
    unenv: {
      external: ['node:crypto', 'node:buffer', 'node:stream', 'node:util', 'node:events'],
    },
    viteConfig: {
      build: {
        rollupOptions: {
          external: ['better-sqlite3'],
        },
      },
    },
  },
  netlify: {
    preset: 'netlify',
    vitePlugins: [],
  },
  fly: {
    preset: 'node-server',
    vitePlugins: [sentryStubPlugin()],
  },
  railway: {
    preset: 'node-server',
    vitePlugins: [sentryStubPlugin()],
  },
  heroku: {
    preset: 'node-server',
    vitePlugins: [sentryStubPlugin()],
  },
  digitalocean: {
    preset: 'node-server',
    vitePlugins: [sentryStubPlugin()],
  },
  northflank: {
    preset: 'node-server',
    vitePlugins: [sentryStubPlugin()],
  },
}

// Detect platform from environment variable
const platform = process.env.DEPLOYMENT_PLATFORM || 'node'
const config = platformConfigs[platform] || platformConfigs.node

export default defineConfig({
  server: {
    preset: config.preset,
    ...(config.unenv && { unenv: config.unenv }),
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      ...(config.vitePlugins || []),
    ],
    ...(config.viteConfig || {}),
  },
})
