import { useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from './ui/Button';
import { cn } from '~/utils/shared/cn';

type OAuthProvider = 'google' | 'github';

interface SocialLoginButtonsProps {
  redirectTo?: string;
  className?: string;
  showDivider?: boolean;
}

interface ProviderConfig {
  name: string;
  provider: OAuthProvider;
  icon: React.ReactNode;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
}

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    name: 'Google',
    provider: 'google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    bgColor: 'bg-white',
    hoverColor: 'hover:bg-gray-50',
    borderColor: 'border-gray-300',
  },
  {
    name: 'GitHub',
    provider: 'github',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bgColor: 'bg-gray-900',
    hoverColor: 'hover:bg-gray-800',
    borderColor: 'border-gray-900',
  },
];

export function SocialLoginButtons({ redirectTo, className, showDivider = true }: SocialLoginButtonsProps) {
  const searchParams = useSearch({ strict: false });
  const [isLoading, setIsLoading] = useState<OAuthProvider | null>(null);

  // Get redirectTo from URL params or use provided value
  const finalRedirectTo = redirectTo || (searchParams as Record<string, string>).redirectTo || '/dashboard';

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setIsLoading(provider);

    // Redirect to authorize endpoint
    const url = new URL('/api/auth/oauth/authorize', window.location.origin);
    url.searchParams.set('provider', provider);
    url.searchParams.set('redirectTo', finalRedirectTo);

    window.location.href = url.toString();
  };

  // Filter providers that have environment variables configured
  // We check server-side env vars via a small JSON endpoint or feature flag
  // For now, we check VITE_ flags - these can be set to any non-empty value to enable
  const configuredProviders = PROVIDER_CONFIGS.filter((config) => {
    // Check if provider is enabled via environment flag
    // Use a simple flag instead of actual client ID for UI control
    if (config.provider === 'google') {
      return import.meta.env.VITE_ENABLE_GOOGLE_OAUTH;
    }
    if (config.provider === 'github') {
      return import.meta.env.VITE_ENABLE_GITHUB_OAUTH;
    }
    return false;
  });

  // Don't render if no providers are configured
  if (configuredProviders.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {showDivider && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {configuredProviders.map((config) => (
          <Button
            key={config.provider}
            type="button"
            variant="outline"
            fullWidth
            isLoading={isLoading === config.provider}
            onClick={() => handleOAuthLogin(config.provider)}
            className={cn(
              'flex items-center justify-center gap-3',
              'border',
              config.bgColor,
              config.hoverColor,
              config.borderColor,
              'text-gray-900'
            )}
            style={{ backgroundColor: config.provider === 'google' ? 'white' : undefined }}
          >
            <span className="flex-shrink-0">{config.icon}</span>
            <span>Continue with {config.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Check if any OAuth provider is configured
export function isOAuthConfigured(): boolean {
  return !!(
    import.meta.env.VITE_ENABLE_GOOGLE_OAUTH ||
    import.meta.env.VITE_ENABLE_GITHUB_OAUTH
  );
}
