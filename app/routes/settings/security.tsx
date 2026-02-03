import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link, useSearch } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Alert } from '~/components/ui/Alert';
import { Shield, Link2, AlertTriangle, ChevronLeft, Lock, ExternalLink } from 'lucide-react';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';

interface ConnectedAccount {
  id: string;
  provider: 'google' | 'github';
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export const Route = createFileRoute('/settings/security')({
  component: SecurityPage,
});

function SecurityPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/settings/security' }) as { oauth?: string; provider?: string; error?: string };
  const { isAuthenticated, isLoading, disconnectOAuth, refreshUser } = useAuth();
  
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
    }
  }, [isAuthenticated]);

  // Handle OAuth callback messages
  useEffect(() => {
    if (search.oauth === 'linked') {
      setMessage({ type: 'success', text: `Successfully connected ${search.provider} account!` });
      loadAccounts();
      refreshUser();
      // Clear the URL params
      navigate({ to: '/settings/security', search: {} });
    } else if (search.oauth === 'error') {
      setMessage({ type: 'error', text: search.error || 'Failed to connect account' });
      navigate({ to: '/settings/security', search: {} });
    }
  }, [search]);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/auth/accounts');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccounts(data.accounts);
          setHasPassword(data.hasPassword);
        }
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
    setIsLoadingAccounts(false);
  };

  const handleDisconnect = async (provider: 'google' | 'github') => {
    setDisconnecting(provider);
    setMessage(null);

    const result = await disconnectOAuth(provider);

    if (result.success) {
      setMessage({ type: 'success', text: `Successfully disconnected ${provider} account` });
      await loadAccounts();
      await refreshUser();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to disconnect account' });
    }

    setDisconnecting(null);
  };

  const handleConnect = (provider: 'google' | 'github') => {
    // Redirect to OAuth authorization with a flag to link account
    const url = new URL('/api/auth/oauth/authorize', window.location.origin);
    url.searchParams.set('provider', provider);
    url.searchParams.set('redirectTo', '/settings/security');
    url.searchParams.set('link', 'true');
    window.location.href = url.toString();
  };

  const getProviderIcon = (provider: string) => {
    if (provider === 'google') {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    );
  };

  const getProviderLabel = (provider: string) => {
    return provider === 'google' ? 'Google' : 'GitHub';
  };

  const getProviderColor = (provider: string) => {
    return provider === 'google'
      ? 'bg-white border-gray-300'
      : 'bg-gray-900 text-white border-gray-900';
  };

  const availableProviders = [
    { provider: 'google' as const, enabled: import.meta.env.VITE_ENABLE_GOOGLE_OAUTH },
    { provider: 'github' as const, enabled: import.meta.env.VITE_ENABLE_GITHUB_OAUTH },
  ].filter(p => p.enabled);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={predefinedBreadcrumbs.settings.security()} />
      </div>
      
      <div className="mb-8">
        <Link 
          to="/settings" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-700" />
          Security
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account security and connected services
        </p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Connected Accounts */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-green-600" />
            Connected Accounts
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Link your social media accounts for easier sign-in. You can use any connected account to log in.
          </p>

          {isLoadingAccounts ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Accounts List */}
              {accounts.length > 0 && (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getProviderColor(account.provider)}`}>
                          {getProviderIcon(account.provider)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {getProviderLabel(account.provider)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {account.email}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            Connected {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={disconnecting === account.provider}
                        onClick={() => handleDisconnect(account.provider)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Providers to Connect */}
              {availableProviders.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Connect another account
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {availableProviders
                      .filter(p => !accounts.find(a => a.provider === p.provider))
                      .map(({ provider }) => (
                        <Button
                          key={provider}
                          variant="outline"
                          onClick={() => handleConnect(provider)}
                          className="gap-2"
                        >
                          {getProviderIcon(provider)}
                          Connect {getProviderLabel(provider)}
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              {/* No providers configured */}
              {availableProviders.length === 0 && accounts.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No OAuth providers are configured for this application.</p>
                </div>
              )}
            </div>
          )}

          {/* Warning about password */}
          {!hasPassword && accounts.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-400">
                    No Password Set
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You're using social login only. If you disconnect all social accounts, you'll lose access to your account. Consider setting a password for backup access.
                  </p>
                  <Link
                    to="/change-password"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-800 dark:text-amber-300 hover:underline"
                  >
                    <Lock className="w-3 h-3" />
                    Set a password
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-700" />
            Two-Factor Authentication
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Add an extra layer of security to your account by enabling 2FA.
          </p>
          <Link
            to="/settings/2fa"
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Manage 2FA Settings
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Card>

        {/* Active Sessions */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Active Sessions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            View and manage devices that are currently logged into your account.
          </p>
          <Link
            to="/settings/sessions"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Manage Sessions
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
