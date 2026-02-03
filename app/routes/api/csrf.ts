import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { generateCsrfToken, getCsrfCookieOptions } from '~/utils/csrf';

/**
 * GET /api/csrf - Get a new CSRF token
 * Sets the token as a cookie and returns it in the response
 */
export const APIRoute = createAPIFileRoute('/api/csrf')({
  GET: async () => {
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
    
    return json({
      success: true,
      token: csrfCookie.value,
    }, { headers });
  },
});
