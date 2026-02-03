// Relative Detail Modal Component
// Detailed view for a specific DNA match

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  MessageCircle,
  EyeOff,
  GitCompare,
  User,
  Dna,
  MapPin,
  Clock,
  Users,
  Shield,
  ShieldCheck,
  ChevronRight,
  Copy,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { Modal } from '~/components/ui/Modal';
import { GenomeComparisonView } from '~/components/GenomeComparisonView';
import type { RelativeMatch, GenomeComparison } from '~/types/relatives';

interface RelativeDetailModalProps {
  /** The match to display */
  match: RelativeMatch | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when message button is clicked */
  onMessage?: (match: RelativeMatch) => void;
  /** Callback when hide button is clicked */
  onHide?: (matchId: string) => void;
  /** Callback when compare button is clicked */
  onCompare?: (match: RelativeMatch) => void;
  /** Genome comparison data (if available) */
  comparison?: GenomeComparison | null;
  /** Whether comparison is loading */
  isComparisonLoading?: boolean;
}

/**
 * Relative Detail Modal
 *
 * Shows comprehensive details about a DNA match including:
 * - Full match statistics
 * - Genome comparison visualization
 * - Shared segments list
 * - Possible relationships
 * - Contact options
 * - Privacy controls
 */
export function RelativeDetailModal({
  match,
  isOpen,
  onClose,
  onMessage,
  onHide,
  onCompare,
  comparison,
  isComparisonLoading,
}: RelativeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'segments'>('overview');
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = useCallback(() => {
    if (match) {
      navigator.clipboard.writeText(match.relativeId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  }, [match]);

  const handleHide = useCallback(() => {
    if (match && onHide) {
      if (confirm('Are you sure you want to hide this match? You can unhide it later.')) {
        onHide(match.relativeId);
      }
    }
  }, [match, onHide]);

  const handleMessage = useCallback(() => {
    if (match && onMessage) {
      onMessage(match);
    }
  }, [match, onMessage]);

  const handleCompare = useCallback(() => {
    if (match && onCompare) {
      onCompare(match);
      setActiveTab('comparison');
    }
  }, [match, onCompare]);

  if (!match) return null;

  const confidenceColors: Record<string, string> = {
    very_high: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    high: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    low: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    very_low: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  const confidenceLabels: Record<string, string> = {
    very_high: 'Very High Confidence',
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
    very_low: 'Very Low Confidence',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={false}
    >
      <div className="flex flex-col h-[80vh]">
        {/* Custom Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0',
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
                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>

            {/* Main Info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {match.relativeName}
                </h2>
                {match.optInStatus ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" title="Opted in" />
                ) : (
                  <Shield className="w-5 h-5 text-slate-400" title="Not opted in" />
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                  {match.predictedRelationship.displayName}
                </span>
                <Badge
                  variant={
                    match.predictedRelationship.confidence === 'very_high' ? 'success' :
                    match.predictedRelationship.confidence === 'high' ? 'primary' :
                    match.predictedRelationship.confidence === 'medium' ? 'warning' :
                    'error'
                  }
                  size="sm"
                >
                  {confidenceLabels[match.predictedRelationship.confidence]}
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Matched {formatDate(match.matchedAt)}
                </span>
                {match.side && match.side !== 'unknown' && (
                  <span className={cn(
                    'flex items-center gap-1',
                    match.side === 'maternal' ? 'text-pink-500' : 'text-blue-500'
                  )}>
                    <MapPin className="w-4 h-4" />
                    {match.side === 'maternal' ? 'Maternal' : 'Paternal'} side
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHide}
              className="text-slate-500 hover:text-red-600"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {(['overview', 'comparison', 'segments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 text-sm font-medium transition-colors border-b-2',
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              match={match}
              confidenceColor={confidenceColors[match.predictedRelationship.confidence]}
              confidenceLabel={confidenceLabels[match.predictedRelationship.confidence]}
              onCopyId={handleCopyId}
              copiedId={copiedId}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonTab
              match={match}
              comparison={comparison}
              isLoading={isComparisonLoading}
            />
          )}

          {activeTab === 'segments' && (
            <SegmentsTab match={match} />
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Overview Tab Content
 */
function OverviewTab({
  match,
  confidenceColor,
  confidenceLabel,
  onCopyId,
  copiedId,
}: {
  match: RelativeMatch;
  confidenceColor: string;
  confidenceLabel: string;
  onCopyId: () => void;
  copiedId: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* DNA Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Dna}
          label="Shared DNA"
          value={`${match.sharedDNA.percentage.toFixed(2)}%`}
          subtext={`${match.sharedDNA.centimorgans} cM`}
          color="indigo"
        />
        <StatCard
          icon={GitCompare}
          label="Segments"
          value={match.sharedDNA.segments.toString()}
          subtext="IBD segments"
          color="emerald"
        />
        <StatCard
          icon={Target}
          label="Largest"
          value={`${match.sharedDNA.largestSegment} cM`}
          subtext="Longest segment"
          color="amber"
        />
        <StatCard
          icon={BarChart}
          label="Average"
          value={`${match.sharedDNA.averageSegment} cM`}
          subtext="Per segment"
          color="blue"
        />
      </div>

      {/* Relationship Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Relationship Prediction
        </h3>
        <div className={cn('p-3 rounded-lg mb-4', confidenceColor)}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{confidenceLabel}</span>
          </div>
        </div>

        {match.predictedRelationship.possibleRelationships.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Also possible:
            </p>
            <div className="flex flex-wrap gap-2">
              {match.predictedRelationship.possibleRelationships.map((rel, i) => (
                <Badge key={i} variant="default" size="sm">
                  {rel}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            Expected range: {match.predictedRelationship.expectedRange.min}-
            {match.predictedRelationship.expectedRange.max} cM
          </p>
          <p>
            Average for this relationship: {match.predictedRelationship.expectedRange.average} cM
          </p>
        </div>
      </div>

      {/* Common Ancestors */}
      {match.commonAncestors && match.commonAncestors.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <h3 className="font-medium text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Potential Common Ancestors
          </h3>
          <ul className="space-y-2">
            {match.commonAncestors.map((ancestor, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded"
              >
                <span className="font-medium text-amber-900 dark:text-amber-200">
                  {ancestor.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    {ancestor.relationship}
                  </span>
                  <Badge
                    variant={
                      ancestor.confidence === 'high' ? 'success' :
                      ancestor.confidence === 'medium' ? 'warning' :
                      'default'
                    }
                    size="sm"
                  >
                    {ancestor.confidence}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ancestry Regions */}
      {match.ancestryRegions && match.ancestryRegions.length > 0 && (
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white mb-3">
            Shared Ancestry Regions
          </h3>
          <div className="flex flex-wrap gap-2">
            {match.ancestryRegions.map((region, i) => (
              <Badge key={i} variant="primary" size="md">
                {region}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Match ID */}
      <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Match ID</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {match.relativeId}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCopyId} className="gap-1.5">
          {copiedId ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      {!match.optInStatus && (
        <div className="flex items-start gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Limited Information Available
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              This match has not opted in to DNA matching. Basic match information is
              available, but you cannot send messages or see detailed ancestry information
              until they opt in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Comparison Tab Content
 */
function ComparisonTab({
  match,
  comparison,
  isLoading,
}: {
  match: RelativeMatch;
  comparison?: GenomeComparison | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="text-center py-12">
        <GitCompare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No Comparison Available
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Click "Compare" to generate a detailed genome comparison visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <GenomeComparisonView
        comparison={comparison}
        defaultFullscreen={false}
        className="h-full border-0 shadow-none"
      />
    </div>
  );
}

/**
 * Segments Tab Content
 */
function SegmentsTab({ match }: { match: RelativeMatch }) {
  const sortedSegments = [...match.ibdSegments].sort(
    (a, b) => b.centimorgans - a.centimorgans
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900 dark:text-white">
          Shared IBD Segments
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {sortedSegments.length} total
        </span>
      </div>

      {sortedSegments.length === 0 ? (
        <div className="text-center py-12">
          <Dna className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No Segments Available
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Detailed segment information is not available for this match.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSegments.map((segment, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {segment.chromosome}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Chromosome {segment.chromosome}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                    {formatPosition(segment.start)} - {formatPosition(segment.end)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600 dark:text-indigo-400">
                  {segment.centimorgans} cM
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {segment.snpCount.toLocaleString()} SNPs
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chromosome Legend */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          About IBD Segments
        </h4>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
          <li>IBD = Identity by Descent (inherited from a common ancestor)</li>
          <li>Larger segments (&gt;7 cM) indicate closer relationships</li>
          <li>Many small segments may indicate distant ancestry</li>
          <li>Segments on X chromosome have special inheritance patterns</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  color: 'indigo' | 'emerald' | 'amber' | 'blue';
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  };

  return (
    <div className={cn('rounded-lg p-4', colors[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{subtext}</div>
    </div>
  );
}

// Helper icon components
function Target({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function BarChart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
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
 * Format genomic position
 */
function formatPosition(position: number): string {
  if (position >= 1000000) {
    return `${(position / 1000000).toFixed(2)}M`;
  }
  if (position >= 1000) {
    return `${(position / 1000).toFixed(1)}K`;
  }
  return position.toString();
}

export default RelativeDetailModal;
