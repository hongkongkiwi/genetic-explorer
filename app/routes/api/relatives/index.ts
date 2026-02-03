import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome, canAccessGenome, getUserGenomes, logActivity } from '~/utils/database';
import { findRelatives, filterMatchesByRelationship } from '~/utils/relativeMatching';
import { requireAuth } from '~/utils/auth';
import { rateLimitByUser, createRateLimitHeaders } from '~/utils/rateLimit';
import type { RelationshipType } from '~/types/relatives';

export const APIRoute = createAPIFileRoute('/api/relatives')({
  GET: async ({ request }) => {
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

      // Parse query parameters
      const url = new URL(request.url);
      const filter = url.searchParams.get('filter') || 'all';
      const sort = url.searchParams.get('sort') || 'sharedDNA_desc';
      const relationshipType = url.searchParams.get('relationship') as RelationshipType | null;
      const minSharedCM = parseFloat(url.searchParams.get('minSharedCM') || '20');
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);

      // Get user's genomes
      const userGenomes = getUserGenomes(auth.id);
      if (!userGenomes || userGenomes.length === 0) {
        return json(
          { success: false, error: 'No genomes found for user' },
          { status: 404 }
        );
      }

      // Use primary genome or first available
      const primaryGenome = userGenomes.find(g => g.is_primary === 1) || userGenomes[0];
      
      // Get genome data with SNPs
      const genome = getGenome(primaryGenome.id);
      if (!genome) {
        return json(
          { success: false, error: 'Genome data not found' },
          { status: 404 }
        );
      }

      // In a real implementation, this would query the database for other users
      // who have opted in to relative matching. For now, return an empty list
      // with the proper structure.
      const matches: any[] = []; // Would be populated from database query

      // Apply filters
      let filteredMatches = matches;
      
      if (filter === 'close') {
        filteredMatches = matches.filter(m => m.sharedDNA.centimorgans >= 600);
      } else if (filter === 'distant') {
        filteredMatches = matches.filter(m => m.sharedDNA.centimorgans < 50);
      } else if (filter === 'hidden') {
        filteredMatches = matches.filter(m => m.isHidden);
      } else if (filter === 'contacted') {
        filteredMatches = matches.filter(m => m.hasContacted);
      }

      // Filter by relationship type
      if (relationshipType) {
        filteredMatches = filterMatchesByRelationship(
          filteredMatches,
          [relationshipType]
        );
      }

      // Apply sorting
      filteredMatches.sort((a, b) => {
        switch (sort) {
          case 'sharedDNA_desc':
            return b.sharedDNA.centimorgans - a.sharedDNA.centimorgans;
          case 'sharedDNA_asc':
            return a.sharedDNA.centimorgans - b.sharedDNA.centimorgans;
          case 'name_asc':
            return a.relativeName.localeCompare(b.relativeName);
          case 'matchedAt_desc':
            return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
          default:
            return b.sharedDNA.centimorgans - a.sharedDNA.centimorgans;
        }
      });

      // Pagination
      const total = filteredMatches.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMatches = filteredMatches.slice(startIndex, endIndex);

      // Log activity
      logActivity(auth.id, 'view_relatives', 'relatives', primaryGenome.id, {
        filter,
        count: paginatedMatches.length,
      });

      return json({
        success: true,
        matches: paginatedMatches.map(m => ({
          relativeId: m.relativeId,
          relativeName: m.relativeName,
          sharedDNA: m.sharedDNA,
          predictedRelationship: m.predictedRelationship,
          optInStatus: m.optInStatus,
          isVisible: m.isVisible,
          isHidden: m.isHidden,
          hasContacted: m.hasContacted,
          matchedAt: m.matchedAt,
          side: m.side,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: endIndex < total,
        },
        filters: {
          active: filter,
          sort,
          relationshipType,
          minSharedCM,
        },
        genome: {
          id: primaryGenome.id,
          nickname: primaryGenome.nickname || primaryGenome.original_filename,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit),
      });
    } catch (error) {
      console.error('Relatives listing error:', error);
      return json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch relatives',
        },
        { status: 500 }
      );
    }
  },
});
