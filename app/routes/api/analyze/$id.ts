import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, saveReport, canAccessGenome, logActivity } from '~/utils/database';
import { analyzeGenome, getDrugInteractions } from '~/utils/databaseQueries';
import { generateFullReport } from '~/utils/llmAnalysis';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/analyze/$id')({
  POST: async ({ params, request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // Check access to genome
      const access = canAccessGenome(auth.user.id, params.id);
      if (!access.canAccess) {
        return json({ success: false, error: 'Access denied' }, { status: 403 });
      }

      const genome = getGenome(params.id);
      
      if (!genome) {
        return json({ success: false, error: 'Genome not found' }, { status: 404 });
      }

      // Analyze variants
      const variants = await analyzeGenome(genome.snps);
      
      // Get drug interactions
      const drugInteractions = await getDrugInteractions(variants);
      
      // Generate full report
      const report = await generateFullReport(genome.snps, variants, drugInteractions);
      report.genomeId = genome.id;
      
      // Save report with user_id
      const reportId = saveReport(genome.id, auth.user.id, report);

      // Log activity
      logActivity(auth.user.id, 'report_generated', 'report', reportId, {
        genomeId: genome.id,
      });

      return json({ 
        success: true, 
        reportId,
        report: {
          ...report,
          geneticReport: {
            ...report.geneticReport,
            categories: Object.fromEntries(
              Object.entries(report.geneticReport.categories).map(([k, v]) => [k, v.length])
            ),
          },
        }
      });
    } catch (error) {
      console.error('Analysis error:', error);
      return json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }, { status: 500 });
    }
  },
});
