import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth.server';
import { getGenome, getUserSNPs, logActivity } from '~/utils/database';
import { generateDoctorReport, formatReportForExport, formatDoctorReportForPrint } from '~/utils/doctorReport';
import { getClientIp } from '~/utils/rateLimit';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// GET: Generate and download doctor report
// ============================================================================

export const APIRoute = createAPIFileRoute('/api/export/doctor')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);

      const url = new URL(request.url);
      const genomeId = url.searchParams.get('genomeId');
      const format = (url.searchParams.get('format') as 'txt' | 'json' | 'pdf') || 'txt';

      if (!genomeId) {
        return Response.json({ success: false, error: 'Genome ID is required' }, { status: 400 });
      }

      // Verify access to genome
      const { canAccessGenome } = require('~/utils/dataAccessControl');
      const access = await canAccessGenome(auth.id, genomeId);

      if (!access.canAccess) {
        return Response.json({ success: false, error: 'Access denied to this genome' }, { status: 403 });
      }

      // Get genome data
      const genome = getGenome(genomeId);
      if (!genome) {
        return Response.json({ success: false, error: 'Genome not found' }, { status: 404 });
      }

      // Generate report
      const snps = genome.snps || genome;
      const report = generateDoctorReport(auth.id, snps);

      // Log the export
      logActivity(auth.id, 'doctor_report_exported', 'genome', genomeId, {
        format,
        variantsAnalyzed: 0,
        findingsCount: report.carrierResults.length,
      }, ipAddress);

      // Format for export
      const exportContent = formatReportForExport(report);

      // Return appropriate response
      if (format === 'json') {
        return new Response(exportContent, {
          headers: {
            'Content-Disposition': `attachment; filename="doctor-report-${genomeId}.json"`,
            'Content-Type': 'application/json',
          },
        });
      }

      // For txt format, return as downloadable
      return Response.json({
        success: true,
        report: formatDoctorReportForPrint(report),
        filename: `doctor-report-${genomeId}.txt`,
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="doctor-report-${genomeId}.txt"`,
          'Content-Type': 'text/plain',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Doctor report export error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },

  // POST: Preview report (without downloading)
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);

      const body = await request.json();
      const { genomeId } = body;

      if (!genomeId) {
        return Response.json({ success: false, error: 'Genome ID is required' }, { status: 400 });
      }

      // Verify access to genome
      const { canAccessGenome } = require('~/utils/dataAccessControl');
      const access = await canAccessGenome(auth.id, genomeId);

      if (!access.canAccess) {
        return Response.json({ success: false, error: 'Access denied to this genome' }, { status: 403 });
      }

      // Get genome data
      const genome = getGenome(genomeId);
      if (!genome) {
        return Response.json({ success: false, error: 'Genome not found' }, { status: 404 });
      }

      // Generate report
      const previewSnps = genome.snps || genome;
      const report = generateDoctorReport(auth.id, previewSnps);

      // Log the preview
      logActivity(auth.id, 'doctor_report_previewed', 'genome', genomeId, {
        variantsAnalyzed: report.clinicalSummary.totalVariantsAnalyzed,
        findingsCount: report.carrierResults.length,
      }, ipAddress);

      return Response.json({
        success: true,
        report,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Doctor report preview error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
