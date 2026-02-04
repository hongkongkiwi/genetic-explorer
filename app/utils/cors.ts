/**
 * CORS Configuration
 * 
 * Controls cross-origin access to the API
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://geneticexplorer.com',
  'https://app.geneticexplorer.com',
  'https://www.geneticexplorer.com',
];

// Add custom origin from environment variable if set
if (process.env.ALLOWED_ORIGIN) {
  ALLOWED_ORIGINS.push(process.env.ALLOWED_ORIGIN);
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, only allow specific origins
  // In development, allow localhost origins
  let allowedOrigin = '';
  
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      allowedOrigin = origin;
    } else if (!isProduction && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:')
    )) {
      allowedOrigin = origin;
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || (isProduction ? '' : '*'),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    const headers = new Headers(getCorsHeaders(request));
    return new Response(null, { 
      status: 204, // No content
      headers 
    });
  }
  return null;
}

/**
 * CORS middleware - applies CORS headers to responses
 */
export function corsMiddleware(request: Request, response: Response): Response {
  const corsHeaders = getCorsHeaders(request);
  
  // Create new response with CORS headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (value) {
      newResponse.headers.set(key, value);
    }
  });
  
  return newResponse;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // In development, allow localhost
  if (process.env.NODE_ENV !== 'production') {
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return true;
    }
  }
  
  return false;
}
