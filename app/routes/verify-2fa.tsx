/**
 * 2FA Verification Page
 * 
 * Users are redirected here after successful password login
 * if they have 2FA enabled on their account.
 * 
 * Supports: TOTP codes, Backup codes
 */

import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  Shield, 
  KeyRound, 
  RefreshCw, 
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Card } from '~/components/ui/Card';
import { useAuth } from '~/hooks/useAuth';

interface TwoFAMethod {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const Route = createFileRoute('/verify-2fa')({
  component: Verify2FAPage,
});

function Verify2FAPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/verify-2fa' }) as { token?: string; methods?: string };
  const { refreshUser } = useAuth();
  
  const [pendingToken, setPendingToken] = useState<string>('');
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('totp');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Parse search params on mount
  useEffect(() => {
    const token = search.token;
    const methods = search.methods?.split(',') || ['totp', 'backup'];
    
    if (!token) {
      // No pending token - redirect to login
      navigate({ to: '/login' });
      return;
    }
    
    setPendingToken(token);
    setAvailableMethods(methods);
    
    // Set default method
    if (methods.includes('totp')) {
      setSelectedMethod('totp');
    } else if (methods.includes('passkey')) {
      setSelectedMethod('passkey');
    } else {
      setSelectedMethod('backup');
    }
  }, [search, navigate]);

  const methods: TwoFAMethod[] = [
    {
      id: 'totp',
      label: 'Authenticator App',
      description: 'Enter code from your authenticator app',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: 'backup',
      label: 'Backup Code',
      description: 'Use a single-use backup code',
      icon: <KeyRound className="w-5 h-5" />,
    },
  ];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingToken,
          method: selectedMethod,
          code: code.replace(/\s/g, ''),
          rememberMe,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshUser();
        navigate({ to: '/dashboard' });
      } else {
        setError(data.error || 'Verification failed');
        setCode('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBackupCode = (value: string) => {
    // Format as XXXXX-XXXXX for backup codes
    const cleaned = value.replace(/\s|-/g, '').toUpperCase();
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}`;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (selectedMethod === 'backup') {
      value = formatBackupCode(value);
    } else {
      // TOTP codes - just numbers, max 6 digits
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setCode(value);
  };

  if (!pendingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Two-Factor Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Enter your verification code to continue
            </p>
          </div>

          {/* Method Selection */}
          <div className="space-y-3 mb-6">
            {methods.map((method) => {
              if (!availableMethods.includes(method.id)) return null;
              
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method.id);
                    setCode('');
                    setError(null);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === method.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {method.label}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {method.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Code Input Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label 
                htmlFor="code" 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {selectedMethod === 'totp' ? '6-digit code' : 'Backup code'}
              </label>
              <div className="relative">
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder={selectedMethod === 'totp' ? '000000' : 'XXXXX-XXXXX'}
                  className="text-center text-2xl tracking-widest font-mono pr-12"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="one-time-code"
                />
                {code && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label="Copy code"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {selectedMethod === 'totp' 
                  ? 'Open your authenticator app to get your code'
                  : 'Each backup code can only be used once'
                }
              </p>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Remember this device for 30 days
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={code.length < (selectedMethod === 'totp' ? 6 : 10)}
            >
              Verify
            </Button>
          </form>

          {/* Help Links */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <button
              onClick={() => navigate({ to: '/login' })}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
            
            {selectedMethod !== 'backup' && availableMethods.includes('backup') && (
              <button
                onClick={() => setSelectedMethod('backup')}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Lost access to your authenticator? Use a backup code
              </button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
