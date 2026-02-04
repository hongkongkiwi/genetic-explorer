import { describe, it, expect } from 'vitest';
import {
  getSecurityHeaders,
  sanitizeInput,
  sanitizeFilename,
  generateNonce,
  isValidOrigin,
  getSecureCookieOptions,
  hashForLogging,
  maskEmail,
  detectSuspiciousActivity,
} from './security-core';

describe('Security Utilities', () => {
  describe('getSecurityHeaders', () => {
    it('returns production headers', () => {
      const headers = getSecurityHeaders(true);
      
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Strict-Transport-Security']).toBeDefined();
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    });

    it('excludes HSTS in development', () => {
      const headers = getSecurityHeaders(false);
      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });

    it('includes CSP directives', () => {
      const headers = getSecurityHeaders(true);
      const csp = headers['Content-Security-Policy'];
      
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
      expect(csp).toContain("img-src");
      expect(csp).toContain("frame-ancestors");
    });
  });

  describe('sanitizeInput', () => {
    it('escapes HTML characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('escapes ampersands', () => {
      expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('escapes single quotes', () => {
      expect(sanitizeInput("it's")).toBe('it&#x27;s');
    });
  });

  describe('sanitizeFilename', () => {
    it('removes path traversal', () => {
      expect(sanitizeFilename('../../../etc/passwd')).not.toContain('../');
    });

    it('replaces special characters', () => {
      expect(sanitizeFilename('file@name#test.txt')).toBe('file_name_test.txt');
    });

    it('limits length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('handles empty string', () => {
      expect(sanitizeFilename('')).toBe('unnamed');
    });
  });

  describe('generateNonce', () => {
    it('generates 32 character hex string', () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(32);
      expect(/^[a-f0-9]+$/i.test(nonce)).toBe(true);
    });

    it('generates unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('isValidOrigin', () => {
    it('returns true for exact match', () => {
      expect(isValidOrigin('https://example.com', ['https://example.com'])).toBe(true);
    });

    it('returns false for mismatch', () => {
      expect(isValidOrigin('https://evil.com', ['https://example.com'])).toBe(false);
    });

    it('supports wildcards', () => {
      expect(isValidOrigin('https://sub.example.com', ['https://*.example.com'])).toBe(true);
    });

    it('returns false for null origin', () => {
      expect(isValidOrigin(null, ['https://example.com'])).toBe(false);
    });
  });

  describe('getSecureCookieOptions', () => {
    it('returns secure options in production', () => {
      const options = getSecureCookieOptions(true);
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('strict');
    });

    it('allows non-secure in development', () => {
      const options = getSecureCookieOptions(false);
      expect(options.secure).toBe(false);
    });
  });

  describe('hashForLogging', () => {
    it('returns consistent hash', () => {
      const hash1 = hashForLogging('test@example.com');
      const hash2 = hashForLogging('test@example.com');
      expect(hash1).toBe(hash2);
    });

    it('returns different hashes for different inputs', () => {
      const hash1 = hashForLogging('test1@example.com');
      const hash2 = hashForLogging('test2@example.com');
      expect(hash1).not.toBe(hash2);
    });

    it('returns hex string', () => {
      const hash = hashForLogging('test');
      expect(/^[a-f0-9]+$/i.test(hash)).toBe(true);
    });
  });

  describe('maskEmail', () => {
    it('masks email correctly', () => {
      expect(maskEmail('john.doe@example.com')).toBe('jo***@ex***.com');
    });

    it('handles short local part', () => {
      expect(maskEmail('ab@example.com')).toBe('ab***@ex***.com');
    });

    it('returns stars for invalid email', () => {
      expect(maskEmail('invalid')).toBe('***');
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('detects SQL injection patterns', () => {
      const request = new Request('http://localhost/?id=1\' OR \'1\'=\'1');
      const result = detectSuspiciousActivity(request);
      
      expect(result.suspicious).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('detects path traversal', () => {
      const request = new Request('http://localhost/api/file?path=../../../etc/passwd');
      const result = detectSuspiciousActivity(request);
      
      expect(result.suspicious).toBe(true);
      expect(result.reasons).toContain('Path traversal attempt detected');
    });

    it('allows normal requests', () => {
      const request = new Request('http://localhost/api/users', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const result = detectSuspiciousActivity(request);
      
      expect(result.suspicious).toBe(false);
    });

    it('detects suspicious user agent', () => {
      const request = new Request('http://localhost/', {
        headers: {
          'user-agent': 'sqlmap/1.0',
        },
      });
      const result = detectSuspiciousActivity(request);
      
      expect(result.suspicious).toBe(true);
      expect(result.reasons).toContain('Suspicious user agent');
    });
  });
});
