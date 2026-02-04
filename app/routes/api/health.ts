import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { 
  performHealthCheck, 
  quickHealthCheck, 
  isApplicationReady,
  getStartupStatus,
  getInstanceId,
} from '~/utils/health';
import { getAllCircuitBreakerMetrics } from '~/utils/circuitBreaker';
import { getDistributedRateLimitStats } from '~/utils/distributedRateLimit';

/**
 * GET /api/health - Basic health check for load balancers
 * Returns 200 if healthy, 503 if not
 */
export const APIRoute = createAPIFileRoute('/api/health')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const checkType = url.searchParams.get('type') || 'basic';
    
    // Basic health check (for load balancers)
    if (checkType === 'basic') {
      const { healthy, statusCode } = quickHealthCheck();
      
      return json({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      }, { status: statusCode });
    }
    
    // Readiness check (for Kubernetes)
    if (checkType === 'ready') {
      const isReady = isApplicationReady();
      const startupStatus = getStartupStatus();
      
      return json({
        ready: isReady,
        startup: startupStatus,
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
        rateLimitStats: getDistributedRateLimitStats(),
      };
      
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      return json(extendedHealth, { status: statusCode });
    }
    
    // Default: basic check
    const { healthy, statusCode } = quickHealthCheck();
    return json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  },
});
