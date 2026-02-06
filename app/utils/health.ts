/**
 * Health Check System
 * 
 * Provides comprehensive health checks for production deployments:
 * - Liveness probe: Is the app running?
 * - Readiness probe: Is the app ready to serve traffic?
 * - Deep health check: Are all dependencies working?
 */

import crypto from 'crypto';
import { getDb } from '~/db';
import { getEncryptionStatus } from '~/security';
import { isCloudKMSEnabled, getKMSProvider } from './kms';

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';

interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  instanceId: string;
  checks: {
    database: { status: HealthStatus; responseTime: number; message?: string };
    encryption: { status: HealthStatus; message?: string; kmsProvider?: string };
    diskSpace?: { status: HealthStatus; available: string; message?: string };
    memory?: { status: HealthStatus; usage: string; message?: string };
  };
}

// Generate unique instance ID for this deployment
const INSTANCE_ID = `instance-${Date.now()}-${crypto.randomUUID().replace(/-/g, '').substring(0, 9)}`;

// Track startup time for readiness probe
const STARTUP_TIME = Date.now();
const MIN_STARTUP_TIME_MS = 5000; // Wait at least 5 seconds before reporting ready

let isReady = false;
let healthCheckFailures = 0;
const MAX_HEALTH_CHECK_FAILURES = 3;

/**
 * Check if the application is ready to serve traffic
 * Called by readiness probe (e.g., Kubernetes)
 */
export function isApplicationReady(): boolean {
  // Minimum startup time to allow for initialization
  const uptime = Date.now() - STARTUP_TIME;
  if (uptime < MIN_STARTUP_TIME_MS) {
    return false;
  }

  // Check if we've passed initial health checks
  if (!isReady) {
    try {
      // Try to connect to database
      const db = getDb();
      db.prepare('SELECT 1').get();
      
      // Check encryption is initialized
      const encStatus = getEncryptionStatus();
      if (!encStatus.enabled) {
        return false;
      }
      
      isReady = true;
    } catch (error) {
      return false;
    }
  }

  return isReady;
}

/**
 * Mark the application as not ready (e.g., during shutdown)
 */
export function setApplicationNotReady(): void {
  isReady = false;
}

/**
 * Get instance ID for debugging and logging
 */
export function getInstanceId(): string {
  return INSTANCE_ID;
}

/**
 * Check database health
 */
function checkDatabase(): { status: HealthStatus; responseTime: number; message?: string } {
  const start = Date.now();
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

/**
 * Check encryption system health
 */
function checkEncryption(): { status: HealthStatus; message?: string; kmsProvider?: string } {
  try {
    const status = getEncryptionStatus();
    
    if (!status.enabled) {
      return {
        status: 'unhealthy',
        message: 'Encryption is disabled',
      };
    }

    const kmsProvider = isCloudKMSEnabled() ? getKMSProvider() : 'environment';
    
    if (!status.masterKeySet && !isCloudKMSEnabled()) {
      return {
        status: 'degraded',
        message: 'Using development encryption key',
        kmsProvider,
      };
    }

    return {
      status: 'healthy',
      kmsProvider,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Encryption check failed',
    };
  }
}

/**
 * Check disk space (if running in Node.js environment with fs access)
 */
function checkDiskSpace(): { status: HealthStatus; available: string; message?: string } | undefined {
  try {
    // Only check if we have fs access
    const fs = require('fs');
    const path = require('path');
    
    const stats = fs.statSync(process.cwd());
    // Note: This is a simplified check - production should use proper disk space checks
    return {
      status: 'healthy',
      available: 'unknown', // Would need proper disk space checking library
    };
  } catch {
    return undefined;
  }
}

/**
 * Check memory usage
 */
function checkMemory(): { status: HealthStatus; usage: string; message?: string } | undefined {
  try {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    
    const status: HealthStatus = usedMB > 1024 ? 'degraded' : 'healthy'; // Warn if > 1GB
    
    return {
      status,
      usage: `${usedMB}MB / ${totalMB}MB`,
      message: status === 'degraded' ? 'High memory usage' : undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * Perform comprehensive health check
 * Called by liveness probe and monitoring systems
 */
export function performHealthCheck(): HealthCheckResult {
  const dbCheck = checkDatabase();
  const encryptionCheck = checkEncryption();
  const diskCheck = checkDiskSpace();
  const memoryCheck = checkMemory();

  // Determine overall status
  let status: HealthStatus = 'healthy';
  
  if (dbCheck.status === 'unhealthy' || encryptionCheck.status === 'unhealthy') {
    status = 'unhealthy';
    healthCheckFailures++;
  } else if (dbCheck.status === 'degraded' || encryptionCheck.status === 'degraded') {
    status = 'degraded';
  } else {
    healthCheckFailures = 0;
  }

  // If too many consecutive failures, mark as unhealthy
  if (healthCheckFailures >= MAX_HEALTH_CHECK_FAILURES) {
    status = 'unhealthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    instanceId: INSTANCE_ID,
    checks: {
      database: dbCheck,
      encryption: encryptionCheck,
      ...(diskCheck && { diskSpace: diskCheck }),
      ...(memoryCheck && { memory: memoryCheck }),
    },
  };
}

/**
 * Get startup status for readiness probe
 */
export function getStartupStatus(): { status: string; ready: boolean; uptime: number } {
  const uptime = Date.now() - STARTUP_TIME;
  return {
    status: isReady ? 'ready' : 'starting',
    ready: isReady,
    uptime,
  };
}

/**
 * Quick health check for load balancers
 * Returns 200 if healthy, 503 if not
 */
export function quickHealthCheck(): { healthy: boolean; statusCode: number } {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    return { healthy: true, statusCode: 200 };
  } catch {
    return { healthy: false, statusCode: 503 };
  }
}
