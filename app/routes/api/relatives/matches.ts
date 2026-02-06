import { createAPIFileRoute } from '@tanstack/start/api';
import { logActivity } from '~/utils/database';
import { requireAuth } from '~/utils/auth.server';
import { rateLimitByUser, createRateLimitHeaders, rateLimitSensitive } from '~/utils/rateLimit';

// Mock database for match management
// In production, this would be stored in the database
const matchStore = new Map<string, {
  relativeId: string;
  relativeName: string;
  isHidden: boolean;
  notes?: string;
  contactedAt?: Date;
}>();

export const APIRoute = createAPIFileRoute('/api/relatives/matches')({
  GET: async ({ request }) => {
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
      const rateLimit = rateLimitByUser(auth.id, 60, 60 * 1000); // 60 requests per minute
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Parse query parameters
      const url = new URL(request.url);
      const relativeId = url.searchParams.get('id');

      if (!relativeId) {
        return Response.json(
          { success: false, error: 'Missing relative ID' },
          { status: 400 }
        );
      }

      // Get match details
      const matchKey = `${auth.id}:${relativeId}`;
      const matchDetails = matchStore.get(matchKey);

      // In a real implementation, this would query the database for:
      // 1. The match record
      // 2. Shared segments
      // 3. Common ancestors (if available)
      // 4. Communication history

      // Log activity
      logActivity(auth.id, 'view_match_details', 'relative', relativeId);

      return Response.json({
        success: true,
        match: {
          relativeId,
          relativeName: matchDetails?.relativeName || `Match ${relativeId}`,
          isHidden: matchDetails?.isHidden || false,
          notes: matchDetails?.notes || null,
          contactedAt: matchDetails?.contactedAt || null,
          // These would be populated from database
          sharedDNA: null,
          predictedRelationship: null,
          commonAncestors: [],
          communicationHistory: [],
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Match details error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch match details',
        },
        { status: 500 }
      );
    }
  },

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
      const rateLimit = rateLimitSensitive(auth.id);
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Parse request body
      const body = await request.json();
      const { relativeId, action, notes } = body;

      if (!relativeId || !action) {
        return Response.json(
          { success: false, error: 'Missing relativeId or action' },
          { status: 400 }
        );
      }

      if (!['hide', 'unhide', 'contact'].includes(action)) {
        return Response.json(
          { success: false, error: 'Invalid action. Must be hide, unhide, or contact' },
          { status: 400 }
        );
      }

      const matchKey = `${auth.id}:${relativeId}`;
      const existingMatch = matchStore.get(matchKey) || {
        relativeId,
        relativeName: `Match ${relativeId}`,
        isHidden: false,
        notes: undefined,
        contactedAt: undefined,
      };

      // Perform action
      switch (action) {
        case 'hide':
          existingMatch.isHidden = true;
          break;
        case 'unhide':
          existingMatch.isHidden = false;
          break;
        case 'contact':
          existingMatch.contactedAt = new Date();
          break;
      }

      // Update notes if provided
      if (notes !== undefined) {
        existingMatch.notes = notes;
      }

      // Save to store
      matchStore.set(matchKey, existingMatch);

      // Log activity
      logActivity(auth.id, `match_${action}`, 'relative', relativeId, {
        notes: notes || null,
      });

      return Response.json({
        success: true,
        message: `Match ${action}d successfully`,
        match: {
          relativeId,
          isHidden: existingMatch.isHidden,
          notes: existingMatch.notes || null,
          contactedAt: existingMatch.contactedAt || null,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Match action error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update match',
        },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ request }) => {
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
      const rateLimit = rateLimitSensitive(auth.id);
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Parse query parameters
      const url = new URL(request.url);
      const relativeId = url.searchParams.get('id');

      if (!relativeId) {
        return Response.json(
          { success: false, error: 'Missing relative ID' },
          { status: 400 }
        );
      }

      const matchKey = `${auth.id}:${relativeId}`;
      
      // Check if match exists
      if (!matchStore.has(matchKey)) {
        return Response.json(
          { success: false, error: 'Match not found' },
          { status: 404 }
        );
      }

      // Remove match
      matchStore.delete(matchKey);

      // Log activity
      logActivity(auth.id, 'match_removed', 'relative', relativeId);

      return Response.json({
        success: true,
        message: 'Match removed successfully',
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Match removal error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to remove match',
        },
        { status: 500 }
      );
    }
  },
});
