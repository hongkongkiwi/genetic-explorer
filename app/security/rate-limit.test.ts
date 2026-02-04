import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  checkRateLimit, 
  rateLimitByIp, 
  rateLimitByUser, 
  rateLimitAuth,
  resetRateLimit,
  getRateLimitStats,
  getClientIp 
} from './rateLimit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset rate limits before each test
    resetRateLimit('test-id');
    resetRateLimit('test-ip', 'ip');
    resetRateLimit('test-user', 'user');
    resetRateLimit('test-auth', 'auth');
  });

  describe('checkRateLimit', () => {
    it('allows requests under the limit', () => {
      const result = checkRateLimit('test-id', {
        windowMs: 60000,
        maxRequests: 5,
      });
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });

    it('tracks multiple requests', () => {
      const options = { windowMs: 60000, maxRequests: 3 };
      
      const r1 = checkRateLimit('test-id', options);
      expect(r1.remaining).toBe(2);
      
      const r2 = checkRateLimit('test-id', options);
      expect(r2.remaining).toBe(1);
      
      const r3 = checkRateLimit('test-id', options);
      expect(r3.remaining).toBe(0);
    });

    it('blocks requests over the limit', () => {
      const options = { windowMs: 60000, maxRequests: 2 };
      
      checkRateLimit('test-id', options);
      checkRateLimit('test-id', options);
      const blocked = checkRateLimit('test-id', options);
      
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfter).toBeDefined();
    });

    it('resets after window expires', async () => {
      const options = { windowMs: 100, maxRequests: 1 };
      
      checkRateLimit('test-id', options);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const result = checkRateLimit('test-id', options);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe('rateLimitByIp', () => {
    it('uses correct defaults', () => {
      const result = rateLimitByIp('192.168.1.1');
      expect(result.limit).toBe(100);
      expect(result.allowed).toBe(true);
    });

    it('accepts custom limits', () => {
      const result = rateLimitByIp('192.168.1.1', 10, 60000);
      expect(result.limit).toBe(10);
    });
  });

  describe('rateLimitByUser', () => {
    it('uses higher limits for authenticated users', () => {
      const result = rateLimitByUser('user-123');
      expect(result.limit).toBe(1000);
    });
  });

  describe('rateLimitAuth', () => {
    it('uses strict limits for auth endpoints', () => {
      const result = rateLimitAuth('192.168.1.1');
      expect(result.limit).toBe(10);
    });

    it('blocks after 10 attempts', () => {
      for (let i = 0; i < 10; i++) {
        rateLimitAuth('192.168.1.1');
      }
      
      const blocked = rateLimitAuth('192.168.1.1');
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('resetRateLimit', () => {
    it('resets the rate limit counter', () => {
      const options = { windowMs: 60000, maxRequests: 2 };
      
      checkRateLimit('test-reset', options);
      checkRateLimit('test-reset', options);
      
      resetRateLimit('test-reset');
      
      const result = checkRateLimit('test-reset', options);
      expect(result.remaining).toBe(1);
    });
  });

  describe('getRateLimitStats', () => {
    it('returns stats object', () => {
      const stats = getRateLimitStats();
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('memoryUsage');
      expect(typeof stats.totalEntries).toBe('number');
      expect(typeof stats.memoryUsage).toBe('string');
    });
  });

  describe('getClientIp', () => {
    it('extracts IP from x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });
      
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('extracts IP from x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.1',
        },
      });
      
      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('returns unknown when no IP found', () => {
      const request = new Request('http://localhost');
      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });
  });
});
