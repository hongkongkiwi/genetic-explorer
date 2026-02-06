import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Settings, Key, Trash2, Plus, Terminal, ChevronRight, AlertTriangle } from 'lucide-react';
import { Breadcrumb } from '~/components/Breadcrumb';

interface AuthorizedApp {
  id: string;
  name: string;
  description: string | null;
  tokenPrefix: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export const Route = createFileRoute('/settings/authorized-apps' as any)({
  component: AuthorizedAppsPage,
});

function AuthorizedAppsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [apps, setApps] = useState<AuthorizedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAppToken, setNewAppToken] = useState<string | null>(null);
  const [appName, setAppName] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated]);

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/authorized-apps', {
        headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` },
      });
      const data = await response.json();
      if (data.success) setApps(data.applications);
    } catch (err) {
      console.error('Failed to fetch apps:', err);
    } finally {
      setLoading(false);
    }
  };

  const createApp = async () => {
    if (!appName.trim()) return;
    try {
      const response = await fetch('/api/authorized-apps', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: appName }),
      });
      const data = await response.json();
      if (data.success) {
        setNewAppToken(data.application.token);
        fetchApps();
        setAppName('');
      }
    } catch (err) {
      console.error('Failed to create app:', err);
    }
  };

  const deleteApp = async (id: string) => {
    if (!confirm('Revoke this application?')) return;
    try {
      await fetch(`/api/authorized-apps/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('session_token')}` },
      });
      fetchApps();
    } catch (err) {
      console.error('Failed to delete app:', err);
    }
  };

  const closeModal = () => setNewAppToken(null);

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb items={[{ to: '/settings', label: 'Settings' }, { label: 'Authorized Applications' }]} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Key className="w-8 h-8 text-slate-600" />
          Authorized Applications
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage API tokens for the MCP server and CLI tools
        </p>
      </div>

      <Card className="p-4 sm:p-6 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <div className="flex gap-4">
          <Terminal className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">MCP Server & CLI Access</h3>
            <p className="text-blue-700 mt-1 text-sm">
              Create API tokens to use with the Genetic Data MCP Server or CLI tool.
            </p>
          </div>
        </div>
      </Card>

      {newAppToken && (
        <Card className="p-4 sm:p-6 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Token Created</h3>
          <p className="text-sm text-green-700 mb-3">Copy this token now - you will not see it again:</p>
          <code className="block p-3 bg-white dark:bg-slate-800 rounded font-mono text-sm break-all border">
            {newAppToken}
          </code>
          <button onClick={closeModal} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
            I've copied my token
          </button>
        </Card>
      )}

      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Your Applications</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Application name"
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <button onClick={createApp} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </div>

        {apps.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No authorized applications yet.</p>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{app.name}</h3>
                  <p className="text-sm text-slate-500">Token: {app.tokenPrefix}...</p>
                  <div className="flex gap-2 mt-2">
                    {app.permissions.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 bg-slate-100 rounded">{p}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteApp(app.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
