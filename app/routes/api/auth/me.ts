import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getUserProfile, getUserById } from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/auth/me')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const profile = getUserProfile(auth.id);
      const user = getUserById(auth.id);

      if (!user) {
        return json({ success: false, error: 'User not found' }, { status: 404 });
      }

      return json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified,
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
