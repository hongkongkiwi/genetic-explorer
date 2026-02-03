import { useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Settings, Shield, Trash2, Bell, Clock, ChevronRight, Lock, User, AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-600" />
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Section */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Account
          </h2>
          <div className="space-y-3">
            <Link
              to="/profile"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Profile Information</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal details</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              to="/notifications"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you receive updates</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </Card>

        {/* Security Section */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Security
          </h2>
          <div className="space-y-3">
            <Link
              to="/activity"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Activity Log</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Review your account activity</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link
              to="/change-password"
              className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Change Password</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </Card>

        {/* Family Sharing */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Family Sharing
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Share your genetic profiles with family members and healthcare providers.
          </p>
          <Link
            to="/sharing"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Manage Sharing
          </Link>
        </Card>

        {/* Danger Zone */}
        <Card className="p-4 sm:p-6 border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Once you delete your account, there is no going back. All your genetic data and reports will be permanently deleted.
          </p>

          <Link
            to="/delete-account"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Link>
        </Card>
      </div>
    </div>
  );
}
