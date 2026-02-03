import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, logActivity } from '~/utils/database';
import { analyzeAncestry, hasSufficientCoverage } from '~/utils/ancestryAnalysis';
import { requireAuth } from '~/utils/auth';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';

export const APIRoute = createAPIFileRoute('/api/ancestry/$id')({
  GET: async ({ params, request }) => {
    try {
      // Check authentication
      const auth = requireAuth(request);
      if (!auth) {
        return json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply rate limiting
      const rateLimit = rateLimitByUser(auth.id, 30, 60 * 1000); // 30 requests per minute
      if (!rateLimit.allowed) {
        return json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit) }
        );
      }

      // Check access to genome
      const access = canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get genome data
      const genome = getGenome(params.id);
      if (!genome) {
        return json(
          { success: false, error: 'Genome not found' },
          { status: 404 }
        );
      }

      // Check for sufficient coverage
      const coverageCheck = hasSufficientCoverage(genome.snps);
      if (!coverageCheck.sufficient) {
        return json({
          success: false,
          error: 'Insufficient SNP coverage for ancestry analysis',
          coverage: coverageCheck.coverage,
          missingAims: coverageCheck.missingAims,
          recommendations: coverageCheck.recommendations,
        }, { status: 400 });
      }

      // Perform ancestry analysis
      const ancestryResult = analyzeAncestry(genome);

      // Log activity
      logActivity(auth.id, 'ancestry_analysis', 'genome', params.id, {
        confidence: ancestryResult.confidence,
        populations: ancestryResult.ethnicity.length,
      });

      return json({
        success: true,
        ancestry: {
          ethnicity: ancestryResult.ethnicity,
          haplogroups: {
            y: ancestryResult.yHaplogroup || null,
            mt: ancestryResult.mtHaplogroup,
          },
          confidence: ancestryResult.confidence,
          snpsAnalyzed: ancestryResult.snpsAnalyzed,
          analyzedAt: ancestryResult.analyzedAt,
          version: ancestryResult.version,
        },
        coverage: {
          sufficient: coverageCheck.sufficient,
          coverage: coverageCheck.coverage,
          recommendations: coverageCheck.recommendations,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Ancestry analysis error:', error);
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Ancestry analysis failed',
        },
        { status: 500 }
      );
    }
  },
});
