/**
 * Rate Limiting Utilities
 */

import { getDb } from '~/db';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${options.keyPrefix || 'rl'}:${identifier}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;
  
  const entry = inMemoryStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // New window
    const resetTime = now + options.windowMs;
    inMemoryStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime,
    };
  }
  
  if (entry.count >= options.maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment and allow
  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Create a rate limiter with preset options
 */
export function createRateLimiter(options: RateLimitOptions) {
  return (identifier: string) => checkRateLimit(identifier, options);
}

/**
 * Rate limit by IP address
 */
export function rateLimitByIp(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return checkRateLimit(ip, { windowMs, maxRequests, keyPrefix: 'ip' });
}

/**
 * Rate limit by user ID
 */
export function rateLimitByUser(
  userId: string,
  maxRequests: number = 1000,
  windowMs: number = 60000
) {
  return checkRateLimit(userId, { windowMs, maxRequests, keyPrefix: 'user' });
}

/**
 * Strict rate limit for sensitive operations (login, 2FA, etc.)
 */
export function strictRateLimit(identifier: string) {
  return checkRateLimit(identifier, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'strict',
  });
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of inMemoryStore.entries()) {
    if (entry.resetTime < now) {
      inMemoryStore.delete(key);
    }
  }
}

/**
 * Rate limit for sensitive operations
 */
export function rateLimitSensitive(identifier: string | undefined): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  retryAfter?: number;
} {
  const result = checkRateLimit(identifier || 'unknown', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyPrefix: 'sensitive',
  });
  
  return {
    ...result,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
  };
}

/**
 * Rate limit specifically for auth endpoints
 */
export function rateLimitAuth(identifier: string | undefined): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  retryAfter?: number;
} {
  const result = checkRateLimit(identifier || 'unknown', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'auth',
  });
  
  return {
    ...result,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
  };
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || undefined;
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetTime / 1000).toString(),
  };
}

// Periodic cleanup every 5 minutes
import { registerInterval } from './intervalRegistry';

if (typeof setInterval !== 'undefined') {
  registerInterval(setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000));
}
