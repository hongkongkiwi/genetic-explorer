/**
 * Security headers and utilities for the application
 */

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security'?: string;
}

/**
 * Get security headers for production
 */
export function getSecurityHeaders(isProduction: boolean = true): SecurityHeaders {
  const headers: SecurityHeaders = {
    // Prevent XSS attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.resend.com", // Allow Resend API
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    
    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Control browser features
    'Permissions-Policy': [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  };

  // HSTS only in production with HTTPS
  if (isProduction) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

/**
 * Apply security headers to a Response
 */
export function applySecurityHeaders(
  response: Response,
  isProduction: boolean = true
): Response {
  const headers = getSecurityHeaders(isProduction);
  
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    return sanitized.slice(0, 255 - ext.length) + ext;
  }
  
  return sanitized || 'unnamed';
}

/**
 * Generate nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  
  return allowedOrigins.some((allowed) => {
    if (allowed.includes('*')) {
      const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
      return pattern.test(origin);
    }
    return allowed === origin;
  });
}

/**
 * Create secure cookie options
 */
export function getSecureCookieOptions(
  isProduction: boolean = true
): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
} {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  };
}

/**
 * Hash sensitive data for logging (one-way)
 */
export function hashForLogging(data: string): string {
  // Simple hash for logging purposes (not for security)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

/**
 * Mask email for display/logging
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return '***';
  
  const maskedLocal = localPart.slice(0, 2) + '***';
  const [domainName, tld] = domain.split('.');
  const maskedDomain = domainName.slice(0, 2) + '***';
  
  return `${maskedLocal}@${maskedDomain}.${tld}`;
}

/**
 * Security event logging
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'critical' = 'info'
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    severity,
    ...details,
  };
  
  // In production, send to security monitoring service
  if (severity === 'critical') {
    console.error('[SECURITY]', JSON.stringify(logEntry));
    // TODO: Send to alerting service (not monitoring setup per requirements)
  } else if (severity === 'warning') {
    console.warn('[SECURITY]', JSON.stringify(logEntry));
  } else {
    console.log('[SECURITY]', JSON.stringify(logEntry));
  }
}

/**
 * Detect suspicious patterns in requests
 */
export function detectSuspiciousActivity(
  request: Request,
  body?: unknown
): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const url = new URL(request.url);
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION\s+SELECT/i,
    /INSERT\s+INTO/i,
    /DELETE\s+FROM/i,
    /DROP\s+TABLE/i,
  ];
  
  const checkString = url.pathname + url.search + JSON.stringify(body);
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(checkString)) {
      reasons.push('Potential SQL injection pattern detected');
      break;
    }
  }
  
  // Check for path traversal (in pathname and raw URL)
  if (/\.\.[\\/]/.test(url.pathname) || /\.\.[\\/]/.test(request.url)) {
    reasons.push('Path traversal attempt detected');
  }
  
  // Check for suspicious user agent
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.length < 10 || /(sqlmap|nikto|nmap|burp)/i.test(userAgent)) {
    reasons.push('Suspicious user agent');
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}
