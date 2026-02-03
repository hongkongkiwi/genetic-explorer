import { redirect } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getOAuthAuthorizationUrl, isOAuthProviderConfigured, OAuthProvider } from '~/utils/oauth';

export const APIRoute = createAPIFileRoute('/api/auth/oauth/authorize')({
  GET: async ({ request, params }) => {
    try {
      const url = new URL(request.url);
      const provider = url.searchParams.get('provider') as OAuthProvider;

      // Validate provider
      if (!provider || !['google', 'github'].includes(provider)) {
        throw redirect({ to: '/login', statusCode: 302 });
      }

      // Check if provider is configured
      if (!isOAuthProviderConfigured(provider)) {
        console.warn(`OAuth provider ${provider} is not configured`);
        throw redirect({ to: '/login', statusCode: 302 });
      }

      // Get redirect URI
      const callbackUrl = `${url.origin}/api/auth/oauth/callback`;
      const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

      // Generate authorization URL
      const authUrl = getOAuthAuthorizationUrl(provider, callbackUrl, undefined);

      // Redirect to OAuth provider
      throw redirect({ to: authUrl, statusCode: 302 });
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error('OAuth authorize error:', error);
      throw redirect({ to: '/login', statusCode: 302 });
    }
  },
});
