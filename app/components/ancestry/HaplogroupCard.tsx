/**
 * HaplogroupCard Component
 * 
 * Display haplogroup information for Y-DNA (paternal) or mtDNA (maternal) lineages.
 * Includes origin location, migration path, time estimates, and related haplogroups.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, 
  MapPin, 
  Clock, 
  Route, 
  ChevronDown, 
  ChevronUp,
  Users,
  Globe,
  ArrowRight,
  Share2,
  Info
} from 'lucide-react';
import { cn } from '~/lib/utils';
import type { YHaplogroupResult, MtHaplogroupResult } from '~/types/ancestry';

interface HaplogroupCardProps {
  type: 'y-dna' | 'mtdna';
  haplogroup: YHaplogroupResult | MtHaplogroupResult;
  className?: string;
}

// Check if Y-DNA result
function isYHaplogroup(result: YHaplogroupResult | MtHaplogroupResult): result is YHaplogroupResult {
  return 'definingSnps' in result;
}

// Color schemes for each haplogroup type
const TYPE_CONFIG = {
  'y-dna': {
    icon: Dna,
    title: 'Y-DNA Haplogroup',
    subtitle: 'Paternal Lineage',
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-900 dark:text-blue-100',
    accentColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  'mtdna': {
    icon: Dna,
    title: 'mtDNA Haplogroup',
    subtitle: 'Maternal Lineage',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-900 dark:text-pink-100',
    accentColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  },
};

/**
 * Migration Path Visualization
 */
function MigrationPath({ 
  path, 
  type 
}: { 
  path: string; 
  type: 'y-dna' | 'mtdna';
}) {
  const steps = path.split(' → ').filter(Boolean);
  
  if (steps.length === 0) {
    return <p className="text-slate-600 dark:text-slate-400 text-sm">{path}</p>;
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3"
        >
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
            type === 'y-dna' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
          )}>
            {index + 1}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm text-slate-700 dark:text-slate-300">{step.trim()}</p>
            {index < steps.length - 1 && (
              <ArrowRight className={cn(
                'w-4 h-4 mt-2 ml-1',
                type === 'y-dna' 
                  ? 'text-blue-400 dark:text-blue-600'
                  : 'text-pink-400 dark:text-pink-600'
              )} />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Related Haplogroups Tree
 */
function RelatedHaplogroups({
  currentHg,
  type,
}: {
  currentHg: string;
  type: 'y-dna' | 'mtdna';
}) {
  // Simplified tree - in reality this would come from a database
  const generateRelated = (hg: string) => {
    const letter = hg.charAt(0);
    const subclades = [
      `${letter}1`,
      `${letter}2`,
      `${letter}3`,
      `${letter}1a`,
      `${letter}1b`,
    ];
    return subclades.filter(s => s !== hg).slice(0, 4);
  };

  const related = generateRelated(currentHg);
  const colorClass = type === 'y-dna' 
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200'
    : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 border-pink-200';

  return (
    <div className="mt-4">
      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Related Haplogroups
      </h5>
      <div className="flex flex-wrap gap-2">
        {related.map((hg) => (
          <span
            key={hg}
            className={cn(
              'px-2 py-1 rounded text-xs border',
              colorClass
            )}
          >
            {hg}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Notable Members Section (for Y-DNA)
 */
function NotableMembers({
  members,
  type,
}: {
  members?: string[];
  type: 'y-dna' | 'mtdna';
}) {
  if (!members || members.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Notable Members
      </h5>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <span
            key={member}
            className={cn(
              'px-2 py-1 rounded text-xs',
              type === 'y-dna'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
            )}
          >
            {member}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Distribution Map Description (for mtDNA)
 */
function DistributionInfo({
  distribution,
  type,
}: {
  distribution?: string;
  type: 'y-dna' | 'mtdna';
}) {
  if (!distribution) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Regional Distribution
      </h5>
      <p className="text-sm text-slate-600 dark:text-slate-400">{distribution}</p>
    </div>
  );
}

/**
 * Defining Variants List
 */
function DefiningVariants({
  variants,
  type,
}: {
  variants: string[];
  type: 'y-dna' | 'mtdna';
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayVariants = isExpanded ? variants : variants.slice(0, 5);

  return (
    <div className="mt-4">
      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Defining {type === 'y-dna' ? 'SNPs' : 'Variants'} ({variants.length})
      </h5>
      <div className="flex flex-wrap gap-1.5">
        {displayVariants.map((variant) => (
          <code
            key={variant}
            className={cn(
              'px-2 py-0.5 rounded text-xs font-mono',
              type === 'y-dna'
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {variant}
          </code>
        ))}
      </div>
      {variants.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'mt-2 text-xs flex items-center gap-1',
            type === 'y-dna'
              ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
              : 'text-pink-600 dark:text-pink-400 hover:text-pink-700'
          )}
        >
          {isExpanded ? (
            <><ChevronUp className="w-3 h-3" /> Show less</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> Show {variants.length - 5} more</>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Main HaplogroupCard Component
 */
export function HaplogroupCard({
  type,
  haplogroup,
  className,
}: HaplogroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const isYDNA = isYHaplogroup(haplogroup);
  const variants = isYDNA ? haplogroup.definingSnps : haplogroup.definingVariants;

  const handleShare = async () => {
    const shareText = `My ${type === 'y-dna' ? 'Paternal' : 'Maternal'} Haplogroup: ${haplogroup.haplogroup} (${haplogroup.name})\n\nOrigin: ${haplogroup.origin}\nTime Depth: ${haplogroup.timeDepth}\n\nAnalyzed with Genetic Explorer`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${type === 'y-dna' ? 'Y-DNA' : 'mtDNA'} Haplogroup`,
          text: shareText,
        });
      } catch {
        // User cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border-2 overflow-hidden',
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      {/* Header */}
      <div className={cn('p-6 bg-gradient-to-br', config.gradient)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">{config.subtitle}</p>
              <h3 className="text-3xl font-bold text-white mt-0.5">
                {haplogroup.haplogroup}
              </h3>
              <p className="text-white/90 text-sm mt-0.5">{haplogroup.name}</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white relative"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
            {showShare && (
              <span className="absolute -bottom-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
            <MapPin className={cn('w-4 h-4', config.accentColor)} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Origin</p>
            <p className={cn('text-sm font-semibold', config.textColor)}>{haplogroup.origin}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
            <Clock className={cn('w-4 h-4', config.accentColor)} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Time Depth</p>
            <p className={cn('text-sm font-semibold', config.textColor)}>{haplogroup.timeDepth}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
            <Info className={cn('w-4 h-4', config.accentColor)} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Confidence</p>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
              haplogroup.confidence === 'high' ? 'bg-green-100 text-green-700' :
              haplogroup.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-orange-100 text-orange-700'
            )}>
              {haplogroup.confidence}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {haplogroup.description}
        </p>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                {/* Migration Path */}
                <div className="mb-4">
                  <h5 className={cn('text-sm font-medium mb-3 flex items-center gap-2', config.textColor)}>
                    <Route className="w-4 h-4" />
                    Migration Path
                  </h5>
                  <MigrationPath path={haplogroup.migrationPath} type={type} />
                </div>

                {/* Defining Variants */}
                <DefiningVariants variants={variants} type={type} />

                {/* Type-specific sections */}
                {isYDNA && haplogroup.notableMembers && (
                  <NotableMembers members={haplogroup.notableMembers} type={type} />
                )}
                {!isYDNA && haplogroup.distribution && (
                  <DistributionInfo distribution={haplogroup.distribution} type={type} />
                )}

                {/* Related Haplogroups */}
                <RelatedHaplogroups currentHg={haplogroup.haplogroup} type={type} />

                {/* Subclade if available */}
                {haplogroup.subclade && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Subclade
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{haplogroup.subclade}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
            type === 'y-dna'
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300'
          )}
        >
          {isExpanded ? (
            <><ChevronUp className="w-4 h-4" /> Show less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show details</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Compact version for summary views
 */
export function HaplogroupCardCompact({
  type,
  haplogroup,
  className,
}: HaplogroupCardProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'p-4 rounded-xl border-2',
      config.borderColor,
      config.bgColor,
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          type === 'y-dna' ? 'bg-blue-500' : 'bg-pink-500'
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-medium', config.accentColor)}>{config.subtitle}</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{haplogroup.haplogroup}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{haplogroup.origin}</p>
        </div>
      </div>
    </div>
  );
}

export default HaplogroupCard;
