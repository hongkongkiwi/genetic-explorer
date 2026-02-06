import { createAPIFileRoute } from '@tanstack/start/api';
import { getUserProfile, updateUserProfile, logActivity } from '~/utils/database';
import { requireAuth } from '~/utils/auth.server';
import { rateLimitByUser, createRateLimitHeaders, rateLimitSensitive } from '~/utils/rateLimit';

interface OptInSettings {
  enabled: boolean;
  showName: boolean;
  showAncestry: boolean;
  allowContact: boolean;
  minRelationship: 'close' | 'distant' | 'all';
  matchNotification: boolean;
}

interface PrivacySettings {
  shareAnonymized: boolean;
  allowFamilySharing: boolean;
  relativeMatching?: OptInSettings;
}

export const APIRoute = createAPIFileRoute('/api/relatives/opt-in')({
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

      // Get user profile
      const profile = getUserProfile(auth.id);
      if (!profile) {
        return Response.json(
          { success: false, error: 'User profile not found' },
          { status: 404 }
        );
      }

      // Get relative matching settings from privacy settings
      const privacySettings = profile.privacySettings as PrivacySettings;
      const relativeSettings = privacySettings?.relativeMatching || {
        enabled: false,
        showName: false,
        showAncestry: true,
        allowContact: false,
        minRelationship: 'close',
        matchNotification: true,
      };

      return Response.json({
        success: true,
        optIn: {
          enabled: relativeSettings.enabled,
          settings: {
            showName: relativeSettings.showName,
            showAncestry: relativeSettings.showAncestry,
            allowContact: relativeSettings.allowContact,
            minRelationship: relativeSettings.minRelationship,
            matchNotification: relativeSettings.matchNotification,
          },
          lastUpdated: profile.updatedAt,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Opt-in status fetch error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch opt-in status',
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

      // Apply strict rate limiting for status changes
      const rateLimit = rateLimitSensitive(auth.id);
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Parse request body
      const body = await request.json();
      const { enabled, settings } = body as { enabled: boolean; settings?: Partial<OptInSettings> };

      if (typeof enabled !== 'boolean') {
        return Response.json(
          { success: false, error: 'Missing or invalid "enabled" field' },
          { status: 400 }
        );
      }

      // Get current profile
      const profile = getUserProfile(auth.id);
      if (!profile) {
        return Response.json(
          { success: false, error: 'User profile not found' },
          { status: 404 }
        );
      }

      // Update privacy settings
      const currentPrivacy = (profile.privacySettings || {}) as PrivacySettings;
      const currentRelativeSettings = currentPrivacy.relativeMatching || {
        enabled: false,
        showName: false,
        showAncestry: true,
        allowContact: false,
        minRelationship: 'close',
        matchNotification: true,
      };

      const updatedSettings: PrivacySettings = {
        ...currentPrivacy,
        relativeMatching: {
          ...currentRelativeSettings,
          enabled,
          ...(settings && {
            showName: settings.showName ?? currentRelativeSettings.showName,
            showAncestry: settings.showAncestry ?? currentRelativeSettings.showAncestry,
            allowContact: settings.allowContact ?? currentRelativeSettings.allowContact,
            minRelationship: settings.minRelationship ?? currentRelativeSettings.minRelationship,
            matchNotification: settings.matchNotification ?? currentRelativeSettings.matchNotification,
          }),
        },
      };

      // Save to database
      updateUserProfile(auth.id, {
        privacySettings: updatedSettings,
      });

      // Log activity
      logActivity(auth.id, enabled ? 'relatives_opt_in' : 'relatives_opt_out', 'user', auth.id, {
        settings: settings || {},
      });

      return Response.json({
        success: true,
        message: enabled 
          ? 'You have opted in to relative matching' 
          : 'You have opted out of relative matching',
        optIn: {
          enabled: updatedSettings.relativeMatching!.enabled,
          settings: {
            showName: updatedSettings.relativeMatching!.showName,
            showAncestry: updatedSettings.relativeMatching!.showAncestry,
            allowContact: updatedSettings.relativeMatching!.allowContact,
            minRelationship: updatedSettings.relativeMatching!.minRelationship,
            matchNotification: updatedSettings.relativeMatching!.matchNotification,
          },
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Opt-in update error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update opt-in status',
        },
        { status: 500 }
      );
    }
  },

  PUT: async ({ request }) => {
    try {
      // Check authentication
      const auth = requireAuth(request);
      if (!auth) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Apply strict rate limiting for privacy changes
      const rateLimit = rateLimitSensitive(auth.id);
      if (!rateLimit.allowed) {
        return Response.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60) }
        );
      }

      // Parse request body
      const body = await request.json();
      const { 
        showName, 
        showAncestry, 
        allowContact, 
        minRelationship, 
        matchNotification 
      } = body;

      // Get current profile
      const profile = getUserProfile(auth.id);
      if (!profile) {
        return Response.json(
          { success: false, error: 'User profile not found' },
          { status: 404 }
        );
      }

      // Update privacy settings
      const currentPrivacy = (profile.privacySettings || {}) as PrivacySettings;
      const currentRelativeSettings = currentPrivacy.relativeMatching || {
        enabled: false,
        showName: false,
        showAncestry: true,
        allowContact: false,
        minRelationship: 'close',
        matchNotification: true,
      };

      const updatedSettings: PrivacySettings = {
        ...currentPrivacy,
        relativeMatching: {
          ...currentRelativeSettings,
          showName: showName ?? currentRelativeSettings.showName,
          showAncestry: showAncestry ?? currentRelativeSettings.showAncestry,
          allowContact: allowContact ?? currentRelativeSettings.allowContact,
          minRelationship: minRelationship ?? currentRelativeSettings.minRelationship,
          matchNotification: matchNotification ?? currentRelativeSettings.matchNotification,
        },
      };

      // Save to database
      updateUserProfile(auth.id, {
        privacySettings: updatedSettings,
      });

      // Log activity
      logActivity(auth.id, 'relatives_privacy_update', 'user', auth.id, {
        changes: Object.keys(body),
      });

      return Response.json({
        success: true,
        message: 'Privacy settings updated successfully',
        settings: {
          showName: updatedSettings.relativeMatching!.showName,
          showAncestry: updatedSettings.relativeMatching!.showAncestry,
          allowContact: updatedSettings.relativeMatching!.allowContact,
          minRelationship: updatedSettings.relativeMatching!.minRelationship,
          matchNotification: updatedSettings.relativeMatching!.matchNotification,
        },
      }, {
        headers: createRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, 60),
      });
    } catch (error) {
      console.error('Privacy settings update error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update privacy settings',
        },
        { status: 500 }
      );
    }
  },
});
