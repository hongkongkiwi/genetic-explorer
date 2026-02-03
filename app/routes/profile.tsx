import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Alert } from '~/components/ui/Alert';
import { User, Mail, Calendar, Globe, Shield, Save } from 'lucide-react';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

interface ProfileData {
  displayName: string;
  bio: string;
  birthDate: string;
  sex: string;
  ancestry: string;
  timezone: string;
  privacySettings: {
    shareAnonymized: boolean;
    allowFamilySharing: boolean;
  };
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    bio: '',
    birthDate: '',
    sex: '',
    ancestry: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    privacySettings: {
      shareAnonymized: false,
      allowFamilySharing: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        displayName: user.displayName || '',
        bio: user.profile?.bio || '',
        birthDate: user.profile?.birthDate || '',
        sex: user.profile?.sex || '',
        ancestry: user.profile?.ancestry || '',
        timezone: user.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        privacySettings: user.profile?.privacySettings || {
          shareAnonymized: false,
          allowFamilySharing: true,
        },
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser();
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsSaving(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your personal information and preferences</p>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Basic Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Display Name
              </label>
              <Input
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="How you want to be called"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Genetic Profile */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Genetic Profile
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Birth Date
              </label>
              <Input
                type="date"
                value={profile.birthDate}
                onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sex
              </label>
              <select
                value={profile.sex}
                onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ancestry
              </label>
              <Input
                value={profile.ancestry}
                onChange={(e) => setProfile({ ...profile, ancestry: e.target.value })}
                placeholder="e.g., European, Asian, African..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Timezone
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                {profile.timezone}
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Privacy Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={profile.privacySettings.allowFamilySharing}
                onChange={(e) => setProfile({
                  ...profile,
                  privacySettings: { ...profile.privacySettings, allowFamilySharing: e.target.checked }
                })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Allow Family Sharing</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enable family members to request access to your genetic profiles
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={profile.privacySettings.shareAnonymized}
                onChange={(e) => setProfile({
                  ...profile,
                  privacySettings: { ...profile.privacySettings, shareAnonymized: e.target.checked }
                })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Share Anonymized Data</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Contribute to research by sharing anonymized genetic data
                </p>
              </div>
            </label>
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
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
