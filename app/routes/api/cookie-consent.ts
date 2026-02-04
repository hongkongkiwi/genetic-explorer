import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

/**
 * GET /api/cookie-consent
 * Returns current cookie consent status (server-side check)
 */
export const APIRoute = createAPIFileRoute('/api/cookie-consent')({
  GET: async ({ request }) => {
    // Get the cookie consent from the request
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      return json({ consent: null });
    }
    
    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const consentCookie = cookies['cookie_consent'];
    
    if (!consentCookie) {
      return json({ consent: null });
    }
    
    try {
      const consent = JSON.parse(decodeURIComponent(consentCookie));
      return json({ consent });
    } catch {
      return json({ consent: null });
    }
  },
  
  /**
   * POST /api/cookie-consent
   * Store cookie consent
   */
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { essential, analytics, marketing } = body;
      
      const consent = {
        essential,
        analytics,
        marketing,
        timestamp: new Date().toISOString(),
      };
      
      // Set cookie headers
      const headers = new Headers();
      const cookieValue = encodeURIComponent(JSON.stringify(consent));
      
      // Set cookie with 1 year expiry
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      headers.set('Set-Cookie', 
        `cookie_consent=${cookieValue}; ` +
        `Expires=${expiryDate.toUTCString()}; ` +
        `Path=/; ` +
        `SameSite=Lax; ` +
        `${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}` +
        'HttpOnly'
      );
      
      return json({ success: true }, { headers });
    } catch (error) {
      return json(
        { success: false, error: 'Failed to save consent' },
        { status: 500 }
      );
    }
  },
});
