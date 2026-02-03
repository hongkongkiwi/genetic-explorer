import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getUserProfile, updateUserProfile, updateUser } from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/profile')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const profile = getUserProfile(auth.id);

      return json({
        success: true,
        profile: profile ? {
          bio: profile.bio,
          birthDate: profile.birthDate,
          sex: profile.sex,
          ancestry: profile.ancestry,
          timezone: profile.timezone,
          notificationPreferences: profile.notificationPreferences,
          privacySettings: profile.privacySettings,
        } : null,
      });
    } catch (error) {
      console.error('Get profile API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },

  PUT: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { displayName, bio, birthDate, sex, ancestry, timezone, notificationPreferences, privacySettings } = body;

      // Update user display name
      if (displayName !== undefined) {
        updateUser(auth.id, { displayName });
      }

      // Update profile
      updateUserProfile(auth.id, {
        bio,
        birthDate,
        sex,
        ancestry,
        timezone,
        notificationPreferences,
        privacySettings,
      });

      return json({ success: true });
    } catch (error) {
      console.error('Update profile API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
