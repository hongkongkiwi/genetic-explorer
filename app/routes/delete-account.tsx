import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Alert } from '~/components/ui/Alert';
import { Modal, ConfirmModal } from '~/components/ui/Modal';
import { Trash2, AlertTriangle, Lock, CheckCircle, Download, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/delete-account')({
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isLoading && !isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genetic-explorer-export-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setShowExportModal(false);
      } else {
        setError('Failed to export data. Please try again.');
      }
    } catch {
      setError('An error occurred while exporting your data.');
    }
    setIsExporting(false);
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDeleted(true);
        await logout();
      } else {
        setError(data.error || 'Failed to delete account');
        setShowConfirmModal(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setShowConfirmModal(false);
    }

    setIsDeleting(false);
  };

  if (isDeleted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Account Deleted
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your account and all associated data have been permanently deleted. We're sorry to see you go.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Return Home
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          to="/settings" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Trash2 className="w-8 h-8 text-red-600" />
          Delete Account
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Permanently delete your account and all data
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        {/* Warning Card */}
        <Card className="p-4 sm:p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-red-900 dark:text-red-400 mb-2">
                This action cannot be undone
              </h2>
              <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                Once you delete your account, all your data will be permanently removed from our servers. 
                This includes:
              </p>
              <ul className="text-red-700 dark:text-red-300 text-sm space-y-1 list-disc list-inside">
                <li>Your profile information</li>
                <li>All uploaded genetic data</li>
                <li>Generated reports and analyses</li>
                <li>Sharing permissions and history</li>
                <li>Activity logs</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Export Data Reminder */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
                Export Your Data First
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Before deleting your account, you may want to download a copy of your data. 
                This includes your genetic reports and analysis results.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export My Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Form */}
        <Card className="p-4 sm:p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
            Confirm Account Deletion
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Enter your password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your current password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="uppercase"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                to="/settings"
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
              >
                Cancel
              </Link>
              <Button
                variant="danger"
                onClick={() => setShowConfirmModal(true)}
                disabled={!password || confirmText !== 'DELETE'}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Permanently Delete Account?"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Yes, Delete Everything"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Your Data"
        description="Download a copy of all your data before deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Your export will include:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li>Profile information</li>
            <li>All uploaded genetic data files</li>
            <li>Generated reports and analyses</li>
            <li>Activity logs</li>
          </ul>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              Skip
            </Button>
            <Button onClick={handleExportData} isLoading={isExporting}>
              Download Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
