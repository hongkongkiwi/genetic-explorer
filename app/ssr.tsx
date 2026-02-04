/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/start/server'
import { getRouterManifest } from '@tanstack/start/router-manifest'
import { createRouter } from './router'
import { initMonitoring, shutdownMonitoring } from './utils/initMonitoring'

// Initialize monitoring on server startup
initMonitoring()

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await shutdownMonitoring()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await shutdownMonitoring()
  process.exit(0)
})

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler)
