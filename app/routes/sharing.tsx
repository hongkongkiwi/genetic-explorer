import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Alert } from '~/components/ui/Alert';
import { Users, Plus, Trash2, UserCheck, Mail, Clock, Shield, Eye, Download } from 'lucide-react';
import { cn } from '~/utils/cn';

export const Route = createFileRoute('/sharing')({
  component: SharingPage,
});

interface SharingPermission {
  id: string;
  ownerId: string;
  sharedWithId: string;
  genomeId: string | null;
  permissionLevel: 'view' | 'download' | 'manage';
  expiresAt: string | null;
  createdAt: string;
  status: 'active' | 'revoked' | 'expired';
  message: string | null;
  ownerEmail?: string;
  ownerName?: string;
  sharedWithEmail?: string;
  sharedWithName?: string;
  genomeNickname?: string;
}

function SharingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'shared-with-me' | 'my-shares'>('shared-with-me');
  const [sharedWithMe, setSharedWithMe] = useState<SharingPermission[]>([]);
  const [myShares, setMyShares] = useState<SharingPermission[]>([]);
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<'view' | 'download' | 'manage'>('view');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadShares();
    }
  }, [isAuthenticated, activeTab]);

  const loadShares = async () => {
    setIsLoadingShares(true);
    try {
      const response = await fetch(`/api/sharing?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'shared-with-me') {
          setSharedWithMe(data.data || []);
        } else {
          setMyShares(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load shares:', error);
    }
    setIsLoadingShares(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          permissionLevel: invitePermission,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
        setInviteEmail('');
        setShowInviteForm(false);
        loadShares();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send invitation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsSending(false);
  };

  const handleRevoke = async (permissionId: string) => {
    if (!confirm('Are you sure you want to revoke this sharing permission?')) return;

    try {
      const response = await fetch(`/api/sharing?id=${permissionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadShares();
      }
    } catch (error) {
      console.error('Failed to revoke permission:', error);
    }
  };

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'manage': return <Shield className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (level: string) => {
    switch (level) {
      case 'view': return 'View Only';
      case 'download': return 'View & Download';
      case 'manage': return 'Full Access';
      default: return 'View Only';
    }
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Family Sharing
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Share your genetic profiles with family members and healthcare providers
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Someone
        </Button>
      </div>

      {message && (
        <Alert variant={message.type} className="mb-6">
          {message.text}
        </Alert>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Send Invitation</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="family@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Permission Level
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(['view', 'download', 'manage'] as const).map((level) => (
                  <label
                    key={level}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      invitePermission === level
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="permission"
                      value={level}
                      checked={invitePermission === level}
                      onChange={(e) => setInvitePermission(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="text-blue-600">{getPermissionIcon(level)}</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{getPermissionLabel(level)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSending}>
                Send Invitation
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('shared-with-me')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all',
            activeTab === 'shared-with-me'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <UserCheck className="w-4 h-4" />
          Shared With Me
          {sharedWithMe.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {sharedWithMe.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('my-shares')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all',
            activeTab === 'my-shares'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <Users className="w-4 h-4" />
          My Shares
          {myShares.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {myShares.length}
            </span>
          )}
        </button>
      </div>

      {/* Shares List */}
      {isLoadingShares ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'shared-with-me' ? (
            sharedWithMe.length === 0 ? (
              <Card className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Shared Profiles
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  When someone shares their genetic profile with you, it will appear here.
                </p>
              </Card>
            ) : (
              sharedWithMe.map((share) => (
                <Card key={share.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {share.ownerName?.[0] || share.ownerEmail?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {share.ownerName || share.ownerEmail}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Shared {share.genomeNickname ? `"${share.genomeNickname}"` : 'all profiles'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                            {getPermissionIcon(share.permissionLevel)}
                            {getPermissionLabel(share.permissionLevel)}
                          </span>
                          {share.expiresAt && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(share.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )
          ) : (
            myShares.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Active Shares
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  You haven't shared your genetic profiles with anyone yet.
                </p>
                <Button onClick={() => setShowInviteForm(true)}>
                  Share Your First Profile
                </Button>
              </Card>
            ) : (
              myShares.map((share) => (
                <Card key={share.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                        {share.sharedWithName?.[0] || share.sharedWithEmail?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {share.sharedWithName || share.sharedWithEmail}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Can access {share.genomeNickname ? `"${share.genomeNickname}"` : 'all your profiles'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                            {getPermissionIcon(share.permissionLevel)}
                            {getPermissionLabel(share.permissionLevel)}
                          </span>
                          {share.expiresAt && (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(share.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRevoke(share.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
