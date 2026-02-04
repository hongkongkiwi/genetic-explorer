import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { DNALogo } from '~/components/DNALogo';
import { SocialLoginButtons } from '~/components/SocialLoginButtons';
import { canSignUp, canSignUpWithPassword, hasActiveRestrictions } from '~/utils/signupRestrictions';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, FileText, Shield } from 'lucide-react';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // Check signup restrictions
  const signupAllowed = canSignUp();
  const passwordSignupAllowed = canSignUpWithPassword();
  const restrictionsActive = hasActiveRestrictions();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  // Show signup disabled message if signup is completely disabled
  if (!signupAllowed.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Registration Closed
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {signupAllowed.reason}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </Card>
      </div>
    );
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every(r => r.met);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, displayName || undefined, true);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Account Created!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your account has been successfully created. You can now sign in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
            <DNALogo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Start your genetic journey today
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Password registration form - only shown if allowed */}
          {passwordSignupAllowed.allowed ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
              </div>

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

                {/* Password requirements */}
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center text-sm">
                      {req.met ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mr-2" />
                      )}
                      <span className={req.met ? 'text-green-600' : 'text-slate-500'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="space-y-3 py-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  To create an account, you must accept:
                </p>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the{' '}
                    <Link 
                      to="/terms" 
                      target="_blank"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Terms of Service
                    </Link>
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the{' '}
                    <Link 
                      to="/privacy" 
                      target="_blank"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3" />
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={!allRequirementsMet || !passwordsMatch || !acceptedTerms || !acceptedPrivacy}
              >
                Create Account
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {passwordSignupAllowed.reason}
              </p>
            </div>
          )}

          {/* Social login buttons */}
          <SocialLoginButtons className="mt-6" />

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-700 hover:text-blue-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>


      </div>
    </div>
  );
}
