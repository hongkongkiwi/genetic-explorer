import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getUserProfile } from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/auth/me')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const profile = getUserProfile(auth.user.id);

      return json({
        success: true,
        user: {
          id: auth.user.id,
          email: auth.user.email,
          displayName: auth.user.displayName,
          createdAt: auth.user.createdAt,
          emailVerified: auth.user.emailVerified,
          profile: profile ? {
            bio: profile.bio,
            birthDate: profile.birthDate,
            sex: profile.sex,
            ancestry: profile.ancestry,
            timezone: profile.timezone,
            privacySettings: profile.privacySettings,
          } : null,
        },
      });
    } catch (error) {
      console.error('Get user API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
