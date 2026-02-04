/**
 * Magic Link Login Page
 * 
 * Allows users to sign in without a password using an email link
 */

import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { DNALogo } from '~/components/DNALogo';
import { useToastActions } from '~/components/Toast';

export const Route = createFileRoute('/login/magic')({
  component: MagicLoginPage,
});

function MagicLoginPage() {
  const navigate = useNavigate();
  const toast = useToastActions();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSent(true);
        toast.success('Magic link sent!', 'Check your email for the sign-in link');
      } else {
        toast.error('Request failed', data.error || 'Please try again');
      }
    } catch (error) {
      toast.error('Request failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
            <DNALogo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Magic Link Sign In
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            No password needed. We'll send you a secure sign-in link.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl">
          {isSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We've sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                The link expires in 15 minutes and can only be used once.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsSent(false);
                  setEmail('');
                }}
                fullWidth
              >
                Send to a different email
              </Button>
            </motion.div>
          ) : (
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
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                disabled={!email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                <p>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to password login
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          Magic links expire in 15 minutes and can only be used once.
        </p>
      </div>
    </div>
  );
}
