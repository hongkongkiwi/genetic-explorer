import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth.server';
import { getUserProfile, getUserById } from '~/utils/database';
import { getUserTermsStatus } from '~/utils/terms';

export const APIRoute = createAPIFileRoute('/api/auth/me')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      if (!auth) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const profile = getUserProfile(auth.id);
      const user = getUserById(auth.id);

      if (!user) {
        return Response.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      // Get terms acceptance status
      const termsStatus = getUserTermsStatus(auth.id);

      return Response.json({
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
          termsStatus,
        },
      });
    } catch (error) {
      console.error('Get user API error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
