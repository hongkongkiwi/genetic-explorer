import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
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
        return json({ success: false, error: 'Genome ID is required' }, { status: 400 });
      }

      // Verify access to genome
      const { canAccessGenome } = require('~/utils/dataAccessControl');
      const access = await canAccessGenome(auth.id, genomeId);

      if (!access.canAccess) {
        return json({ success: false, error: 'Access denied to this genome' }, { status: 403 });
      }

      // Get genome data
      const genome = getGenome(genomeId);
      if (!genome) {
        return json({ success: false, error: 'Genome not found' }, { status: 404 });
      }

      // Get SNP data
      const snps = getUserSNPs(genomeId);

      // Generate report
      const report = generateDoctorReport(auth.id, genomeId, [], snps);

      // Log the export
      logActivity(auth.id, 'doctor_report_exported', 'genome', genomeId, {
        format,
        variantsAnalyzed: snps.length,
        findingsCount: report.clinicallySignificantFindings.length,
      }, ipAddress);

      // Format for export
      const exportData = formatReportForExport(report, format);

      // Return appropriate response
      if (format === 'json') {
        return json(exportData.content, {
          headers: {
            'Content-Disposition': `attachment; filename="${exportData.filename}"`,
            'Content-Type': exportData.contentType,
          },
        });
      }

      // For txt format, return as downloadable
      return json({
        success: true,
        report: formatDoctorReportForPrint(report),
        filename: exportData.filename,
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="${exportData.filename}"`,
          'Content-Type': exportData.contentType,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Doctor report export error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
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
        return json({ success: false, error: 'Genome ID is required' }, { status: 400 });
      }

      // Verify access to genome
      const { canAccessGenome } = require('~/utils/dataAccessControl');
      const access = await canAccessGenome(auth.id, genomeId);

      if (!access.canAccess) {
        return json({ success: false, error: 'Access denied to this genome' }, { status: 403 });
      }

      // Get genome data
      const genome = getGenome(genomeId);
      if (!genome) {
        return json({ success: false, error: 'Genome not found' }, { status: 404 });
      }

      // Get SNP data
      const snps = getUserSNPs(genomeId);

      // Generate report
      const report = generateDoctorReport(auth.id, genomeId, [], snps);

      // Log the preview
      logActivity(auth.id, 'doctor_report_previewed', 'genome', genomeId, {
        variantsAnalyzed: snps.length,
        findingsCount: report.clinicallySignificantFindings.length,
      }, ipAddress);

      return json({
        success: true,
        report,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Doctor report preview error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
