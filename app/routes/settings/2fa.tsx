import { useState, useEffect, useRef } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Alert } from '~/components/ui/Alert';
import { Modal, ConfirmModal } from '~/components/ui/Modal';
import { Shield, ChevronLeft, Lock, Smartphone, Key, Copy, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface TwoFactorStatus {
  enabled: boolean;
  methods: {
    totp: boolean;
    passkey: boolean;
    email: boolean;
  };
  backupCodesRemaining: number;
}

export const Route = createFileRoute('/settings/2fa')({
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [setupStep, setSetupStep] = useState<'select' | 'totp' | 'verify'>('select');
  const [secret, setSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStatus();
    }
  }, [isAuthenticated]);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatus(data.status);
        }
      }
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
    setIsLoadingStatus(false);
  };

  const startSetup = async (method: 'totp' | 'passkey' | 'email') => {
    setIsEnabling(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });

      const data = await response.json();

      if (data.success) {
        if (method === 'totp') {
          setSecret(data.secret);
          setTotpUri(data.uri);
          setSetupStep('totp');
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start 2FA setup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsEnabling(false);
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code' });
      return;
    }

    setIsEnabling(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'totp', code: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setBackupCodes(data.backupCodes || []);
        setShowBackupCodesModal(true);
        setShowSetupModal(false);
        setSetupStep('select');
        setSecret('');
        setTotpUri('');
        setVerificationCode('');
        await loadStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid verification code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsEnabling(false);
  };

  const disable2FA = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    setIsDisabling(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Two-factor authentication has been disabled' });
        setShowDisableModal(false);
        setPassword('');
        await loadStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to disable 2FA' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsDisabling(false);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateBackupCodes = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password first' });
      return;
    }

    setIsEnabling(true);

    try {
      const response = await fetch('/api/auth/2fa/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setBackupCodes(data.backupCodes);
        setShowBackupCodesModal(true);
        setMessage({ type: 'success', text: 'New backup codes generated' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to regenerate backup codes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsEnabling(false);
  };

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
        <Breadcrumb items={predefinedBreadcrumbs.settings.twoFactor()} />
      </div>
      
      <div className="mb-8">
        <Link 
          to="/settings/security" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Security
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          Two-Factor Authentication
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Add an extra layer of security to your account
        </p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      {isLoadingStatus ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : status?.enabled ? (
        <div className="grid gap-6">
          {/* 2FA Enabled Card */}
          <Card className="p-4 sm:p-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Two-Factor Authentication is Enabled
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Your account is protected with an additional layer of security.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowBackupCodesModal(true)}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    View Backup Codes ({status.backupCodesRemaining} remaining)
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowDisableModal(true)}
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Methods */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Active Methods
            </h2>
            <div className="space-y-3">
              {status.methods.totp && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Smartphone className="w-5 h-5 text-blue-700" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Authenticator App</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Using TOTP (Google Authenticator, Authy, etc.)</p>
                  </div>
                </div>
              )}
              {status.methods.passkey && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Key className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Passkey</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Using hardware security key or biometric</p>
                  </div>
                </div>
              )}
              {status.methods.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Email Verification</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Codes sent to your email</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Enable 2FA Card */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Two-Factor Authentication is Not Enabled
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Protect your account by requiring a second form of verification when signing in.
                </p>
                <Button
                  onClick={() => {
                    setShowSetupModal(true);
                    setSetupStep('select');
                  }}
                  className="mt-4"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
            </div>
          </Card>

          {/* Why 2FA */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Why use Two-Factor Authentication?
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Protects your account even if your password is compromised</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Required for accessing sensitive genetic data</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Get backup codes for account recovery</span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => {
          setShowSetupModal(false);
          setSetupStep('select');
          setSecret('');
          setTotpUri('');
          setVerificationCode('');
          setMessage(null);
        }}
        title="Set Up Two-Factor Authentication"
      >
        {setupStep === 'select' && (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Choose your preferred 2FA method:
            </p>
            <button
              onClick={() => startSetup('totp')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Authenticator App</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Google Authenticator, Authy, 1Password, etc.</p>
              </div>
            </button>
          </div>
        )}

        {setupStep === 'totp' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Open your authenticator app (Google Authenticator, Authy, 1Password, etc.) and add this account using the secret key below:
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Account name: Your account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Secret key:</p>
              <code className="block text-sm font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-700 p-3 rounded border break-all">{secret}</code>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Enter 6-digit code from your app
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setSetupStep('select')}
              >
                Back
              </Button>
              <Button
                onClick={verifyAndEnable}
                isLoading={isEnabling}
                disabled={verificationCode.length !== 6}
                className="flex-1"
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => {
          setShowDisableModal(false);
          setPassword('');
          setMessage(null);
        }}
        title="Disable Two-Factor Authentication"
      >
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4 mr-2" />
            This will make your account less secure. Are you sure?
          </Alert>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter your password to confirm
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDisableModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={disable2FA}
              isLoading={isDisabling}
              disabled={!password}
              className="flex-1"
            >
              Disable 2FA
            </Button>
          </div>
        </div>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        title="Backup Codes"
      >
        <div className="space-y-4">
          {backupCodes.length > 0 ? (
            <>
              <Alert variant="warning">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Save these codes in a safe place. They will only be shown once!
              </Alert>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="block text-sm font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded text-center"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={copyBackupCodes}
                className="w-full"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Need new backup codes?
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={regenerateBackupCodes}
                    isLoading={isEnabling}
                    disabled={!password}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-600 dark:text-slate-400">
                Generate new backup codes to use if you lose access to your authenticator app.
              </p>

              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={regenerateBackupCodes}
                  isLoading={isEnabling}
                  disabled={!password}
                >
                  Generate
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
