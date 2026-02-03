import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, logActivity } from '~/utils/database';
import { compareGenomes, predictRelationship } from '~/utils/relativeMatching';
import { requireAuth } from '~/utils/auth';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';

export const APIRoute = createAPIFileRoute('/api/relatives/compare')({
  POST: async ({ request }) => {
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
      const rateLimit = rateLimitByUser(auth.id, 20, 60 * 1000); // 20 comparisons per minute
      if (!rateLimit.allowed) {
        return json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit) }
        );
      }

      // Parse request body
      const body = await request.json();
      const { genomeIdA, genomeIdB } = body;

      if (!genomeIdA || !genomeIdB) {
        return json(
          { success: false, error: 'Missing genomeIdA or genomeIdB in request body' },
          { status: 400 }
        );
      }

      // Check access to both genomes
      const accessA = canAccessGenome(auth.id, genomeIdA);
      const accessB = canAccessGenome(auth.id, genomeIdB);

      if (!accessA.canAccess) {
        return json(
          { success: false, error: 'Access denied to first genome' },
          { status: 403 }
        );
      }

      if (!accessB.canAccess) {
        return json(
          { success: false, error: 'Access denied to second genome' },
          { status: 403 }
        );
      }

      // Get both genomes
      const genomeA = getGenome(genomeIdA);
      const genomeB = getGenome(genomeIdB);

      if (!genomeA) {
        return json(
          { success: false, error: 'First genome not found' },
          { status: 404 }
        );
      }

      if (!genomeB) {
        return json(
          { success: false, error: 'Second genome not found' },
          { status: 404 }
        );
      }

      // Compare genomes
      const comparison = compareGenomes(genomeA, genomeB);

      // Log activity
      logActivity(auth.id, 'genome_comparison', 'genome', genomeIdA, {
        comparedWith: genomeIdB,
        sharedCM: comparison.sharedDNA.centimorgans,
        relationship: comparison.predictedRelationship.type,
      });

      return json({
        success: true,
        comparison: {
          genomeA: {
            id: comparison.genomeA.id,
            name: comparison.genomeA.name,
          },
          genomeB: {
            id: comparison.genomeB.id,
            name: comparison.genomeB.name,
          },
          sharedDNA: {
            percentage: comparison.sharedDNA.percentage,
            centimorgans: comparison.sharedDNA.centimorgans,
            segments: comparison.sharedDNA.segments,
            largestSegment: comparison.sharedDNA.largestSegment,
            averageSegment: comparison.sharedDNA.averageSegment,
            sharedSNPs: comparison.sharedDNA.sharedSNPs,
            totalSNPsCompared: comparison.sharedDNA.totalSNPsCompared,
          },
          ibdSegments: comparison.sharedDNA.ibdSegments.map(seg => ({
            chromosome: seg.chromosome,
            start: seg.start,
            end: seg.end,
            lengthBP: seg.lengthBP,
            centimorgans: seg.centimorgans,
            snpCount: seg.snpCount,
          })),
          predictedRelationship: {
            type: comparison.predictedRelationship.type,
            displayName: comparison.predictedRelationship.displayName,
            confidence: comparison.predictedRelationship.confidence,
            possibleRelationships: comparison.predictedRelationship.possibleRelationships,
            expectedRange: comparison.predictedRelationship.expectedRange,
          },
          chromosomeComparisons: comparison.chromosomeComparisons.map(chr => ({
            chromosome: chr.chromosome,
            sharedCM: chr.sharedCM,
            sharedSNPs: chr.sharedSNPs,
            totalSNPs: chr.totalSNPs,
            coverage: chr.coverage,
            segmentCount: chr.ibdSegments.length,
          })),
          similarityScore: comparison.similarityScore,
          comparedAt: comparison.comparedAt,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Genome comparison error:', error);
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Genome comparison failed',
        },
        { status: 500 }
      );
    }
  },
});
