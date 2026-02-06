import { createAPIFileRoute } from '@tanstack/start/api';
import type { OAuthProvider } from '~/auth/oauth';
import { getOAuthAuthorizationUrl, isOAuthProviderConfigured, generateOAuthState } from '~/auth/oauth';

const VALID_PROVIDERS: string[] = ['google', 'github'];

export const APIRoute = createAPIFileRoute('/api/auth/oauth/authorize')({
  GET: async ({ request }: { request: Request }) => {
    try {
      const url = new URL(request.url);
      const provider = url.searchParams.get('provider') as OAuthProvider;

      // Validate provider
      if (!provider || !VALID_PROVIDERS.includes(provider)) {
        return new Response(null, { 
          status: 302, 
          headers: { Location: '/login' } 
        });
      }

      // Check if provider is configured
      if (!isOAuthProviderConfigured(provider)) {
        console.warn(`OAuth provider ${provider} is not configured`);
        return new Response(null, { 
          status: 302, 
          headers: { Location: '/login' } 
        });
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
      return new Response(null, { 
        status: 302, 
        headers: { Location: authUrl } 
      });
    } catch (error) {
      console.error('OAuth authorize error:', error);
      return new Response(null, { 
        status: 302, 
        headers: { Location: '/login' } 
      });
    }
  },
});
