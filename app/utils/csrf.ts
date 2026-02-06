/**
 * CSRF Protection Utilities
 */

import crypto from 'crypto';

const CSRF_TOKENS = new Map<string, { token: string; expires: number }>();
const CSRF_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(sessionId?: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  if (sessionId) {
    CSRF_TOKENS.set(sessionId, {
      token,
      expires: Date.now() + CSRF_EXPIRY,
    });
  }
  
  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string, sessionId?: string): boolean {
  if (!sessionId) return false;
  
  const stored = CSRF_TOKENS.get(sessionId);
  if (!stored) return false;
  
  if (Date.now() > stored.expires) {
    CSRF_TOKENS.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

/**
 * Get CSRF token for session
 */
export function getCsrfToken(sessionId?: string): string | null {
  if (!sessionId) return null;
  
  const stored = CSRF_TOKENS.get(sessionId);
  if (!stored || Date.now() > stored.expires) {
    CSRF_TOKENS.delete(sessionId);
    return null;
  }
  
  return stored.token;
}

/**
 * Get CSRF cookie options
 */
export function getCsrfCookieOptions(): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict';
    maxAge: number;
    path: string;
  };
} {
  return {
    name: 'csrf_token',
    value: generateCsrfToken(),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    },
  };
}

/**
 * CSRF middleware for API routes
 */
export function csrfProtection(request: Request, _cookie?: string | null): { valid: boolean; error?: string; status?: number } {
  const csrfHeader = request.headers.get('x-csrf-token');
  const cookieHeader = request.headers.get('cookie');
  
  // Extract session from cookie
  const sessionMatch = cookieHeader?.match(/session_token=([^;]+)/);
  const sessionId = sessionMatch?.[1];
  
  if (!csrfHeader || !sessionId) {
    return { valid: false, error: 'CSRF token missing', status: 403 };
  }
  
  const valid = validateCsrfToken(csrfHeader, sessionId);
  if (!valid) {
    return { valid: false, error: 'Invalid CSRF token', status: 403 };
  }
  
  return { valid: true };
}
