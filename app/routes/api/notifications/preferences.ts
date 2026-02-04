import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getPreferenceOptions,
  unsubscribeFromMarketing,
  isSubscribedToMarketing,
  type NotificationCategory,
  type CategoryPreference,
} from '~/utils/notificationPreferences';

// ============================================================================
// GET: Get user's notification preferences
// ============================================================================

export const APIRouteGet = createAPIFileRoute('/api/notifications/preferences')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      const preferences = getNotificationPreferences(auth.id);
      const options = getPreferenceOptions();

      return json({
        success: true,
        preferences: {
          categories: preferences.categories,
          updatedAt: preferences.updatedAt,
        },
        options,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Get notification preferences error:', error);
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});

// ============================================================================
// POST: Update notification preferences
// ============================================================================

export const APIRouteUpdate = createAPIFileRoute('/api/notifications/preferences')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const body = await request.json();
      const { categories } = body;

      if (!categories) {
        return json(
          { success: false, error: 'No preferences provided' },
          { status: 400 }
        );
      }

      // Validate category updates
      for (const [category, prefs] of Object.entries(categories)) {
        // Validate channels
        if (prefs && typeof prefs === 'object' && 'channels' in prefs) {
          const validChannels = ['email', 'push', 'in_app'];
          const channels = (prefs as CategoryPreference).channels;
          
          if (!Array.isArray(channels)) {
            return json(
              { success: false, error: `Invalid channels for ${category}` },
              { status: 400 }
            );
          }
          
          for (const channel of channels) {
            if (!validChannels.includes(channel)) {
              return json(
                { success: false, error: `Invalid channel: ${channel}` },
                { status: 400 }
              );
            }
          }
        }
      }

      const result = updateNotificationPreferences(
        auth.id,
        categories as Record<NotificationCategory, Partial<CategoryPreference>>
      );

      if (!result.success) {
        return json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      // Get updated preferences
      const updated = getNotificationPreferences(auth.id);

      return json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: {
          categories: updated.categories,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Update notification preferences error:', error);
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});

// ============================================================================
// DELETE: Unsubscribe from marketing (one-click)
// ============================================================================

export const APIRouteUnsubscribe = createAPIFileRoute('/api/notifications/preferences')({
  DELETE: async ({ request }) => {
    try {
      // This endpoint can work with token-based auth for one-click unsubscribe
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      const userId = url.searchParams.get('userId');

      if (token && userId) {
        // Token-based unsubscribe (from email link)
        // Verify token here if implementing token verification
        // For now, require auth
        return json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Auth-based unsubscribe
      const auth = requireAuth(request);
      
      const success = unsubscribeFromMarketing(auth.id);

      if (success) {
        return json({
          success: true,
          message: 'You have been unsubscribed from marketing emails',
        });
      } else {
        return json(
          { success: false, error: 'Failed to unsubscribe' },
          { status: 500 }
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Unsubscribe error:', error);
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});
