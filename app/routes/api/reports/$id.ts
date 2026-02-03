import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getReport, canAccessGenome } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/reports/$id')({
  GET: async ({ params, request }) => {
    try {
      const auth = requireAuth(request);
      
      const report = getReport(params.id);
      
      if (!report) {
        return json({ success: false, error: 'Report not found' }, { status: 404 });
      }

      // Check access if user is authenticated
      if (auth) {
        const access = canAccessGenome(auth.id, report.genomeId);
        if (!access.canAccess) {
          return json({ success: false, error: 'Access denied' }, { status: 403 });
        }
      }

      return json({ success: true, report });
    } catch (error) {
      console.error('Failed to fetch report:', error);
      return json({ success: false, error: 'Failed to fetch report' }, { status: 500 });
    }
  },
});
