// Relative List Component
// Virtualized list with filtering and sorting for DNA matches

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Users,
  Dna,
  X,
  SortAsc,
  SortDesc,
  Loader2,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { VirtualList } from '~/components/VirtualList';
import { RelativeMatchCard } from '~/components/RelativeMatchCard';
import type {
  RelativeMatch,
  MatchFilterOptions,
  MatchSortOptions,
  MatchSortField,
  RelationshipType,
  ConfidenceLevel,
} from '~/types/relatives';

interface RelativeListProps {
  /** Array of relative matches */
  matches: RelativeMatch[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Callback when a match is selected */
  onSelectMatch?: (match: RelativeMatch) => void;
  /** Callback when compare is clicked */
  onCompare?: (match: RelativeMatch) => void;
  /** Callback when message is clicked */
  onMessage?: (match: RelativeMatch) => void;
  /** Callback when visibility is toggled */
  onToggleVisibility?: (matchId: string, hidden: boolean) => void;
  /** Currently selected match ID */
  selectedMatchId?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Whether to enable virtual scrolling (for large lists) */
  virtualize?: boolean;
  /** Total count for pagination */
  totalCount?: number;
  /** Callback when more items should be loaded */
  onLoadMore?: () => void;
  /** Whether more items are loading */
  isLoadingMore?: boolean;
}

// Filter options
const relationshipTypes: { value: RelationshipType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Relationships' },
  { value: 'parent_child', label: 'Parent/Child' },
  { value: 'full_sibling', label: 'Full Sibling' },
  { value: 'half_sibling', label: 'Half Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'aunt_uncle', label: 'Aunt/Uncle' },
  { value: 'first_cousin', label: '1st Cousin' },
  { value: 'second_cousin', label: '2nd Cousin' },
  { value: 'third_cousin', label: '3rd Cousin' },
  { value: 'distant_cousin', label: 'Distant Cousin' },
];

const dnaRanges = [
  { value: 'all', label: 'All Amounts', min: 0, max: Infinity },
  { value: 'close', label: 'Close Family (>200 cM)', min: 200, max: Infinity },
  { value: 'medium', label: 'Medium (50-200 cM)', min: 50, max: 200 },
  { value: 'distant', label: 'Distant (<50 cM)', min: 0, max: 50 },
];

const sortOptions: { value: MatchSortField; label: string }[] = [
  { value: 'sharedCM', label: 'Shared DNA' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'name', label: 'Name' },
  { value: 'matchedAt', label: 'Match Date' },
  { value: 'largestSegment', label: 'Largest Segment' },
];

const confidenceLevels: { value: ConfidenceLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Confidence' },
  { value: 'very_high', label: 'Very High' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * Relative List Component
 *
 * Features:
 * - Virtualized scrolling for performance with large lists
 * - Advanced filtering by relationship type, DNA amount, confidence
 * - Sorting by multiple fields
 * - Search by name
 * - Empty states
 * - Loading skeletons
 */
export function RelativeList({
  matches,
  isLoading,
  onSelectMatch,
  onCompare,
  onMessage,
  onToggleVisibility,
  selectedMatchId,
  className,
  virtualize = true,
  totalCount,
  onLoadMore,
  isLoadingMore,
}: RelativeListProps) {
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MatchFilterOptions>({
    relationshipType: 'all',
    minSharedCM: 0,
    maxSharedCM: Infinity,
    minConfidence: 'all' as ConfidenceLevel,
    optInOnly: false,
    includeHidden: false,
  });
  const [sort, setSort] = useState<MatchSortOptions>({
    field: 'sharedCM',
    direction: 'desc',
  });

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.relativeName.toLowerCase().includes(query) ||
          m.predictedRelationship.displayName.toLowerCase().includes(query)
      );
    }

    // Relationship type filter
    if (filters.relationshipType && filters.relationshipType !== 'all') {
      result = result.filter(
        (m) => m.predictedRelationship.type === filters.relationshipType
      );
    }

    // DNA range filter
    if (filters.minSharedCM !== undefined) {
      result = result.filter((m) => m.sharedDNA.centimorgans >= filters.minSharedCM!);
    }
    if (filters.maxSharedCM !== undefined && filters.maxSharedCM !== Infinity) {
      result = result.filter((m) => m.sharedDNA.centimorgans <= filters.maxSharedCM!);
    }

    // Confidence filter
    if (filters.minConfidence && filters.minConfidence !== 'all') {
      const confidenceOrder = ['very_low', 'low', 'medium', 'high', 'very_high'];
      const minIndex = confidenceOrder.indexOf(filters.minConfidence);
      result = result.filter(
        (m) => confidenceOrder.indexOf(m.predictedRelationship.confidence) >= minIndex
      );
    }

    // Opt-in filter
    if (filters.optInOnly) {
      result = result.filter((m) => m.optInStatus);
    }

    // Hidden filter
    if (!filters.includeHidden) {
      result = result.filter((m) => !m.isHidden);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'sharedCM':
          comparison = a.sharedDNA.centimorgans - b.sharedDNA.centimorgans;
          break;
        case 'relationship':
          comparison = a.predictedRelationship.displayName.localeCompare(
            b.predictedRelationship.displayName
          );
          break;
        case 'name':
          comparison = a.relativeName.localeCompare(b.relativeName);
          break;
        case 'matchedAt':
          comparison = new Date(a.matchedAt).getTime() - new Date(b.matchedAt).getTime();
          break;
        case 'largestSegment':
          comparison = a.sharedDNA.largestSegment - b.sharedDNA.largestSegment;
          break;
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [matches, searchQuery, filters, sort]);

  // Stats
  const stats = useMemo(() => {
    const total = matches.length;
    const close = matches.filter((m) => m.sharedDNA.centimorgans >= 200).length;
    const distant = matches.filter((m) => m.sharedDNA.centimorgans < 50).length;
    const hidden = matches.filter((m) => m.isHidden).length;
    return { total, close, distant, hidden };
  }, [matches]);

  // Handlers
  const handleSortChange = (field: MatchSortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      relationshipType: 'all',
      minSharedCM: 0,
      maxSharedCM: Infinity,
      minConfidence: 'all' as ConfidenceLevel,
      optInOnly: false,
      includeHidden: false,
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.relationshipType && filters.relationshipType !== 'all') count++;
    if (filters.minSharedCM && filters.minSharedCM > 0) count++;
    if (filters.minConfidence && filters.minConfidence !== 'all') count++;
    if (filters.optInOnly) count++;
    if (filters.includeHidden) count++;
    return count;
  }, [filters]);

  // Render item for virtual list
  const renderItem = useCallback(
    (match: RelativeMatch, index: number) => (
      <div className="px-4 py-2">
        <RelativeMatchCard
          match={match}
          isSelected={match.relativeId === selectedMatchId}
          onClick={onSelectMatch}
          onCompare={onCompare}
          onMessage={onMessage}
          onToggleVisibility={onToggleVisibility}
          compact={false}
        />
      </div>
    ),
    [selectedMatchId, onSelectMatch, onCompare, onMessage, onToggleVisibility]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
        {/* Search and Main Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search matches by name or relationship..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'gap-2',
              showFilters && 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="primary" size="sm" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
                {/* Relationship Type */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Relationship Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {relationshipTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          setFilters((f) => ({ ...f, relationshipType: type.value }))
                        }
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm transition-colors',
                          filters.relationshipType === type.value
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DNA Range */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Shared DNA Amount
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dnaRanges.map((range) => (
                      <button
                        key={range.value}
                        onClick={() =>
                          setFilters((f) => ({
                            ...f,
                            minSharedCM: range.min,
                            maxSharedCM: range.max,
                          }))
                        }
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm transition-colors',
                          filters.minSharedCM === range.min &&
                            filters.maxSharedCM === range.max
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidence Level */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Minimum Confidence
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {confidenceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() =>
                          setFilters((f) => ({
                            ...f,
                            minConfidence: level.value as ConfidenceLevel,
                          }))
                        }
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm transition-colors',
                          filters.minConfidence === level.value
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.optInOnly}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, optInOnly: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Opt-in only
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.includeHidden}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, includeHidden: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Include hidden matches
                    </span>
                  </label>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats and Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {filteredMatches.length} of {stats.total} matches
            </span>
            {stats.close > 0 && (
              <Badge variant="success" size="sm">
                {stats.close} close
              </Badge>
            )}
            {stats.hidden > 0 && (
              <Badge variant="default" size="sm">
                {stats.hidden} hidden
              </Badge>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
            <select
              value={sort.field}
              onChange={(e) => handleSortChange(e.target.value as MatchSortField)}
              className="text-sm border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setSort((s) => ({
                  ...s,
                  direction: s.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {sort.direction === 'asc' ? (
                <SortAsc className="w-4 h-4 text-slate-500" />
              ) : (
                <SortDesc className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="flex-1 overflow-hidden">
        {filteredMatches.length === 0 ? (
          <EmptyState
            hasFilters={activeFiltersCount > 0 || searchQuery.length > 0}
            onClearFilters={clearFilters}
          />
        ) : virtualize && filteredMatches.length > 20 ? (
          <VirtualList
            items={filteredMatches}
            renderItem={renderItem}
            itemHeight={160}
            className="h-full"
            onEndReached={onLoadMore}
            isLoadingMore={isLoadingMore}
            hasMore={(totalCount ?? filteredMatches.length) > filteredMatches.length}
          />
        ) : (
          <div className="overflow-auto h-full">
            <div className="space-y-3 p-4">
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.relativeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                >
                  {renderItem(match, index)}
                </motion.div>
              ))}
            </div>
            {isLoadingMore && (
              <div className="py-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        {hasFilters ? (
          <Filter className="w-10 h-10 text-slate-400" />
        ) : (
          <Users className="w-10 h-10 text-slate-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        {hasFilters ? 'No matches found' : 'No matches yet'}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {hasFilters
          ? 'Try adjusting your filters to see more matches.'
          : "You don't have any DNA matches yet. Make sure you've opted in to DNA matching to discover your relatives."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}

/**
 * Skeleton loading component
 */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg',
        className
      )}
    />
  );
}

export default RelativeList;
