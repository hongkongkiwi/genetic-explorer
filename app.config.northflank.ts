import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  server: {
    preset: 'node-server',
  },
  // Northflank-specific configuration
  // Uses standard Node.js server preset with persistent storage
})
