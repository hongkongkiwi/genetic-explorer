import { useState, useEffect } from 'react';
import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { DNALogo } from '~/components/DNALogo';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const search = useSearch({ from: '/verify-email' }) as { token?: string };
  const token = search.token;
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setResendSuccess(true);
      }
    } catch {
      // Silently fail
    }

    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
            <DNALogo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Email Verification
          </h1>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Verifying your email...
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {message}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {message}
              </p>
              
              {token && (
                <div className="space-y-3">
                  <Button
                    onClick={handleResend}
                    isLoading={isResending}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </Button>
                  
                  {resendSuccess && (
                    <p className="text-sm text-green-600">
                      Verification email sent!
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
