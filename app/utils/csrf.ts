import crypto from 'crypto';

const CSRF_TOKEN_BYTES = 32;
const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_BYTES).toString('hex');
}

/**
 * Verify CSRF token from request
 */
export function verifyCsrfToken(request: Request, cookieHeader: string | null): boolean {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER);
  
  if (!headerToken) {
    return false;
  }

  // Get token from cookie
  const cookieToken = extractCsrfTokenFromCookie(cookieHeader);
  
  if (!cookieToken) {
    return false;
  }

  // Timing-safe comparison
  try {
    const headerBuf = Buffer.from(headerToken, 'hex');
    const cookieBuf = Buffer.from(cookieToken, 'hex');
    
    if (headerBuf.length !== cookieBuf.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(headerBuf, cookieBuf);
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from cookie header
 */
function extractCsrfTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_TOKEN_COOKIE) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Get CSRF token cookie settings
 */
export function getCsrfCookieOptions(): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    maxAge: number;
  };
} {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    name: CSRF_TOKEN_COOKIE,
    value: generateCsrfToken(),
    options: {
      httpOnly: false, // Must be accessible to JavaScript for header
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    },
  };
}

/**
 * CSRF protection middleware for API routes
 * Skips GET, HEAD, OPTIONS requests
 */
export function csrfProtection(request: Request, cookieHeader: string | null): 
  | { valid: true }
  | { valid: false; error: string; status: number } {
  
  // Skip safe methods
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  // Skip auth-related endpoints that don't need CSRF
  const url = new URL(request.url);
  const skipPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'];
  if (skipPaths.some(path => url.pathname.startsWith(path))) {
    return { valid: true };
  }

  // Verify token
  if (!verifyCsrfToken(request, cookieHeader)) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token',
      status: 403,
    };
  }

  return { valid: true };
}

/**
 * Create CSRF token response headers
 */
export function createCsrfHeaders(): Headers {
  const headers = new Headers();
  const csrfCookie = getCsrfCookieOptions();
  
  headers.set('Set-Cookie', 
    `${csrfCookie.name}=${csrfCookie.value}; ` +
    `Path=${csrfCookie.options.path}; ` +
    `Max-Age=${csrfCookie.options.maxAge}; ` +
    `SameSite=${csrfCookie.options.sameSite}; ` +
    `${csrfCookie.options.secure ? 'Secure; ' : ''}` +
    `HttpOnly=${csrfCookie.options.httpOnly}`
  );
  
  headers.set('X-CSRF-Token', csrfCookie.value);
  
  return headers;
}
