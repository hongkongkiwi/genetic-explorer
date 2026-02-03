import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { runFullSync, batchSyncSNPs, syncSNPFromNCBI } from '~/utils/researchSync';
import { getSyncHistory, getResearchDatabaseStats } from '~/utils/researchDatabase';

export const APIRoute = createAPIFileRoute('/api/research/sync')({
  GET: async () => {
    try {
      const history = getSyncHistory();
      const stats = getResearchDatabaseStats();
      
      return json({
        success: true,
        stats,
        recentSyncs: history.slice(0, 10),
      });
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sync status',
      }, { status: 500 });
    }
  },
  
  POST: async ({ request }) => {
    try {
      const body = await request.json().catch(() => ({}));
      const { action, rsids } = body;
      
      if (action === 'full') {
        // Run full sync in background
        runFullSync().catch(console.error);
        return json({
          success: true,
          message: 'Full sync started in background',
        });
      }
      
      if (action === 'batch' && Array.isArray(rsids)) {
        const result = await batchSyncSNPs(rsids);
        return json({
          success: true,
          result,
        });
      }
      
      if (action === 'single' && rsids?.[0]) {
        const snp = await syncSNPFromNCBI(rsids[0]);
        return json({
          success: !!snp,
          snp,
        });
      }
      
      return json({
        success: false,
        error: 'Invalid action. Use "full", "batch", or "single"',
      }, { status: 400 });
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }, { status: 500 });
    }
  },
});
