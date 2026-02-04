import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { DNALogo } from '~/components/DNALogo';
import { SocialLoginButtons } from '~/components/SocialLoginButtons';
import { canSignUpWithPassword } from '~/utils/signupRestrictions';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check signup restrictions
  const passwordLoginAllowed = canSignUpWithPassword();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password, rememberMe);

    if (result.success) {
      // Check if terms acceptance is required
      if (result.requiresTermsAcceptance && result.user) {
        navigate({ 
          to: '/accept-terms',
          search: { userId: result.user.id }
        });
        return;
      }
      
      // Check if 2FA is required
      if (result.requires2FA && result.pendingToken) {
        navigate({ 
          to: '/verify-2fa',
          search: {
            token: result.pendingToken,
            methods: result.methods?.join(','),
          }
        });
      } else {
        navigate({ to: '/' });
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
            <DNALogo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Sign in to access your genetic profiles
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Password login form - only shown if allowed */}
          {passwordLoginAllowed.allowed ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                  />
                </div>
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-indigo-700 hover:text-indigo-800"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {passwordLoginAllowed.reason}
              </p>
            </div>
          )}

          {/* Magic link option */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/login/magic"
              className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Sign in with magic link (no password)
            </Link>
          </div>

          {/* Social login buttons */}
          <SocialLoginButtons className="mt-6" />

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Create one
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-600 dark:text-slate-500">
          Your genetic data is stored locally and never shared without your consent.
        </p>
      </div>
    </div>
  );
}
