/**
 * AncestrySummary Component
 * 
 * Summary component showing overall ancestry composition,
 * most prominent population, confidence score, and quick stats.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Dna, 
  Globe, 
  TrendingUp, 
  Award,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { cn } from '~/lib/utils';
import type { PopulationEstimate, AncestryResult } from '~/types/ancestry';

interface AncestrySummaryProps {
  ancestry: AncestryResult;
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showConfidence?: boolean;
}

// Color palette matching other components
const POPULATION_COLORS: Record<string, string> = {
  'European': '#3b82f6',
  'African': '#8b5cf6',
  'East Asian': '#ef4444',
  'South Asian': '#f97316',
  'Native American': '#22c55e',
  'Middle Eastern': '#eab308',
  'Oceanian': '#06b6d4',
  'Central Asian': '#ec4899',
  'Southeast Asian': '#14b8a6',
};

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}

function StatItem({ icon: Icon, label, value, color, delay = 0 }: StatItemProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'rounded-xl border-2 p-4 flex items-center gap-3',
        colorClasses[color] || colorClasses.blue
      )}
    >
      <Icon className="w-6 h-6" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs opacity-80">{label}</p>
      </div>
    </motion.div>
  );
}

/**
 * Confidence Score Badge
 */
function ConfidenceBadge({ score }: { score: number }) {
  let color = 'text-red-600 bg-red-50 border-red-200';
  let label = 'Low Confidence';
  
  if (score >= 0.9) {
    color = 'text-green-600 bg-green-50 border-green-200';
    label = 'Very High Confidence';
  } else if (score >= 0.7) {
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    label = 'High Confidence';
  } else if (score >= 0.5) {
    color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
    label = 'Medium Confidence';
  }

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium', color)}>
      {score >= 0.7 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {label} ({(score * 100).toFixed(0)}%)
    </div>
  );
}

/**
 * Top Population Card
 */
function TopPopulationCard({ 
  population, 
  isPrimary = false 
}: { 
  population: PopulationEstimate; 
  isPrimary?: boolean;
}) {
  const color = POPULATION_COLORS[population.population] || '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: isPrimary ? 0 : 0.1 }}
      className={cn(
        'rounded-xl border-2 p-4 relative overflow-hidden',
        isPrimary 
          ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      )}
    >
      {isPrimary && (
        <div className="absolute top-2 right-2">
          <Award className="w-5 h-5 text-amber-500" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Globe className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-bold truncate',
            isPrimary ? 'text-lg text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'
          )}>
            {population.population}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold" style={{ color }}>
              {population.percentage.toFixed(1)}%
            </span>
            {population.subPopulations && population.subPopulations.length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {population.subPopulations.length} sub-regions
              </span>
            )}
          </div>
          {population.region && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {population.region}
            </p>
          )}
        </div>
      </div>

      {isPrimary && population.subPopulations && population.subPopulations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">Top Sub-regions:</p>
          <div className="flex flex-wrap gap-1.5">
            {population.subPopulations.slice(0, 3).map((sub, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-0.5 bg-white dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300"
              >
                {sub.name} ({sub.percentage.toFixed(0)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Full variant of AncestrySummary
 */
function FullSummary({ ancestry }: { ancestry: AncestryResult }) {
  const { ethnicity, confidence, snpsAnalyzed, yHaplogroup, mtHaplogroup } = ancestry;
  
  // Sort populations by percentage
  const sortedPopulations = useMemo(() => {
    return [...ethnicity].sort((a, b) => b.percentage - a.percentage);
  }, [ethnicity]);

  const primaryPopulation = sortedPopulations[0];
  const secondaryPopulation = sortedPopulations[1];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Ancestry Composition</h2>
            <p className="text-indigo-100 leading-relaxed">
              Based on analysis of {snpsAnalyzed.toLocaleString()} ancestry-informative markers, 
              your genetic heritage is primarily {primaryPopulation?.population} 
              ({primaryPopulation?.percentage.toFixed(1)}%), with contributions from {sortedPopulations.length - 1} other populations.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem
          icon={Globe}
          label="Populations"
          value={sortedPopulations.length}
          color="blue"
          delay={0.1}
        />
        <StatItem
          icon={Dna}
          label="SNPs Analyzed"
          value={snpsAnalyzed.toLocaleString()}
          color="purple"
          delay={0.2}
        />
        <StatItem
          icon={TrendingUp}
          label="Confidence"
          value={`${(confidence * 100).toFixed(0)}%`}
          color="green"
          delay={0.3}
        />
        <StatItem
          icon={Users}
          label="Haplogroups"
          value={(yHaplogroup ? 1 : 0) + (mtHaplogroup ? 1 : 0)}
          color="amber"
          delay={0.4}
        />
      </div>

      {/* Top Populations */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Top Ancestry Regions
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {primaryPopulation && (
            <TopPopulationCard population={primaryPopulation} isPrimary />
          )}
          {secondaryPopulation && (
            <TopPopulationCard population={secondaryPopulation} />
          )}
        </div>
      </div>

      {/* Confidence Section */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">Analysis Confidence</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Based on reference population matches
          </p>
        </div>
        <ConfidenceBadge score={confidence} />
      </div>
    </div>
  );
}

/**
 * Compact variant for sidebars or smaller spaces
 */
function CompactSummary({ ancestry }: { ancestry: AncestryResult }) {
  const { ethnicity, confidence, snpsAnalyzed } = ancestry;
  
  const sortedPopulations = useMemo(() => {
    return [...ethnicity].sort((a, b) => b.percentage - a.percentage);
  }, [ethnicity]);

  const primary = sortedPopulations[0];
  const color = POPULATION_COLORS[primary?.population] || '#6b7280';

  return (
    <div className="space-y-4">
      {/* Primary Ancestry */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}30` }}
        >
          <Globe className="w-7 h-7" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Primary Ancestry</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{primary?.population}</h4>
          <p className="text-2xl font-bold" style={{ color }}>{primary?.percentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Globe className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">{sortedPopulations.length}</p>
          <p className="text-xs text-slate-500">Regions</p>
        </div>
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Dna className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {(snpsAnalyzed / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-slate-500">SNPs</p>
        </div>
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">{(confidence * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-500">Confidence</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal variant for inline displays
 */
function MinimalSummary({ ancestry }: { ancestry: AncestryResult }) {
  const primary = useMemo(() => {
    return [...ancestry.ethnicity].sort((a, b) => b.percentage - a.percentage)[0];
  }, [ancestry.ethnicity]);

  const color = POPULATION_COLORS[primary?.population] || '#6b7280';

  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Globe className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white text-sm">{primary?.population}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {primary?.percentage.toFixed(1)}% • {(ancestry.confidence * 100).toFixed(0)}% confidence
        </p>
      </div>
    </div>
  );
}

/**
 * Main AncestrySummary Component
 */
export function AncestrySummary({
  ancestry,
  className,
  variant = 'full',
  showConfidence = true,
}: AncestrySummaryProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
      variant === 'full' ? 'p-6' : variant === 'compact' ? 'p-4' : 'p-3',
      className
    )}>
      {variant === 'full' && <FullSummary ancestry={ancestry} />}
      {variant === 'compact' && <CompactSummary ancestry={ancestry} />}
      {variant === 'minimal' && <MinimalSummary ancestry={ancestry} />}
    </div>
  );
}

/**
 * Skeleton loader for loading states
 */
export function AncestrySummarySkeleton({ 
  variant = 'full' 
}: { 
  variant?: 'full' | 'compact' | 'minimal' 
}) {
  const padding = variant === 'full' ? 'p-6' : variant === 'compact' ? 'p-4' : 'p-3';
  
  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse',
      padding
    )}>
      {variant === 'full' && (
        <div className="space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      )}
      {variant === 'compact' && (
        <div className="space-y-4">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      )}
      {variant === 'minimal' && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
          </div>
        </div>
      )}
    </div>
  );
}

export default AncestrySummary;
