import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { logoutUser, requireAuth } from '~/utils/auth';
import { logActivity } from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/auth/logout')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      // Get token from cookie or Authorization header
      const cookieHeader = request.headers.get('Cookie');
      const authHeader = request.headers.get('Authorization');
      let token: string | null = null;
      
      if (cookieHeader) {
        const sessionMatch = cookieHeader.match(/session_token=([^;]+)/);
        if (sessionMatch) token = sessionMatch[1];
      }
      
      if (!token && authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }

      if (token) {
        logoutUser(token);
      }

      if (auth?.user) {
        logActivity(auth.user.id, 'user_logout', 'user', auth.user.id);
      }

      return json({ success: true }, {
        headers: {
          'Set-Cookie': 'session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
