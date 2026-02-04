import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '~/hooks/useAuth';
import { Card } from '~/components/ui/Card';
import { Alert } from '~/components/ui/Alert';
import { Clock, Upload, FileText, User, Users, Shield, LogIn, LogOut, Trash2, AlertCircle, ChevronLeft } from 'lucide-react';
import { cn } from '~/utils/shared/cn';

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
});

interface ActivityItem {
  id: number;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, any> | null;
  createdAt: string;
}

const actionConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  'user_registered': { icon: User, label: 'Account created', color: 'text-green-800 bg-green-100' },
  'user_login': { icon: LogIn, label: 'Signed in', color: 'text-blue-800 bg-blue-100' },
  'user_logout': { icon: LogOut, label: 'Signed out', color: 'text-slate-600 bg-slate-100' },
  'genome_uploaded': { icon: Upload, label: 'Genome uploaded', color: 'text-purple-800 bg-purple-100' },
  'genome_deleted': { icon: Trash2, label: 'Genome deleted', color: 'text-red-600 bg-red-100' },
  'genome_set_primary': { icon: Shield, label: 'Primary genome updated', color: 'text-amber-800 bg-amber-100' },
  'report_generated': { icon: FileText, label: 'Report generated', color: 'text-cyan-600 bg-cyan-100' },
  'sharing_created': { icon: Users, label: 'Sharing permission created', color: 'text-indigo-800 bg-indigo-100' },
  'sharing_revoked': { icon: Shield, label: 'Sharing permission revoked', color: 'text-orange-600 bg-orange-100' },
  'profile_updated': { icon: User, label: 'Profile updated', color: 'text-teal-600 bg-teal-100' },
};

function ActivityPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadActivities();
    }
  }, [isAuthenticated]);

  const loadActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch('/api/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setError('Failed to load activity log');
      }
    } catch {
      setError('Failed to load activity log');
    }
    setIsLoadingActivities(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getActionConfig = (action: string) => {
    return actionConfig[action] || { 
      icon: AlertCircle, 
      label: action.replace(/_/g, ' '), 
      color: 'text-slate-600 bg-slate-100' 
    };
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
        <Link 
          to="/settings" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          Activity Log
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track your account activity and changes
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <Card className="overflow-hidden">
        {isLoadingActivities ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No Activity Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your account activity will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.map((activity) => {
              const config = getActionConfig(activity.action);
              const Icon = config.icon;
              
              return (
                <div 
                  key={activity.id} 
                  className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", config.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {config.label}
                    </p>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {activity.action === 'genome_uploaded' && (
                          <span>Filename: {activity.details.filename}</span>
                        )}
                        {activity.action === 'report_generated' && (
                          <span>Genome ID: {activity.details.genomeId?.slice(0, 8)}...</span>
                        )}
                        {activity.action === 'user_login' && activity.details.email && (
                          <span>Email: {activity.details.email}</span>
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center">
        Activity logs are retained for 90 days for security purposes.
      </p>
    </div>
  );
}
