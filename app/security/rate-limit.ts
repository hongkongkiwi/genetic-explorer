/**
 * Rate limiting utility for API endpoints
 * 
 * Supports both in-memory (single instance) and distributed (multi-instance) modes.
 * Automatically selects the appropriate implementation based on environment.
 */

import {
  checkDistributedRateLimit,
  rateLimitByIpDistributed,
  rateLimitByUserDistributed,
  rateLimitAuthDistributed,
  resetDistributedRateLimit,
  getDistributedRateLimitStats,
} from '~/utils/distributed-rate-limit';
import { registerInterval, unregisterInterval } from '~/utils/intervalRegistry';

interface RateLimitEntry {
  count: number;
  resetAt: number;
  windowStart: number;
}

export interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for rate limit keys
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// Determine if we should use distributed rate limiting
// Use distributed mode if explicitly enabled or in production
const USE_DISTRIBUTED = process.env.DISTRIBUTED_RATE_LIMIT === 'true' || 
                        process.env.NODE_ENV === 'production';

// In-memory store for rate limits (single instance mode)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (runs every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Store interval reference for cleanup
let cleanupInterval: NodeJS.Timeout | null = null;

// Start cleanup interval (only for in-memory mode)
if (!USE_DISTRIBUTED) {
  cleanupInterval = registerInterval(setInterval(() => {
    cleanupExpiredEntries();
  }, CLEANUP_INTERVAL));
}

/**
 * Stop the cleanup interval (call during shutdown)
 */
export function stopRateLimitCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    unregisterInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Generate rate limit key from request
 */
function generateKey(identifier: string, prefix?: string): string {
  return prefix ? `${prefix}:${identifier}` : identifier;
}

/**
 * Check rate limit for an identifier
 * Automatically uses distributed rate limiting in production
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  // Use distributed rate limiting in production
  if (USE_DISTRIBUTED) {
    return checkDistributedRateLimit(identifier, options);
  }
  
  // In-memory rate limiting (single instance)
  const now = Date.now();
  const key = generateKey(identifier, options.keyPrefix);
  
  const existing = rateLimitStore.get(key);
  
  // If no entry or window expired, create new entry
  if (!existing || existing.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + options.windowMs,
      windowStart: now,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }
  
  // Check if limit exceeded
  if (existing.count >= options.maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfter,
    };
  }
  
  // Increment count
  existing.count++;
  
  return {
    allowed: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Rate limit by IP address
 */
export function rateLimitByIp(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  return checkRateLimit(ip, {
    windowMs,
    maxRequests,
    keyPrefix: 'ip',
  });
}

/**
 * Rate limit by user ID
 */
export function rateLimitByUser(
  userId: string,
  maxRequests: number = 1000,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  return checkRateLimit(userId, {
    windowMs,
    maxRequests,
    keyPrefix: 'user',
  });
}

/**
 * Strict rate limit for auth endpoints
 */
export function rateLimitAuth(
  identifier: string
): RateLimitResult {
  return checkRateLimit(identifier, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 attempts per hour
    keyPrefix: 'auth',
  });
}

/**
 * Rate limit for sensitive operations
 */
export function rateLimitSensitive(
  identifier: string
): RateLimitResult {
  return checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 attempts per minute
    keyPrefix: 'sensitive',
  });
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }
  
  return headers;
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  // Check forwarded headers (for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default (in real scenarios, you'd get this from the connection)
  return 'unknown';
}

/**
 * Reset rate limit for an identifier (useful for testing or admin actions)
 */
export function resetRateLimit(identifier: string, prefix?: string): void {
  if (USE_DISTRIBUTED) {
    resetDistributedRateLimit(identifier, prefix);
  } else {
    const key = generateKey(identifier, prefix);
    rateLimitStore.delete(key);
  }
}

/**
 * Get current rate limit stats
 */
export function getRateLimitStats(): {
  totalEntries: number;
  memoryUsage: string;
  mode: 'memory' | 'distributed';
} {
  if (USE_DISTRIBUTED) {
    const stats = getDistributedRateLimitStats();
    return {
      totalEntries: stats.totalEntries,
      memoryUsage: 'N/A (distributed)',
      mode: 'distributed',
    };
  }
  
  const entries = rateLimitStore.size;
  const memoryUsage = process.memoryUsage();
  
  return {
    totalEntries: entries,
    memoryUsage: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    mode: 'memory',
  };
}

/**
 * Check if distributed rate limiting is enabled
 */
export function isDistributedRateLimitEnabled(): boolean {
  return USE_DISTRIBUTED;
}
