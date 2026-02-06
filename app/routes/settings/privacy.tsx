/**
 * Privacy Settings Page
 * 
 * GDPR compliance features:
 * - Data export (portability)
 * - Account deletion
 * - Privacy preferences
 * - Data usage transparency
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Shield,
  Download,
  Trash2,
  FileJson,
  AlertTriangle,
  Check,
  ChevronRight,
  Lock,
  Eye,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card';
import { Modal } from '~/components/ui/Modal';
import { Input } from '~/components/ui/Input';
import { useAuth } from '~/hooks/useAuth';
import { PageHeader } from '~/components/PageHeader';
import { Breadcrumb, predefinedBreadcrumbs } from '~/components/Breadcrumb';

export const Route = createFileRoute('/settings/privacy' as any)({
  component: PrivacySettingsPage,
});

function PrivacySettingsPage() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [preferences, setPreferences] = useState({
    shareAnonymized: false,
    allowFamilySharing: true,
    marketingEmails: false,
    researchParticipation: false,
  });

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/gdpr');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genetic-explorer-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      
      if (response.ok) {
        window.location.href = '/auth/login?deleted=true';
      } else {
        alert('Failed to delete account. Please contact support.');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const privacySections = [
    {
      id: 'gdpr',
      title: 'Data Portability',
      description: 'Download a copy of all your personal data',
      icon: Download,
      action: (
        <Button
          variant="secondary"
          onClick={handleExportData}
          disabled={isExporting}
          aria-label="Download your data"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Data
            </>
          )}
        </Button>
      ),
    },
    {
      id: 'preferences',
      title: 'Privacy Preferences',
      description: 'Control how your data is used and shared',
      icon: Eye,
      content: (
        <div className="space-y-4 mt-4">
          <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={preferences.shareAnonymized}
              onChange={(e) => setPreferences(p => ({ ...p, shareAnonymized: e.target.checked }))}
              className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              aria-label="Contribute anonymized data to research"
            />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                Contribute to Research
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Share anonymized genetic data to help advance scientific research. 
                No personally identifying information is included.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={preferences.allowFamilySharing}
              onChange={(e) => setPreferences(p => ({ ...p, allowFamilySharing: e.target.checked }))}
              className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              aria-label="Allow family sharing"
            />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                Family Sharing
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Allow invited family members to view specific genetic insights.
                You control what is shared and can revoke access anytime.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={preferences.marketingEmails}
              onChange={(e) => setPreferences(p => ({ ...p, marketingEmails: e.target.checked }))}
              className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              aria-label="Receive marketing emails"
            />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                Marketing Communications
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Receive emails about new features, genetic insights, and special offers.
              </div>
            </div>
          </label>
        </div>
      ),
    },
    {
      id: 'transparency',
      title: 'Data Usage',
      description: 'How we handle your genetic information',
      icon: Database,
      content: (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <Lock className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">End-to-End Encryption</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your genetic data is encrypted at rest and in transit. Only you can access raw data.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <Shield className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">No Third-Party Sharing</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                We never sell or share your genetic data with third parties without explicit consent.
              </div>
            </div>
          </div>
          <a
            href="/privacy"
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">Privacy Policy</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </a>
        </div>
      ),
    },
    {
      id: 'delete',
      title: 'Delete Account',
      description: 'Permanently remove all your data',
      icon: Trash2,
      action: (
        <Button
          variant="destructive"
          onClick={() => setShowDeleteModal(true)}
          aria-label="Delete your account permanently"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={predefinedBreadcrumbs.settings.privacy()} />
        </div>
        
        <PageHeader
          title="Privacy Settings"
          description="Manage your data, privacy preferences, and GDPR rights"
          backTo="/settings"
        />

        <div className="space-y-6">
          {privacySections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <section.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    {section.action}
                  </div>
                </CardHeader>
                {section.content && (
                  <CardContent>{section.content}</CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        }}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Delete Account Permanently</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Warning:</strong> This action cannot be undone. All your data including:
            </p>
            <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
              <li>Genetic profiles and raw data</li>
              <li>Health reports and analysis</li>
              <li>Ancestry results</li>
              <li>Family sharing connections</li>
              <li>Account history</li>
            </ul>
            <p className="mt-2 text-sm text-red-800 dark:text-red-200">
              will be permanently deleted within 30 days.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">DELETE</code> to confirm
            </label>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full"
              aria-label="Type DELETE to confirm account deletion"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              className="flex-1"
              aria-label="Permanently delete account"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
