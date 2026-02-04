import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getAllReports, getAccessibleGenomes } from '~/utils/database';
import { requireAuth } from '~/utils/auth';
import { requireGenome, GATED_FEATURES } from '~/utils/requireGenome';

export const APIRoute = createAPIFileRoute('/api/reports')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      // Check genome gate - reports require genome upload
      const gateCheck = requireGenome(auth.id, GATED_FEATURES.HEALTH_REPORTS);
      if (!gateCheck.allowed) {
        return gateCheck.response;
      }
      
      let reports;
      if (auth) {
        // Get reports for genomes the user has access to
        const accessibleGenomes = getAccessibleGenomes(auth.id);
        const genomeIds = accessibleGenomes.map(g => g.id);
        
        // Filter reports by accessible genomes
        const allReports = getAllReports();
        reports = allReports.filter(r => genomeIds.includes(r.genome_id));
      } else {
        reports = [];
      }

      return json({ 
        success: true, 
        reports: reports.map(r => ({
          id: r.id,
          genomeId: r.genome_id,
          generatedAt: r.generated_at,
        }))
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
    }
  },
});
