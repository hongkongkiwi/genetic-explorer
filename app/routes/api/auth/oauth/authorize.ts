import { redirect } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getOAuthAuthorizationUrl, isOAuthProviderConfigured, OAuthProvider, generateOAuthState } from '~/utils/oauth';

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
      const linkMode = url.searchParams.get('link') === 'true';

      // Generate state with redirect info
      const stateData = {
        provider,
        redirectTo,
        link: linkMode,
      };
      const state = generateOAuthState(stateData);

      // Generate authorization URL
      const authUrl = getOAuthAuthorizationUrl(provider, callbackUrl, state);

      // Redirect to OAuth provider
      throw redirect({ to: authUrl, statusCode: 302 });
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error('OAuth authorize error:', error);
      throw redirect({ to: '/login', statusCode: 302 });
    }
  },
});
