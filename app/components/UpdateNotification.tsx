import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  Bell, 
  X, 
  Check, 
  Sparkles, 
  BookOpen, 
  AlertTriangle,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { useNotifications, type Notification } from '~/hooks/useNotifications';
import { cn } from '~/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface UpdateNotificationCenterProps {
  className?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  research_update: { 
    icon: BookOpen, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100' 
  },
  sharing_invite: { 
    icon: Sparkles, 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100' 
  },
  genome_complete: { 
    icon: Check, 
    color: 'text-green-700', 
    bgColor: 'bg-green-100' 
  },
  security: { 
    icon: AlertTriangle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100' 
  },
  system: { 
    icon: Bell, 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-100' 
  },
};

export function UpdateNotificationCenter({ className }: UpdateNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    markAsRead([id]);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification([id]);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          isOpen 
            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-slate-500 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No notifications</p>
                <p className="text-sm text-slate-400 mt-1">
                  We'll notify you about updates and activity
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (e: React.MouseEvent, id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group",
        !notification.isRead && "bg-indigo-50/50 dark:bg-indigo-900/10"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-sm font-medium",
              !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
            )}>
              {notification.title}
            </p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <button
                  onClick={(e) => onMarkAsRead(e, notification.id)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  title="Mark as read"
                  aria-label="Mark as read"
                >
                  <Check className="w-3 h-3 text-slate-500" />
                </button>
              )}
              <button
                onClick={(e) => onDelete(e, notification.id)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                title="Delete"
                aria-label="Delete notification"
              >
                <Trash2 className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Legacy component for backwards compatibility with mock data
interface LegacyUpdateNotificationProps {
  notifications: Array<{
    id: string;
    type: 'new' | 'research-updated' | 'evidence-upgraded' | 'recommendation-changed' | 'major-update';
    title: string;
    description: string;
    relatedSnp?: string;
    actionLink?: string;
    actionText?: string;
    timestamp: Date;
  }>;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export function NewFeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
      <Sparkles className="w-3 h-3 mr-1" />
      {children}
    </span>
  );
}
