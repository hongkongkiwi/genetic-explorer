import { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Alert } from '~/components/ui/Alert';
import { 
  Bell, 
  ChevronLeft, 
  Mail, 
  Shield, 
  Megaphone, 
  Check,
  AlertTriangle,
  Info,
  Save,
  Loader2,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Modal } from '~/components/ui/Modal';

interface PreferenceOption {
  category: string;
  name: string;
  description: string;
  mandatory: boolean;
  channels: string[];
}

interface CategoryPreference {
  enabled: boolean;
  channels: string[];
}

interface Preferences {
  categories: Record<string, CategoryPreference>;
}

export const Route = createFileRoute('/settings/notifications')({
  component: NotificationsSettingsPage,
});

function NotificationsSettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [options, setOptions] = useState<PreferenceOption[]>([]);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated]);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreferences(data.preferences);
          setOptions(data.options);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    }
    setIsLoadingPrefs(false);
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: preferences.categories,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Preferences saved successfully' });
        setHasChanges(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsSaving(false);
  };

  const updateCategory = (category: string, updates: Partial<CategoryPreference>) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: {
          ...preferences.categories[category],
          ...updates,
        },
      },
    });
    setHasChanges(true);
  };

  const toggleChannel = (category: string, channel: string) => {
    if (!preferences) return;
    
    const current = preferences.categories[category];
    const channels = current.channels.includes(channel)
      ? current.channels.filter(c => c !== channel)
      : [...current.channels, channel];
    
    updateCategory(category, { channels });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security_critical':
      case 'security_alerts':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'marketing':
        return <Megaphone className="w-5 h-5 text-purple-500" />;
      case 'research_updates':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      navigate({ to: '/settings' });
    }
  };

  if (isLoading || isLoadingPrefs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated || !preferences) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button 
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-indigo-600" />
          Notification Preferences
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Control what notifications you receive and how you receive them
        </p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      {/* Critical Security Notice */}
      <Card className="p-4 sm:p-6 mb-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Critical Security Alerts Cannot Be Disabled
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              For your protection, critical security notifications like password changes and 
              new device logins will always be sent. These are marked with a lock icon below.
            </p>
          </div>
        </div>
      </Card>

      {/* Category Preferences */}
      <div className="space-y-4">
        {options.map((option) => {
          const pref = preferences.categories[option.category];
          if (!pref) return null;

          return (
            <Card 
              key={option.category} 
              className={`p-4 sm:p-6 ${option.mandatory ? 'border-amber-200 dark:border-amber-800' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(option.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          {option.name}
                        </h2>
                        {option.mandatory && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {option.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.enabled}
                        disabled={option.mandatory}
                        onChange={() => updateCategory(option.category, { enabled: !pref.enabled })}
                        className="sr-only peer disabled:cursor-not-allowed"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${option.mandatory ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700 peer-checked:bg-indigo-600'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${option.mandatory ? 'after:translate-x-full' : ''}`}></div>
                    </label>
                  </div>

                  {pref.enabled && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Receive via:
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {option.channels.includes('email') && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.channels.includes('email')}
                              disabled={option.mandatory}
                              onChange={() => toggleChannel(option.category, 'email')}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                            />
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Email</span>
                          </label>
                        )}
                        {option.channels.includes('push') && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.channels.includes('push')}
                              onChange={() => toggleChannel(option.category, 'push')}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Smartphone className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Push</span>
                          </label>
                        )}
                        {option.channels.includes('in_app') && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.channels.includes('in_app')}
                              onChange={() => toggleChannel(option.category, 'in_app')}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Monitor className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">In-App</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Marketing Unsubscribe */}
      <Card className="p-4 sm:p-6 mt-6 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-white">Marketing Preferences</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              You can unsubscribe from all marketing emails at any time. This will not affect 
              important account or security notifications.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/notifications/preferences', {
                      method: 'DELETE',
                    });
                    if (response.ok) {
                      setMessage({ type: 'success', text: 'Unsubscribed from marketing emails' });
                      loadPreferences();
                    }
                  } catch {
                    setMessage({ type: 'error', text: 'Failed to unsubscribe' });
                  }
                }}
                disabled={!preferences.categories.marketing?.enabled}
              >
                Unsubscribe from Marketing
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:static lg:p-0 lg:bg-transparent lg:border-0 lg:mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {hasChanges ? (
              <span className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                You have unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                All changes saved
              </span>
            )}
          </div>
          <Button
            onClick={savePreferences}
            isLoading={isSaving}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <Modal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        title="Unsaved Changes"
      >
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You have unsaved changes to your notification preferences. 
            Are you sure you want to leave without saving?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUnsavedModal(false)}
            >
              Stay and Edit
            </Button>
            <Button
              onClick={() => navigate({ to: '/settings' })}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
