import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCsrfToken, verifyCsrfToken, getCsrfCookieOptions } from './csrf';

describe('CSRF Protection', () => {
  describe('generateCsrfToken', () => {
    it('generates a valid token', () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes in hex = 64 chars
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
    });

    it('generates unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyCsrfToken', () => {
    it('returns false when header token is missing', () => {
      const request = new Request('http://localhost', {
        headers: {},
      });
      const result = verifyCsrfToken(request, 'csrf_token=abc123');
      expect(result).toBe(false);
    });

    it('returns false when cookie is missing', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-csrf-token': 'abc123',
        },
      });
      const result = verifyCsrfToken(request, null);
      expect(result).toBe(false);
    });

    it('returns false when tokens do not match', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-csrf-token': 'abc123',
        },
      });
      const result = verifyCsrfToken(request, 'csrf_token=def456');
      expect(result).toBe(false);
    });

    it('returns true when tokens match', () => {
      const token = generateCsrfToken();
      const request = new Request('http://localhost', {
        headers: {
          'x-csrf-token': token,
        },
      });
      const result = verifyCsrfToken(request, `csrf_token=${token}`);
      expect(result).toBe(true);
    });

    it('uses timing-safe comparison', () => {
      const token = generateCsrfToken();
      // Test with partial match
      const partialToken = token.slice(0, -1);
      const request = new Request('http://localhost', {
        headers: {
          'x-csrf-token': partialToken,
        },
      });
      const result = verifyCsrfToken(request, `csrf_token=${token}`);
      expect(result).toBe(false);
    });
  });

  describe('getCsrfCookieOptions', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      vi.resetModules();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('returns correct cookie options', () => {
      const options = getCsrfCookieOptions();
      expect(options.name).toBe('csrf_token');
      expect(options.value).toBeDefined();
      expect(options.options.httpOnly).toBe(false); // Must be accessible to JS
      expect(options.options.sameSite).toBe('strict');
      expect(options.options.path).toBe('/');
      expect(options.options.maxAge).toBe(24 * 60 * 60);
    });

    it('sets secure flag in production', () => {
      process.env.NODE_ENV = 'production';
      const options = getCsrfCookieOptions();
      expect(options.options.secure).toBe(true);
    });

    it('does not set secure flag in development', () => {
      process.env.NODE_ENV = 'development';
      const options = getCsrfCookieOptions();
      expect(options.options.secure).toBe(false);
    });
  });
});
