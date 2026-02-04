/**
 * Startup Coordinator
 * 
 * Handles graceful application startup:
 * - Database initialization
 * - Migration execution
 * - Encryption initialization
 * - Health check registration
 * 
 * Ensures proper order of operations and handles failures gracefully.
 */

import { getDb } from '~/db';
import { initializeEncryption } from '~/security';
import { setupGracefulShutdown } from './gracefulShutdown';
import { isApplicationReady } from './health';
import { cleanupExpiredRateLimits } from './distributedRateLimit';
import { cleanupExpiredLocks } from './leaderElection';

interface StartupConfig {
  // Database
  runMigrations?: boolean;
  
  // Encryption
  initializeKMS?: boolean;
  
  // Shutdown
  shutdownTimeoutMs?: number;
  
  // Cleanup
  enablePeriodicCleanup?: boolean;
}

interface StartupResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

// Track startup state
let startupComplete = false;
let startupResult: StartupResult | null = null;

/**
 * Check if startup has completed
 */
export function isStartupComplete(): boolean {
  return startupComplete;
}

/**
 * Get startup result
 */
export function getStartupResult(): StartupResult | null {
  return startupResult;
}

/**
 * Initialize database with retries
 */
async function initializeDatabase(runMigrations: boolean): Promise<void> {
  const maxRetries = 5;
  const retryDelayMs = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📦 Database initialization attempt ${attempt}/${maxRetries}...`);
      
      const db = getDb();
      
      // Test connection
      db.prepare('SELECT 1').get();
      
      console.log('✅ Database connected');
      
      // Note: Migrations are run automatically in getDb() via databaseMigrations.ts
      if (runMigrations) {
        console.log('✅ Migrations checked');
      }
      
      return;
    } catch (error) {
      console.error(`❌ Database initialization failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to initialize database after ${maxRetries} attempts`);
      }
      
      console.log(`⏳ Retrying in ${retryDelayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
}

/**
 * Initialize encryption system
 */
async function initializeEncryptionSystem(): Promise<void> {
  try {
    console.log('🔐 Initializing encryption...');
    await initializeEncryption();
    console.log('✅ Encryption initialized');
  } catch (error) {
    console.error('❌ Encryption initialization failed:', error);
    throw error;
  }
}

/**
 * Setup periodic maintenance tasks
 */
function setupPeriodicCleanup(): void {
  // Clean up expired rate limits every 5 minutes
  setInterval(() => {
    try {
      cleanupExpiredRateLimits();
    } catch (error) {
      console.error('Failed to cleanup rate limits:', error);
    }
  }, 5 * 60 * 1000);
  
  // Clean up expired leader locks every minute
  setInterval(() => {
    try {
      cleanupExpiredLocks();
    } catch (error) {
      console.error('Failed to cleanup leader locks:', error);
    }
  }, 60000);
  
  console.log('✅ Periodic cleanup tasks scheduled');
}

/**
 * Perform application startup
 */
export async function startup(config: StartupConfig = {}): Promise<StartupResult> {
  const {
    runMigrations = true,
    initializeKMS = true,
    shutdownTimeoutMs = 30000,
    enablePeriodicCleanup = true,
  } = config;
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 GENETIC EXPLORER STARTUP');
  console.log('='.repeat(60) + '\n');
  
  const result: StartupResult = {
    success: false,
    errors: [],
    warnings: [],
  };
  
  try {
    // Step 1: Initialize database
    try {
      await initializeDatabase(runMigrations);
    } catch (error) {
      result.errors.push(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
    
    // Step 2: Initialize encryption
    if (initializeKMS) {
      try {
        await initializeEncryptionSystem();
      } catch (error) {
        result.errors.push(`Encryption initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
    
    // Step 3: Setup graceful shutdown
    setupGracefulShutdown({ timeoutMs: shutdownTimeoutMs });
    
    // Step 4: Setup periodic cleanup
    if (enablePeriodicCleanup) {
      setupPeriodicCleanup();
    }
    
    // Step 5: Wait for application to be ready
    console.log('⏳ Waiting for application to be ready...');
    const startTime = Date.now();
    const maxWaitTime = 30000; // 30 seconds
    
    while (!isApplicationReady()) {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Application failed to become ready within timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    result.success = true;
    startupComplete = true;
    startupResult = result;
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ STARTUP COMPLETE');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    result.success = false;
    startupComplete = true;
    startupResult = result;
    
    console.error('\n' + '='.repeat(60));
    console.error('❌ STARTUP FAILED');
    console.error('='.repeat(60));
    console.error('Errors:', result.errors);
    console.error('='.repeat(60) + '\n');
    
    throw error;
  }
  
  return result;
}

/**
 * Startup middleware for API routes
 * Ensures startup is complete before handling requests
 */
export function withStartupCheck<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!startupComplete) {
      throw new Error('Application is still starting up');
    }
    
    if (!startupResult?.success) {
      throw new Error('Application startup failed');
    }
    
    return await handler(...args);
  }) as T;
}

/**
 * Get startup status for health checks
 */
export function getStartupStatus(): {
  complete: boolean;
  success: boolean | null;
  errors: string[];
} {
  return {
    complete: startupComplete,
    success: startupResult?.success ?? null,
    errors: startupResult?.errors ?? [],
  };
}
