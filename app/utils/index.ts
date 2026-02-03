// Central exports for utilities

// Database
export { getDb, saveGenome, getGenome, deleteGenome, getAllGenomes } from './database';

// Performance
export { 
  performanceMonitor, 
  mark, 
  measure, 
  createLazyLoader, 
  prefetchOnHover,
} from './performance';

// Auth
export { 
  requireAuth, 
  getAuthUser,
  getCurrentUser,
  type AuthResult,
} from './auth';

// Security
export {
  getSecurityHeaders,
  sanitizeInput,
  sanitizeFilename,
  generateNonce,
  getSecureCookieOptions,
  logSecurityEvent,
  detectSuspiciousActivity,
} from './security';

// Rate Limiting
export {
  rateLimitByIp,
  rateLimitByUser,
  rateLimitAuth,
  rateLimitSensitive,
  getClientIp,
  createRateLimitHeaders,
} from './rateLimit';
