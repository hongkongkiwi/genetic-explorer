import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Alert } from '~/components/ui/Alert';
import { Modal, ConfirmModal } from '~/components/ui/Modal';
import { Monitor, ChevronLeft, Smartphone, Globe, Clock, LogOut, AlertTriangle, CheckCircle } from 'lucide-react';

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
}

export const Route = createFileRoute('/settings/sessions')({
  component: SessionsPage,
});

function SessionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.sessions);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    setIsLoadingSessions(false);
  };

  const revokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    setMessage(null);

    try {
      const response = await fetch(`/api/auth/sessions?id=${sessionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Session terminated successfully' });
        await loadSessions();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to terminate session' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setRevokingSession(null);
  };

  const revokeAllOtherSessions = async () => {
    setIsRevokingAll(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout_all' }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `Logged out from ${data.deletedCount} other device(s)` });
        await loadSessions();
        setShowRevokeAllModal(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to terminate sessions' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsRevokingAll(false);
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { device: 'Unknown Device', browser: 'Unknown Browser', os: 'Unknown OS' };

    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);
    
    let browser = 'Unknown Browser';
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';
    else if (/Opera|OPR/i.test(userAgent)) browser = 'Opera';

    let os = 'Unknown OS';
    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS';

    let device = 'Computer';
    if (isTablet) device = 'Tablet';
    else if (isMobile) device = 'Mobile';

    return { device, browser, os };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const otherSessionsCount = sessions.filter(s => !s.isCurrent).length;

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
      <div className="mb-8">
        <Link 
          to="/settings/security" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Security
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-700" />
          Active Sessions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage devices that are currently logged into your account
        </p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      {isLoadingSessions ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No Active Sessions
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your session may have expired. Please sign in again.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Current Session */}
          {sessions.filter(s => s.isCurrent).map(session => {
            const { device, browser, os } = parseUserAgent(session.userAgent);
            return (
              <Card key={session.id} className="p-4 sm:p-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Current Session
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                        Active Now
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>{device} • {browser} on {os}</span>
                      </div>
                      {session.ipAddress && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>IP: {session.ipAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Started {formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Other Sessions */}
          {otherSessionsCount > 0 && (
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Other Sessions ({otherSessionsCount})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevokeAllModal(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out All Others
                </Button>
              </div>

              <div className="space-y-3">
                {sessions.filter(s => !s.isCurrent).map(session => {
                  const { device, browser, os } = parseUserAgent(session.userAgent);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {device} • {browser}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {os}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {session.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {session.ipAddress}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last active {session.lastActiveAt 
                                ? formatDate(session.lastActiveAt)
                                : formatDate(session.createdAt)
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={revokingSession === session.id}
                        onClick={() => revokeSession(session.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Security Tips */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Security Tips
            </h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                If you don't recognize a session, revoke it immediately and change your password
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Sessions expire automatically after 7 days of inactivity
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Enable two-factor authentication for additional security
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* Revoke All Modal */}
      <ConfirmModal
        isOpen={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        onConfirm={revokeAllOtherSessions}
        title="Log Out From All Other Devices?"
        message={`This will terminate ${otherSessionsCount} active session(s) on other devices. You'll remain logged in on this device.`}
        confirmLabel="Log Out All Others"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isRevokingAll}
      />
    </div>
  );
}
