import { useState, useEffect } from 'react';
import { createFileRoute, Link, useSearch, useNavigate } from '@tanstack/react-router';
import { DNALogo } from '~/components/DNALogo';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import { useAuth } from '~/hooks/useAuth';
import { Users, UserPlus, CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/accept-invite')({
  component: AcceptInvitePage,
});

interface InviteDetails {
  ownerEmail: string;
  ownerName: string | null;
  permissionLevel: 'view' | 'download' | 'manage';
}

function AcceptInvitePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/accept-invite' }) as { token?: string };
  const token = search.token;
  const { user, isAuthenticated, login, register } = useAuth();
  
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For non-authenticated users
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  useEffect(() => {
    const validateInvite = async () => {
      if (!token) {
        setIsLoading(false);
        setError('No invitation token provided');
        return;
      }

      try {
        const response = await fetch(`/api/sharing/invite?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setInviteDetails(data.invite);
          setIsValid(true);
        } else {
          setError(data.error || 'Invalid or expired invitation');
        }
      } catch {
        setError('Failed to validate invitation');
      }

      setIsLoading(false);
    };

    validateInvite();
  }, [token]);

  const handleAcceptAuthenticated = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/sharing/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setAcceptSuccess(true);
      } else {
        setError(data.error || 'Failed to accept invitation');
      }
    } catch {
      setError('An unexpected error occurred');
    }

    setIsSubmitting(false);
  };

  const handleAcceptWithAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let authResult;

      if (mode === 'login') {
        authResult = await login(email, password);
      } else {
        authResult = await register(email, password, displayName || undefined);
        if (authResult.success) {
          // Auto-login after registration
          authResult = await login(email, password);
        }
      }

      if (authResult.success) {
        // Now accept the invite
        const acceptResponse = await fetch('/api/sharing/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const acceptData = await acceptResponse.json();

        if (acceptResponse.ok) {
          setAcceptSuccess(true);
        } else {
          setError(acceptData.error || 'Failed to accept invitation');
        }
      } else {
        setError(authResult.error || 'Authentication failed');
      }
    } catch {
      setError('An unexpected error occurred');
    }

    setIsSubmitting(false);
  };

  const getPermissionLabel = (level: string) => {
    switch (level) {
      case 'view': return 'View genetic data and reports';
      case 'download': return 'View and download genetic data';
      case 'manage': return 'Full access including analysis';
      default: return 'View access';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Validating invitation...</p>
        </Card>
      </div>
    );
  }

  if (error || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Invalid Invitation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'This invitation is invalid or has expired.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </Card>
      </div>
    );
  }

  if (acceptSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Invitation Accepted!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You now have access to shared genetic profiles. Visit the Sharing page to view them.
          </p>
          <div className="space-y-3">
            <Link
              to="/sharing"
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View Shared Profiles
            </Link>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Family Sharing
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Accept invitation to view shared genetic profiles
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl">
          {/* Invite Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {inviteDetails?.ownerName?.[0] || inviteDetails?.ownerEmail[0]}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {inviteDetails?.ownerName || inviteDetails?.ownerEmail}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  wants to share with you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <UserPlus className="w-4 h-4" />
              {getPermissionLabel(inviteDetails?.permissionLevel || 'view')}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          {isAuthenticated ? (
            // Authenticated user - just accept
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Signed in as <strong>{user?.email}</strong>
              </p>
              <Button
                onClick={handleAcceptAuthenticated}
                isLoading={isSubmitting}
                size="lg"
                className="w-full"
              >
                Accept Invitation
              </Button>
            </div>
          ) : (
            // Non-authenticated user - show login/register
            <>
              {/* Mode Toggle */}
              <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleAcceptWithAuth} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Display Name
                    </label>
                    <Input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmitting}
                >
                  {mode === 'login' ? 'Sign In & Accept' : 'Create Account & Accept'}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
