/**
 * Graceful Shutdown Handler
 * 
 * Ensures the application shuts down gracefully:
 * - Stops accepting new connections
 * - Waits for existing requests to complete
 * - Closes database connections
 * - Cleans up resources
 * 
 * Use with:
 * - Kubernetes: SIGTERM before pod termination
 * - Docker: docker stop signal
 * - PM2: restart/reload
 */

import { setApplicationNotReady } from './health';
import { getDb } from '~/db';

interface ShutdownConfig {
  timeoutMs: number;           // Maximum time to wait for shutdown
  beforeShutdown?: () => void | Promise<void>;  // Custom cleanup
}

// Track active requests
let activeRequests = 0;
let isShuttingDown = false;

/**
 * Increment active request counter
 * Call at the start of each request
 */
export function incrementActiveRequests(): void {
  if (!isShuttingDown) {
    activeRequests++;
  }
}

/**
 * Decrement active request counter
 * Call at the end of each request (in finally block)
 */
export function decrementActiveRequests(): void {
  activeRequests = Math.max(0, activeRequests - 1);
}

/**
 * Get current number of active requests
 */
export function getActiveRequests(): number {
  return activeRequests;
}

/**
 * Check if application is shutting down
 */
export function isShutdownInProgress(): boolean {
  return isShuttingDown;
}

/**
 * Perform graceful shutdown
 */
export async function gracefulShutdown(config: ShutdownConfig): Promise<void> {
  console.log(`🛑 Starting graceful shutdown (timeout: ${config.timeoutMs}ms)...`);
  
  isShuttingDown = true;
  
  // Mark application as not ready (readiness probe will fail)
  setApplicationNotReady();
  console.log('✅ Application marked as not ready');
  
  // Wait for active requests to complete (with timeout)
  const startTime = Date.now();
  while (activeRequests > 0) {
    const elapsed = Date.now() - startTime;
    const remaining = config.timeoutMs - elapsed;
    
    if (remaining <= 0) {
      console.warn(`⚠️ Shutdown timeout reached with ${activeRequests} active requests`);
      break;
    }
    
    console.log(`⏳ Waiting for ${activeRequests} active requests to complete...`);
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, remaining)));
  }
  
  if (activeRequests === 0) {
    console.log('✅ All active requests completed');
  }
  
  // Run custom cleanup
  if (config.beforeShutdown) {
    try {
      console.log('🧹 Running custom cleanup...');
      await config.beforeShutdown();
      console.log('✅ Custom cleanup completed');
    } catch (error) {
      console.error('❌ Custom cleanup failed:', error);
    }
  }
  
  // Close database connection
  try {
    console.log('🔒 Closing database connections...');
    const db = getDb();
    db.close();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Failed to close database:', error);
  }
  
  console.log('👋 Graceful shutdown complete');
}

/**
 * Setup graceful shutdown handlers
 * Call this once at application startup
 */
export function setupGracefulShutdown(config?: Partial<ShutdownConfig>): void {
  const fullConfig: ShutdownConfig = {
    timeoutMs: 30000, // 30 seconds default
    ...config,
  };
  
  // Handle SIGTERM (Kubernetes, Docker)
  process.on('SIGTERM', async () => {
    console.log('📡 Received SIGTERM signal');
    await gracefulShutdown(fullConfig);
    process.exit(0);
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('📡 Received SIGINT signal');
    await gracefulShutdown(fullConfig);
    process.exit(0);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await gracefulShutdown(fullConfig);
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    await gracefulShutdown(fullConfig);
    process.exit(1);
  });
  
  console.log('✅ Graceful shutdown handlers registered');
}

/**
 * Middleware to track active requests
 * Use this in your API route handlers
 */
export function withGracefulShutdownTracking<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (isShuttingDown) {
      throw new Error('Server is shutting down');
    }
    
    incrementActiveRequests();
    try {
      return await handler(...args);
    } finally {
      decrementActiveRequests();
    }
  }) as T;
}
