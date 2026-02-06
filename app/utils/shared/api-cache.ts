import type { ApiResponse } from '~/types/api';
import { registerInterval } from '~/utils/intervalRegistry';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: number; // Additional time to serve stale data
}

// In-memory API cache
class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry;
  }

  set<T>(key: string, data: T, config: CacheConfig): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + config.ttl,
    };
    this.cache.set(key, entry);
  }

  // Check if data is stale but still usable
  isStale<T>(key: string, config: CacheConfig): boolean {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return false;

    const staleTime = config.staleWhileRevalidate ?? 0;
    return Date.now() > entry.expiresAt && 
           Date.now() < entry.expiresAt + staleTime;
  }

  // Get in-flight promise (for deduplication)
  getInFlight<T>(key: string): Promise<T> | undefined {
    return this.inFlight.get(key) as Promise<T> | undefined;
  }

  setInFlight<T>(key: string, promise: Promise<T>): void {
    this.inFlight.set(key, promise);
    promise.finally(() => this.inFlight.delete(key));
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// Auto-cleanup every 5 minutes
registerInterval(setInterval(() => apiCache.cleanup(), 5 * 60 * 1000));

// ============================================
// Request Deduplication
// ============================================

interface DedupConfig {
  key: string;
  timeout?: number;
}

export function dedupeRequest<T>(
  config: DedupConfig,
  requestFn: () => Promise<T>
): Promise<T> {
  const { key, timeout = 30000 } = config;

  // Check for in-flight request
  const inFlight = apiCache.getInFlight<T>(key);
  if (inFlight) {
    return inFlight;
  }

  // Create new request
  const promise = requestFn();
  apiCache.setInFlight(key, promise);

  // Auto-cleanup on timeout
  setTimeout(() => {
    const current = apiCache.getInFlight<T>(key);
    if (current === promise) {
      apiCache.getInFlight(key); // Will be undefined now
    }
  }, timeout);

  return promise;
}

// ============================================
// Request Throttling & Debouncing
// ============================================

interface ThrottleConfig {
  limit: number; // requests
  window: number; // milliseconds
}

class RequestThrottler {
  private requests: Map<string, number[]> = new Map();

  canProceed(key: string, config: ThrottleConfig): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) ?? [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(t => now - t < config.window);
    this.requests.set(key, validTimestamps);

    return validTimestamps.length < config.limit;
  }

  recordRequest(key: string): void {
    const timestamps = this.requests.get(key) ?? [];
    timestamps.push(Date.now());
    this.requests.set(key, timestamps);
  }

  getRetryAfter(key: string, config: ThrottleConfig): number {
    const timestamps = this.requests.get(key) ?? [];
    if (timestamps.length === 0) return 0;
    
    const oldest = Math.min(...timestamps);
    return Math.max(0, config.window - (Date.now() - oldest));
  }
}

export const requestThrottler = new RequestThrottler();

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle utility
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// Optimized Fetch Wrapper
// ============================================

interface FetchOptions extends RequestInit {
  cacheConfig?: CacheConfig;
  dedupe?: boolean;
  dedupeKey?: string;
  retryCount?: number;
  retryDelay?: number;
  throttleConfig?: ThrottleConfig;
}

export async function cachedFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    cacheConfig,
    dedupe = true,
    dedupeKey = url,
    retryCount = 1,
    retryDelay = 1000,
    throttleConfig,
    ...fetchOptions
  } = options;

  // Check throttling
  if (throttleConfig) {
    if (!requestThrottler.canProceed(dedupeKey, throttleConfig)) {
      const retryAfter = requestThrottler.getRetryAfter(dedupeKey, throttleConfig);
      return {
        success: false,
        error: `Rate limited. Retry after ${Math.ceil(retryAfter / 1000)}s`,
      };
    }
    requestThrottler.recordRequest(dedupeKey);
  }

  // Check cache
  if (cacheConfig) {
    const cached = apiCache.get<T>(dedupeKey);
    if (cached) {
      // If stale, trigger background refresh
      if (apiCache.isStale(dedupeKey, cacheConfig)) {
        // Background refresh (don't await)
        fetch(url, fetchOptions).then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            apiCache.set(dedupeKey, data, cacheConfig);
          }
        }).catch((error) => {
          // Silently ignore background refresh errors
          if (process.env.NODE_ENV === 'development') {
            console.debug('Background cache refresh failed:', error);
          }
        });
      }
      return { success: true, data: cached.data };
    }
  }

  // Deduplication
  const doFetch = async (): Promise<ApiResponse<T>> => {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse<T>;

        // Cache successful response
        if (cacheConfig && data.success) {
          apiCache.set(dedupeKey, data, cacheConfig);
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed',
    };
  };

  if (dedupe) {
    const deduped = dedupeRequest({ key: dedupeKey }, doFetch);
    return deduped;
  }

  return doFetch();
}

// ============================================
// Prefetching
// ============================================

interface PrefetchOptions {
  priority?: 'high' | 'low';
  delay?: number;
}

export function prefetch<T>(
  url: string,
  options: FetchOptions & PrefetchOptions = {}
): void {
  const { priority = 'low', delay = 0, ...fetchOptions } = options;

  const doPrefetch = () => {
    // Use requestIdleCallback for low priority or setTimeout
    const scheduler = priority === 'low' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : (cb: () => void) => setTimeout(cb, delay);

    scheduler(() => {
      cachedFetch<T>(url, { ...fetchOptions, dedupe: true }).catch((error) => {
        // Silently ignore prefetch errors
        if (process.env.NODE_ENV === 'development') {
          console.debug('Prefetch failed:', error);
        }
      });
    });
  };

  if (delay > 0) {
    setTimeout(doPrefetch, delay);
  } else {
    doPrefetch();
  }
}

// ============================================
// Optimistic Updates
// ============================================

interface OptimisticUpdateConfig<T> {
  cacheKey: string;
  updateFn: (current: T) => T;
  rollbackOnError?: boolean;
}

export function createOptimisticUpdate<T>(
  config: OptimisticUpdateConfig<T>
): {
  apply: () => T | null;
  confirm: () => void;
  rollback: () => void;
} {
  const { cacheKey, updateFn, rollbackOnError = true } = config;
  const originalData = apiCache.get<T>(cacheKey)?.data ?? null;
  let applied = false;

  return {
    apply: () => {
      if (originalData === null) return null;
      
      const updated = updateFn(originalData);
      // Temporarily update cache
      apiCache.set(cacheKey, updated, { ttl: 60000 });
      applied = true;
      return updated;
    },
    confirm: () => {
      // Cache entry is already updated, just mark as permanent
      applied = false;
    },
    rollback: () => {
      if (applied && rollbackOnError && originalData !== null) {
        apiCache.set(cacheKey, originalData, { ttl: 60000 });
      }
      applied = false;
    },
  };
}
