import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/health')({
  GET: async () => {
    try {
      // Check database connection
      const db = getDb();
      db.prepare('SELECT 1').get();

      return json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          database: 'connected',
          api: 'running',
        },
        version: '1.0.0',
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      }, { status: 503 });
    }
  },
});
