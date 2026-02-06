import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, logActivity } from '~/utils/database';
import { compareGenomes, predictRelationship } from '~/utils/relativeMatching';
import { requireAuth } from '~/utils/auth.server';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';

interface ComparisonRequestBody {
  genomeIdA: string;
  genomeIdB: string;
  includeSegments?: boolean;
  includeChromosomes?: boolean;
}

export const APIRoute = createAPIFileRoute('/api/genomes/compare')({
  POST: async ({ request }) => {
    try {
      // Check authentication
      const auth = requireAuth(request);
      if (!auth) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply rate limiting
      const rateLimit = rateLimitByUser(auth.id, 20, 60 * 1000); // 20 comparisons per minute
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Parse request body
      const body = await request.json() as ComparisonRequestBody;
      const { genomeIdA, genomeIdB, includeSegments = true, includeChromosomes = false } = body;

      if (!genomeIdA || !genomeIdB) {
        return Response.json(
          { success: false, error: 'Missing genomeIdA or genomeIdB in request body' },
          { status: 400 }
        );
      }

      if (genomeIdA === genomeIdB) {
        return Response.json(
          { success: false, error: 'Cannot compare a genome with itself' },
          { status: 400 }
        );
      }

      // Check access to both genomes
      const accessA = canAccessGenome(auth.id, genomeIdA);
      const accessB = canAccessGenome(auth.id, genomeIdB);

      if (!accessA.canAccess) {
        return Response.json(
          { success: false, error: 'Access denied to first genome' },
          { status: 403 }
        );
      }

      if (!accessB.canAccess) {
        return Response.json(
          { success: false, error: 'Access denied to second genome' },
          { status: 403 }
        );
      }

      // Get both genomes
      const genomeA = getGenome(genomeIdA);
      const genomeB = getGenome(genomeIdB);

      if (!genomeA) {
        return Response.json(
          { success: false, error: 'First genome not found' },
          { status: 404 }
        );
      }

      if (!genomeB) {
        return Response.json(
          { success: false, error: 'Second genome not found' },
          { status: 404 }
        );
      }

      // Compare genomes
      const snpsA = genomeA.snps || genomeA;
      const snpsB = genomeB.snps || genomeB;
      const comparison = compareGenomes(snpsA, snpsB);

      // Build response based on requested detail level
      const response: Record<string, unknown> = {
        success: true,
        comparison: {
          genomeA: {
            id: genomeA.id || 'A',
            name: genomeA.filename || 'Genome A',
          },
          genomeB: {
            id: genomeB.id || 'B',
            name: genomeB.filename || 'Genome B',
          },
          summary: {
            sharedDNA: {
              percentage: (comparison.sharedDNA / 3500) * 100, // Rough estimate
              centimorgans: comparison.sharedDNA,
              segments: comparison.sharedSegments,
              largestSegment: comparison.sharedDNA / Math.max(comparison.sharedSegments, 1),
              averageSegment: comparison.sharedDNA / Math.max(comparison.sharedSegments, 1),
              sharedSNPs: 0,
              totalSNPsCompared: Math.min(snpsA.length || 0, snpsB.length || 0),
            },
            predictedRelationship: {
              type: comparison.predictedRelationship.toLowerCase().replace(/\s+/g, '_'),
              displayName: comparison.predictedRelationship,
              confidence: comparison.confidence,
              possibleRelationships: [comparison.predictedRelationship],
              expectedRange: `${Math.max(0, comparison.sharedDNA - 200)}-${comparison.sharedDNA + 200} cM`,
            },
            similarityScore: comparison.sharedDNA / 3500,
            comparedAt: new Date().toISOString(),
          },
        },
      };

      // Include IBD segments if requested (simplified - not available in basic implementation)
      if (includeSegments) {
        (response.comparison as Record<string, unknown>).ibdSegments = [];
      }

      // Include chromosome comparisons if requested (simplified)
      if (includeChromosomes) {
        (response.comparison as Record<string, unknown>).chromosomes = [];
      }

      // Log activity
      logActivity(auth.id, 'genome_comparison', 'genome', genomeIdA, {
        comparedWith: genomeIdB,
        sharedCM: comparison.sharedDNA,
        relationship: comparison.predictedRelationship,
      });

      return Response.json(response, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Genome comparison error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Genome comparison failed',
        },
        { status: 500 }
      );
    }
  },
});
