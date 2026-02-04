// Relative Match Card Component
// Displays a single DNA relative match with key information

import { memo, useState, useCallback } from 'react';
import { 
  User, 
  Dna, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  GitCompare,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Clock,
  Users,
  MapPin,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  Mail,
  Ban
} from 'lucide-react';
import { cn } from '~/utils/shared/cn';
import type { RelativeMatch, ConfidenceLevel, RelationshipType } from '~/types/relatives';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface RelativeMatchCardProps {
  /** The relative match data */
  match: RelativeMatch;
  /** Callback when compare button is clicked */
  onCompare?: (match: RelativeMatch) => void;
  /** Callback when message button is clicked */
  onMessage?: (match: RelativeMatch) => void;
  /** Callback when hide/unhide is toggled */
  onToggleVisibility?: (matchId: string, hidden: boolean) => void;
  /** Callback when the card is clicked */
  onClick?: (match: RelativeMatch) => void;
  /** Whether this match is currently selected */
  isSelected?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode for list views */
  compact?: boolean;
}

/**
 * Relative Match Card
 * 
 * Displays a DNA relative match with:
 * - Match name/identifier
 * - Predicted relationship
 * - Shared DNA percentage and cM
 * - Number of shared segments
 * - Largest segment
 * - Confidence level
 * - Compare button
 * - Message button (placeholder)
 * - Opt-in/opt-out indicator
 */
export const RelativeMatchCard = memo(function RelativeMatchCard({
  match,
  onCompare,
  onMessage,
  onToggleVisibility,
  onClick,
  isSelected = false,
  className,
  compact = false,
}: RelativeMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCompare?.(match);
  }, [match, onCompare]);

  const handleMessage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.(match);
  }, [match, onMessage]);

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility?.(match.relativeId, !match.isHidden);
  }, [match.relativeId, match.isHidden, onToggleVisibility]);

  const handleCardClick = useCallback(() => {
    onClick?.(match);
  }, [match, onClick]);

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  // Don't render if hidden and not explicitly showing hidden matches
  if (match.isHidden && !isSelected) {
    return null;
  }

  if (compact) {
    return (
      <CompactMatchCard
        match={match}
        onClick={handleCardClick}
        onCompare={handleCompare}
        isSelected={isSelected}
        className={className}
      />
    );
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'relative rounded-xl border transition-all duration-200 cursor-pointer',
        'bg-white dark:bg-slate-900',
        'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700',
        isSelected && 'ring-2 ring-indigo-500 border-indigo-500',
        match.isHidden && 'opacity-60',
        className
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-indigo-100 to-purple-100',
            'dark:from-indigo-900/30 dark:to-purple-900/30'
          )}>
            {match.avatar ? (
              <img 
                src={match.avatar} 
                alt={match.relativeName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {match.relativeName}
              </h3>
              
              {/* Opt-in Status */}
              {match.optInStatus ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" title="Opted in to matching" />
              ) : (
                <Shield className="w-4 h-4 text-slate-400" title="Not opted in" />
              )}

              {/* Hidden Badge */}
              {match.isHidden && (
                <Badge variant="warning" size="sm">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hidden
                </Badge>
              )}
            </div>

            {/* Relationship */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {match.predictedRelationship.displayName}
              </span>
              <ConfidenceBadge level={match.predictedRelationship.confidence} />
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Matched {formatDate(match.matchedAt)}
              </span>
              {match.side && match.side !== 'unknown' && (
                <span className={cn(
                  'flex items-center gap-1',
                  match.side === 'maternal' ? 'text-pink-500' : 'text-blue-500'
                )}>
                  <MapPin className="w-3 h-3" />
                  {match.side === 'maternal' ? 'Maternal' : 'Paternal'} side
                </span>
              )}
            </div>
          </div>

          {/* DNA Stats */}
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {match.sharedDNA.percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {match.sharedDNA.centimorgans} cM
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={cn(
          'flex items-center gap-2 mt-4 transition-opacity duration-200',
          showActions || isSelected ? 'opacity-100' : 'opacity-0 sm:opacity-0'
        )}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompare}
            className="gap-1.5"
          >
            <GitCompare className="w-4 h-4" />
            Compare
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleMessage}
            disabled={!match.optInStatus}
            className="gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
            title={match.isHidden ? 'Unhide match' : 'Hide match'}
            aria-label={match.isHidden ? 'Unhide match' : 'Hide match'}
          >
            {match.isHidden ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
          <ExpandedDetails match={match} />
        </div>
      )}
    </div>
  );
});

/**
 * Compact version of the match card for list views
 */
function CompactMatchCard({
  match,
  onClick,
  onCompare,
  isSelected,
  className,
}: {
  match: RelativeMatch;
  onClick: () => void;
  onCompare: (e: React.MouseEvent) => void;
  isSelected: boolean;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
        'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800',
        isSelected && 'ring-2 ring-indigo-500 border-indigo-500',
        match.isHidden && 'opacity-60',
        className
      )}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-white truncate">
            {match.relativeName}
          </span>
          <ConfidenceBadge level={match.predictedRelationship.confidence} size="sm" />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {match.predictedRelationship.displayName} • {match.sharedDNA.centimorgans} cM
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCompare}
        className="flex-shrink-0"
        aria-label="Compare genomes"
      >
        <GitCompare className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * Expanded details section
 */
function ExpandedDetails({ match }: { match: RelativeMatch }) {
  return (
    <div className="space-y-4">
      {/* DNA Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox
          label="Shared DNA"
          value={`${match.sharedDNA.percentage.toFixed(2)}%`}
          subtext={`${match.sharedDNA.centimorgans} cM total`}
          icon={Dna}
          color="indigo"
        />
        <StatBox
          label="Segments"
          value={match.sharedDNA.segments.toString()}
          subtext="IBD segments"
          icon={TrendingUp}
          color="emerald"
        />
        <StatBox
          label="Largest"
          value={`${match.sharedDNA.largestSegment} cM`}
          subtext="Longest segment"
          icon={TrendingUp}
          color="amber"
        />
        <StatBox
          label="Average"
          value={`${match.sharedDNA.averageSegment} cM`}
          subtext="Per segment"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Possible Relationships */}
      {match.predictedRelationship.possibleRelationships.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Also possible:
          </h4>
          <div className="flex flex-wrap gap-2">
            {match.predictedRelationship.possibleRelationships.map((rel, i) => (
              <Badge key={i} variant="default" size="sm">
                {rel}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* IBD Segments Preview */}
      {match.ibdSegments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Shared Segments
          </h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {match.ibdSegments.slice(0, 5).map((segment, i) => (
              <div 
                key={i}
                className="flex items-center justify-between text-sm px-3 py-2 bg-white dark:bg-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    Chr {segment.chromosome}
                  </span>
                  <span className="text-slate-500">
                    {formatPosition(segment.start)} - {formatPosition(segment.end)}
                  </span>
                </div>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {segment.centimorgans} cM
                </span>
              </div>
            ))}
            {match.ibdSegments.length > 5 && (
              <div className="text-center text-sm text-slate-500 py-1">
                +{match.ibdSegments.length - 5} more segments
              </div>
            )}
          </div>
        </div>
      )}

      {/* Common Ancestors Hint */}
      {match.commonAncestors && match.commonAncestors.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-300">
              Potential Common Ancestors
            </h4>
            <ul className="mt-1 space-y-1">
              {match.commonAncestors.map((ancestor, i) => (
                <li key={i} className="text-sm text-amber-800 dark:text-amber-200">
                  {ancestor.name} ({ancestor.relationship})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Contact Status */}
      {match.hasContacted && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Mail className="w-4 h-4" />
          <span>You&apos;ve contacted this match</span>
        </div>
      )}

      {/* Privacy Notice */}
      {!match.optInStatus && (
        <div className="flex items-start gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This user has not opted in to relative matching. You cannot send messages 
            or see detailed information until they opt in.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Confidence level badge
 */
function ConfidenceBadge({ 
  level, 
  size = 'md' 
}: { 
  level: ConfidenceLevel;
  size?: 'sm' | 'md';
}) {
  const config: Record<ConfidenceLevel, { label: string; color: string }> = {
    very_high: { label: 'Very High', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    high: { label: 'High', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    low: { label: 'Low', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    very_low: { label: 'Very Low', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  const { label, color } = config[level];

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
      color
    )}>
      {label}
    </span>
  );
}

/**
 * Stat box component
 */
function StatBox({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'indigo' | 'emerald' | 'amber' | 'blue';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  };

  return (
    <div className={cn('rounded-lg p-3', colorClasses[color])}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{subtext}</div>
    </div>
  );
}

/**
 * Format a date for display
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format a genomic position
 */
function formatPosition(position: number): string {
  if (position >= 1000000) {
    return `${(position / 1000000).toFixed(1)}M`;
  }
  if (position >= 1000) {
    return `${(position / 1000).toFixed(1)}K`;
  }
  return position.toString();
}

export default RelativeMatchCard;
