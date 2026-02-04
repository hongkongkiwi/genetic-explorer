/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/start'
import { createRouter } from './router'
import { initMonitoring } from './utils/initMonitoring'

// Initialize monitoring (Sentry, logging)
initMonitoring()

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)

// Handle graceful shutdown
window.addEventListener('beforeunload', () => {
  import('./utils/initMonitoring').then(({ shutdownMonitoring }) => {
    shutdownMonitoring()
  })
})
