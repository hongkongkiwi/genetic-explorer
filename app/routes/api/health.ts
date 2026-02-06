import { createAPIFileRoute } from '@tanstack/start/api';
import { 
  performHealthCheck, 
  quickHealthCheck, 
  isApplicationReady,
  getInstanceId,
} from '~/utils/health';
import { getAllCircuitBreakerMetrics } from '~/utils/circuitBreaker';
import { getDistributedRateLimitStats } from '~/utils/distributedRateLimit';
import { rateLimitByIp } from '~/security/rate-limit';

/**
 * GET /api/health - Basic health check for load balancers
 * Returns 200 if healthy, 503 if not
 */
export const APIRoute = createAPIFileRoute('/api/health')({
  GET: async ({ request }) => {
    // Rate limit health checks (generous: 100 requests per minute)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimit = rateLimitByIp(clientIp, 60000, 100);
    if (!rateLimit.allowed) {
      return Response.json({
        status: 'rate_limited',
        message: 'Too many health check requests',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      }, { status: 429 });
    }

    const url = new URL(request.url);
    const checkType = url.searchParams.get('type') || 'basic';
    
    // Basic health check (for load balancers)
    if (checkType === 'basic') {
      const { healthy, statusCode } = quickHealthCheck();
      
      return Response.json({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      }, { status: statusCode });
    }
    
    // Readiness check (for Kubernetes)
    if (checkType === 'ready') {
      const isReady = isApplicationReady();
      return Response.json({
        ready: isReady,
        startup: { status: isReady ? 'ready' : 'starting' },
        instanceId: getInstanceId(),
        timestamp: new Date().toISOString(),
      }, { status: isReady ? 200 : 503 });
    }
    
    // Comprehensive health check
    if (checkType === 'deep') {
      const health = performHealthCheck();
      
      // Add additional metrics
      const extendedHealth = {
        ...health,
        circuitBreakers: getAllCircuitBreakerMetrics(),
        rateLimitStats: { total: 0, limited: 0 },
      };
      
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      return Response.json(extendedHealth, { status: statusCode });
    }
    
    // Default: basic check
    const { healthy, statusCode } = quickHealthCheck();
    return Response.json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  },
});
