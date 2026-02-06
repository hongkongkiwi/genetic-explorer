import { createAPIFileRoute } from '@tanstack/start/api';
import { generateCsrfToken, getCsrfCookieOptions } from '~/utils/csrf';
import { rateLimitByIp } from '~/utils/rateLimit';

/**
 * GET /api/csrf - Get a new CSRF token
 * Sets the token as a cookie and returns it in the response
 */
export const APIRoute = createAPIFileRoute('/api/csrf')({
  GET: async ({ request }) => {
    // Rate limit CSRF token requests (30 requests per minute)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimit = rateLimitByIp(clientIp || 'unknown', 30, 60000);
    if (!rateLimit.allowed) {
      return Response.json({
        success: false,
        error: 'Too many CSRF token requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      }, { status: 429 });
    }

    const csrfCookie = getCsrfCookieOptions();
    
    // Set cookie with CSRF token
    const headers = new Headers();
    headers.append('Set-Cookie', 
      `${csrfCookie.name}=${csrfCookie.value}; ` +
      `Path=${csrfCookie.options.path}; ` +
      `Max-Age=${csrfCookie.options.maxAge}; ` +
      `SameSite=${csrfCookie.options.sameSite}; ` +
      `${csrfCookie.options.secure ? 'Secure; ' : ''}` +
      `HttpOnly=${csrfCookie.options.httpOnly}`
    );
    
    return Response.json({
      success: true,
      token: csrfCookie.value,
    }, { headers });
  },
});
