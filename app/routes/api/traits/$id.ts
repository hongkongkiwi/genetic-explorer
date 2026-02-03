import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, logActivity } from '~/utils/database';
import { 
  analyzeTraits, 
  compareTraits, 
  generateTraitsReport,
  filterTraitResults,
  getAnalysisStats 
} from '~/utils/traitsAnalysis';
import { requireAuth } from '~/utils/auth';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';
import type { TraitCategory, ConfidenceLevel } from '~/types/traits';

export const APIRoute = createAPIFileRoute('/api/traits/$id')({
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
      const rateLimit = rateLimitByUser(auth.id, 50, 60 * 1000); // 50 requests per minute
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

      // Parse query parameters
      const url = new URL(request.url);
      const category = url.searchParams.get('category') as TraitCategory | 'all' | null;
      const confidence = url.searchParams.get('confidence') as ConfidenceLevel | 'all' | null;
      const search = url.searchParams.get('search');
      const hasData = url.searchParams.get('hasData');

      // Perform traits analysis
      let results = analyzeTraits(genome);

      // Apply filters
      results = filterTraitResults(results, {
        category: category || 'all',
        confidence: confidence || 'all',
        search: search || undefined,
        hasData: hasData !== null ? hasData === 'true' : undefined,
      });

      // Get statistics
      const stats = getAnalysisStats(results);

      // Log activity
      logActivity(auth.id, 'traits_analysis', 'genome', params.id, {
        category: category || 'all',
        resultsCount: results.length,
      });

      return json({
        success: true,
        traits: results.map(r => ({
          id: r.trait.id,
          name: r.trait.name,
          category: r.trait.category,
          description: r.trait.description,
          icon: r.trait.icon,
          predictedPhenotype: r.predictedPhenotype,
          userGenotype: r.userGenotype,
          confidence: r.confidence,
          explanation: r.explanation,
          funFact: r.funFact,
        })),
        stats,
        filters: {
          category: category || 'all',
          confidence: confidence || 'all',
          search: search || null,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Traits analysis error:', error);
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Traits analysis failed',
        },
        { status: 500 }
      );
    }
  },

  POST: async ({ params, request }) => {
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

      // Check access to primary genome
      const access = canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return json(
          { success: false, error: 'Access denied to primary genome' },
          { status: 403 }
        );
      }

      // Parse request body
      const body = await request.json();
      const { compareGenomeId } = body;

      if (!compareGenomeId) {
        return json(
          { success: false, error: 'Missing compareGenomeId in request body' },
          { status: 400 }
        );
      }

      // Check access to comparison genome
      const compareAccess = canAccessGenome(auth.id, compareGenomeId);
      if (!compareAccess.canAccess) {
        return json(
          { success: false, error: 'Access denied to comparison genome' },
          { status: 403 }
        );
      }

      // Get both genomes
      const genomeA = getGenome(params.id);
      const genomeB = getGenome(compareGenomeId);

      if (!genomeA || !genomeB) {
        return json(
          { success: false, error: 'One or both genomes not found' },
          { status: 404 }
        );
      }

      // Compare traits
      const comparison = compareTraits(genomeA, genomeB);

      // Calculate summary statistics
      const identical = comparison.filter(c => c.similarity === 'identical').length;
      const similar = comparison.filter(c => c.similarity === 'similar').length;
      const different = comparison.filter(c => c.similarity === 'different').length;

      // Log activity
      logActivity(auth.id, 'traits_comparison', 'genome', params.id, {
        compareGenomeId,
        identical,
        similar,
        different,
      });

      return json({
        success: true,
        comparison: {
          genomeA: { id: params.id },
          genomeB: { id: compareGenomeId },
          summary: {
            total: comparison.length,
            identical,
            similar,
            different,
          },
          traits: comparison.map(c => ({
            traitId: c.trait.id,
            traitName: c.trait.name,
            category: c.trait.category,
            genomeA: {
              phenotype: c.genomeAResult.predictedPhenotype,
              genotype: c.genomeAResult.userGenotype,
              confidence: c.genomeAResult.confidence,
            },
            genomeB: {
              phenotype: c.genomeBResult.predictedPhenotype,
              genotype: c.genomeBResult.userGenotype,
              confidence: c.genomeBResult.confidence,
            },
            samePhenotype: c.samePhenotype,
            similarity: c.similarity,
          })),
        },
      }, {
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Traits comparison error:', error);
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Traits comparison failed',
        },
        { status: 500 }
      );
    }
  },
});
