import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getResearchDatabaseStats } from '~/utils/researchDatabase';

export const APIRoute = createAPIFileRoute('/api/research/stats')({
  GET: async () => {
    try {
      const stats = getResearchDatabaseStats();
      
      return json({
        success: true,
        stats: {
          ...stats,
          lastSyncBySource: Object.fromEntries(
            Object.entries(stats.lastSyncBySource).map(([k, v]) => [k, v.toISOString()])
          ),
        },
      });
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      }, { status: 500 });
    }
  },
});
