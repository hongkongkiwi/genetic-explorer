import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Alert } from '~/components/ui/Alert';
import { Bell, Mail, FileText, Users, FlaskConical, ChevronLeft, Save } from 'lucide-react';
import { cn } from '~/utils/shared/cn';

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
});

interface NotificationPreferences {
  email: {
    newFeatures: boolean;
    researchUpdates: boolean;
    sharingInvites: boolean;
    securityAlerts: boolean;
    reportReady: boolean;
  };
  inApp: {
    newFeatures: boolean;
    researchUpdates: boolean;
    sharingActivity: boolean;
    genomeAnalysisComplete: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    newFeatures: true,
    researchUpdates: true,
    sharingInvites: true,
    securityAlerts: true,
    reportReady: true,
  },
  inApp: {
    newFeatures: true,
    researchUpdates: true,
    sharingActivity: true,
    genomeAnalysisComplete: true,
  },
};

function NotificationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.profile?.notificationPreferences) {
      setPreferences({
        ...defaultPreferences,
        ...user.profile.notificationPreferences,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationPreferences: preferences,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification preferences saved!' });
        await refreshUser();
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsSaving(false);
  };

  const toggleEmail = (key: keyof NotificationPreferences['email']) => {
    setPreferences(prev => ({
      ...prev,
      email: { ...prev.email, [key]: !prev.email[key] },
    }));
  };

  const toggleInApp = (key: keyof NotificationPreferences['inApp']) => {
    setPreferences(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: !prev.inApp[key] },
    }));
  };

  const emailOptions: { key: keyof NotificationPreferences['email']; label: string; description: string; icon: React.ElementType }[] = [
    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications about your account', icon: Bell },
    { key: 'sharingInvites', label: 'Sharing Invitations', description: 'When someone invites you to view their genetic data', icon: Users },
    { key: 'reportReady', label: 'Reports Ready', description: 'When your genetic analysis reports are complete', icon: FileText },
    { key: 'researchUpdates', label: 'Research Updates', description: 'New findings related to your genetic variants', icon: FlaskConical },
    { key: 'newFeatures', label: 'New Features', description: 'Updates about new features and improvements', icon: Bell },
  ];

  const inAppOptions: { key: keyof NotificationPreferences['inApp']; label: string; description: string; icon: React.ElementType }[] = [
    { key: 'genomeAnalysisComplete', label: 'Analysis Complete', description: 'When genome analysis finishes', icon: FileText },
    { key: 'sharingActivity', label: 'Sharing Activity', description: 'Updates about your shared profiles', icon: Users },
    { key: 'researchUpdates', label: 'Research Updates', description: 'New scientific findings', icon: FlaskConical },
    { key: 'newFeatures', label: 'New Features', description: 'Platform updates and new features', icon: Bell },
  ];

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
          to="/settings" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Notifications
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Choose how you want to be notified about activity
        </p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Email Notifications */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Email Notifications</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive updates via email</p>
            </div>
          </div>

          <div className="space-y-4">
            {emailOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = preferences.email[option.key];
              
              return (
                <label
                  key={option.key}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    isEnabled
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleEmail(option.key)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isEnabled ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isEnabled ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {option.label}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isEnabled
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300"
                  )}>
                    {isEnabled && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>}
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        {/* In-App Notifications */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">In-App Notifications</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates within the application</p>
            </div>
          </div>

          <div className="space-y-4">
            {inAppOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = preferences.inApp[option.key];
              
              return (
                <label
                  key={option.key}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    isEnabled
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleInApp(option.key)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isEnabled ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isEnabled ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {option.label}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isEnabled
                      ? "border-purple-500 bg-purple-500"
                      : "border-slate-300"
                  )}>
                    {isEnabled && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>}
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
