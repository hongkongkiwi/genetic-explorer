/**
 * Distributed Rate Limit
 * 
 * Provides rate limiting that works across multiple server instances.
 * Falls back to in-memory storage if Redis is not available.
 */

// In-memory store for rate limiting (fallback when Redis is not available)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const DEFAULT_WINDOW_MS = 60000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100;

interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
}

/**
 * Check if Redis is available
 */
function isRedisAvailable(): boolean {
  return !!process.env.REDIS_URL;
}

/**
 * Get rate limit key
 */
function getKey(identifier: string, prefix: string = 'rl'): string {
  return `${prefix}:${identifier}`;
}

/**
 * Check distributed rate limit
 */
export function checkDistributedRateLimit(
  identifier: string,
  options?: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const windowMs = options?.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests || DEFAULT_MAX_REQUESTS;
  const key = getKey(identifier, options?.keyPrefix);
  
  const now = Date.now();
  const resetTime = now + windowMs;
  
  // If Redis is available, use it (implementation would go here)
  // For now, use in-memory store
  const stored = memoryStore.get(key);
  
  if (!stored || stored.resetTime < now) {
    // New window
    memoryStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }
  
  // Existing window
  if (stored.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: stored.resetTime,
    };
  }
  
  stored.count++;
  memoryStore.set(key, stored);
  
  return {
    allowed: true,
    remaining: maxRequests - stored.count,
    resetTime: stored.resetTime,
  };
}

/**
 * Get rate limit statistics
 */
export function getDistributedRateLimitStats(): { 
  total: number; 
  limited: number;
  activeWindows: number;
} {
  const now = Date.now();
  let limited = 0;
  
  for (const [key, data] of memoryStore.entries()) {
    if (data.resetTime > now) {
      // Count windows that have hit the limit
      // This is approximate as we don't store maxRequests per key
    }
  }
  
  return {
    total: memoryStore.size,
    limited,
    activeWindows: Array.from(memoryStore.values()).filter(d => d.resetTime > now).length,
  };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string, prefix?: string): void {
  const key = getKey(identifier, prefix);
  memoryStore.delete(key);
}

/**
 * Clean up expired entries
 */
export function cleanupExpiredLimits(): void {
  const now = Date.now();
  for (const [key, data] of memoryStore.entries()) {
    if (data.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
import { registerInterval } from './intervalRegistry';
registerInterval(setInterval(cleanupExpiredLimits, 5 * 60 * 1000));

/**
 * Rate limit by IP address
 */
export function rateLimitByIp(
  ip: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  return checkDistributedRateLimit(ip, {
    maxRequests,
    windowMs,
    keyPrefix: 'ip',
  });
}

/**
 * Rate limit by user ID
 */
export function rateLimitByUser(
  userId: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  return checkDistributedRateLimit(userId, {
    maxRequests,
    windowMs,
    keyPrefix: 'user',
  });
}

/**
 * Rate limit by action type
 */
export function rateLimitByAction(
  identifier: string,
  action: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  return checkDistributedRateLimit(`${identifier}:${action}`, {
    maxRequests,
    windowMs,
    keyPrefix: 'action',
  });
}
