import { cn } from '~/utils/cn';
import { 
  Sparkles, 
  RefreshCw, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

export type SNPStatus = 
  | 'new' 
  | 'updated' 
  | 'research-updated' 
  | 'evidence-upgraded' 
  | 'recommendation-changed'
  | 'major-update'
  | 'unread';

interface SNPBadgeProps {
  status: SNPStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
}

const statusConfig: Record<SNPStatus, {
  label: string;
  icon: any;
  colors: string;
  tooltip: string;
}> = {
  'new': {
    label: 'NEW',
    icon: Sparkles,
    colors: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    tooltip: 'Recently added to database',
  },
  'updated': {
    label: 'UPDATED',
    icon: RefreshCw,
    colors: 'bg-blue-100 text-blue-700 border-blue-200',
    tooltip: 'Information updated',
  },
  'research-updated': {
    label: 'NEW RESEARCH',
    icon: FileText,
    colors: 'bg-purple-100 text-purple-700 border-purple-200',
    tooltip: 'New research papers available',
  },
  'evidence-upgraded': {
    label: 'STRONGER EVIDENCE',
    icon: TrendingUp,
    colors: 'bg-amber-100 text-amber-700 border-amber-200',
    tooltip: 'Evidence level upgraded',
  },
  'recommendation-changed': {
    label: 'NEW GUIDANCE',
    icon: CheckCircle2,
    colors: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    tooltip: 'Recommendations updated',
  },
  'major-update': {
    label: 'MAJOR UPDATE',
    icon: AlertCircle,
    colors: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
    tooltip: 'Significant changes - review recommended',
  },
  'unread': {
    label: 'UNREAD',
    icon: Clock,
    colors: 'bg-slate-100 text-slate-700 border-slate-200',
    tooltip: 'New information not yet viewed',
  },
};

export function SNPBadge({ 
  status, 
  className, 
  showIcon = true,
  size = 'md',
  count
}: SNPBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-0.5 gap-1',
    lg: 'text-sm px-3 py-1 gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.colors,
        sizeClasses[size],
        className
      )}
      title={config.tooltip}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
      {count !== undefined && count > 1 && (
        <span className="ml-0.5 bg-white/50 rounded-full px-1.5 min-w-[18px] text-center">
          {count}
        </span>
      )}
    </span>
  );
}

interface SNPUpdateIndicatorProps {
  updates: Array<{
    type: SNPStatus;
    count: number;
  }>;
  className?: string;
}

export function SNPUpdateIndicator({ updates, className }: SNPUpdateIndicatorProps) {
  const total = updates.reduce((sum, u) => sum + u.count, 0);
  
  if (total === 0) return null;

  // Show major update badge if any
  const majorUpdate = updates.find(u => u.type === 'major-update');
  if (majorUpdate) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <SNPBadge status="major-update" count={total} size="md" />
      </div>
    );
  }

  // Show top 2 badges
  const topUpdates = updates
    .filter(u => u.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {topUpdates.map((update, i) => (
        <SNPBadge 
          key={update.type} 
          status={update.type} 
          count={update.count}
          size="sm"
        />
      ))}
      {updates.length > 2 && (
        <span className="text-xs text-slate-500">
          +{updates.slice(2).reduce((sum, u) => sum + u.count, 0)} more
        </span>
      )}
    </div>
  );
}

interface ChangelogEntryProps {
  entry: {
    rsid: string;
    gene: string;
    changeType: string;
    description: string;
    date: Date;
    isMajor?: boolean;
  };
  isNew?: boolean;
  onMarkRead?: () => void;
}

export function ChangelogEntry({ entry, isNew, onMarkRead }: ChangelogEntryProps) {
  const statusMap: Record<string, SNPStatus> = {
    'added': 'new',
    'updated': 'updated',
    'research_added': 'research-updated',
    'evidence_upgraded': 'evidence-upgraded',
    'recommendation_updated': 'recommendation-changed',
  };

  const status = entry.isMajor ? 'major-update' : (statusMap[entry.changeType] || 'updated');

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-colors',
      isNew 
        ? 'bg-blue-50 border-blue-200' 
        : 'bg-white border-slate-200'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SNPBadge status={status} size="sm" />
            <span className="font-mono font-medium text-slate-900">
              {entry.rsid}
            </span>
            <span className="text-sm text-slate-500">
              ({entry.gene})
            </span>
          </div>
          <p className="text-slate-700 text-sm mt-1">
            {entry.description}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {entry.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        {isNew && onMarkRead && (
          <button
            onClick={onMarkRead}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}

interface NewResearchAlertProps {
  snp: string;
  paperCount: number;
  onView: () => void;
  onDismiss: () => void;
}

export function NewResearchAlert({ snp, paperCount, onView, onDismiss }: NewResearchAlertProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">
            New Research for {snp}
          </h4>
          <p className="text-sm text-slate-600 mt-1">
            {paperCount} new {paperCount === 1 ? 'paper' : 'papers'} published related to this variant.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onView}
              className="text-sm font-medium text-purple-700 hover:text-purple-900"
            >
              View research →
            </button>
            <button
              onClick={onDismiss}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
