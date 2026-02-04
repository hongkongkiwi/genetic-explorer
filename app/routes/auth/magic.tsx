/**
 * Magic Link Callback Handler
 * 
 * Handles the magic link verification and redirects to the app
 */

import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { useAuth } from '~/hooks/useAuth';
import { useToastActions } from '~/components/Toast';

export const Route = createFileRoute('/auth/magic')({
  component: MagicCallbackPage,
});

function MagicCallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/magic' }) as { token?: string; redirect?: string };
  const { refreshUser } = useAuth();
  const toast = useToastActions();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = search.token;
      
      if (!token) {
        setStatus('error');
        setError('Invalid or missing token');
        return;
      }

      try {
        const response = await fetch(`/api/auth/magic-link?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          await refreshUser();
          toast.success('Welcome back!', 'You have been signed in successfully');
          
          // Redirect after a short delay
          setTimeout(() => {
            const redirect = search.redirect || '/dashboard';
            navigate({ to: redirect });
          }, 1500);
        } else {
          setStatus('error');
          setError(data.error || 'Sign in failed');
        }
      } catch (err) {
        setStatus('error');
        setError('An unexpected error occurred');
      }
    };

    verifyToken();
  }, [search.token, search.redirect, navigate, refreshUser, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Signing you in...
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Please wait while we verify your magic link.
            </p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Sign In Successful!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Redirecting you to the app...
            </p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Sign In Failed
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {error}
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={() => navigate({ to: '/login/magic' })} fullWidth>
                Request New Link
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate({ to: '/login' })}
                fullWidth
              >
                Sign In with Password
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
