import { memo, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import type { TraitResult, ConfidenceLevel } from '~/types/traits';
import { formatConfidence, getConfidenceColor } from '~/utils/traitsAnalysis';
import { cn } from '~/lib/utils';

interface TraitCardProps {
  result: TraitResult;
  variant?: 'default' | 'compact' | 'detailed';
  onShare?: (result: TraitResult) => void;
  className?: string;
}

/**
 * Confidence Badge Component
 */
const ConfidenceBadge = memo(function ConfidenceBadge({
  confidence,
}: {
  confidence: ConfidenceLevel;
}) {
  return (
    <Badge
      variant="default"
      className={cn('font-medium', getConfidenceColor(confidence))}
    >
      {formatConfidence(confidence)} Confidence
    </Badge>
  );
});

/**
 * Data Availability Indicator
 */
const DataIndicator = memo(function DataIndicator({
  hasData,
}: {
  hasData: boolean;
}) {
  if (hasData) {
    return (
      <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400">
        <svg
          className="w-3 h-3 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Data Available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400">
      <svg
        className="w-3 h-3 mr-1"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      No Data
    </span>
  );
});

/**
 * Fun Fact Box Component
 */
const FunFactBox = memo(function FunFactBox({ fact }: { fact: string }) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isRevealed) {
    return (
      <button
        onClick={() => setIsRevealed(true)}
        className="w-full mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
      >
        <div className="flex items-center justify-center text-purple-700 dark:text-purple-400">
          <span className="text-lg mr-2">💡</span>
          <span className="text-sm font-medium group-hover:underline">
            Click to reveal fun fact!
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
      <div className="flex items-start">
        <span className="text-lg mr-2 flex-shrink-0">💡</span>
        <div>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
            Did you know?
          </span>
          <p className="text-sm text-purple-900 dark:text-purple-200 mt-1">
            {fact}
          </p>
        </div>
      </div>
    </div>
  );
});

/**
 * Share Button Component
 */
const ShareButton = memo(function ShareButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onClick]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="text-xs"
    >
      {copied ? (
        <>
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </>
      )}
    </Button>
  );
});

/**
 * Scientific Details Component
 */
const ScientificDetails = memo(function ScientificDetails({
  details,
  snps,
}: {
  details?: string;
  snps: Array<{ rsid: string; gene: string; geneName?: string }>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <svg
          className={cn(
            'w-4 h-4 mr-1 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        {isExpanded ? 'Hide' : 'Show'} scientific details
      </button>

      {isExpanded && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {details && <p>{details}</p>}
          
          <div>
            <span className="font-medium">Relevant SNPs:</span>
            <ul className="mt-1 space-y-1">
              {snps.map((snp) => (
                <li key={snp.rsid} className="flex items-center">
                  <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
                    {snp.rsid}
                  </code>
                  <span className="mx-1.5 text-slate-400">→</span>
                  <span>{snp.geneName || snp.gene}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Main Trait Card Component
 */
export const TraitCard = memo(function TraitCard({
  result,
  variant = 'default',
  onShare,
  className,
}: TraitCardProps) {
  const { trait, predictedPhenotype, confidence, explanation, funFact, userGenotype } = result;
  const hasData = userGenotype !== null;

  const handleShare = useCallback(() => {
    const shareText = `${trait.icon} ${trait.name}: ${predictedPhenotype}\n\n${funFact}\n\nAnalyzed with Genetic Explorer`;
    
    if (navigator.share) {
      navigator.share({
        title: `My ${trait.name} Result`,
        text: shareText,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    
    onShare?.(result);
  }, [result, trait, predictedPhenotype, funFact, onShare]);

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl" role="img" aria-label={trait.name}>
                {trait.icon}
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {trait.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {predictedPhenotype}
                </p>
              </div>
            </div>
            <ConfidenceBadge confidence={confidence} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl" role="img" aria-label={trait.name}>
                {trait.icon}
              </span>
              <div>
                <CardTitle className="text-xl">{trait.name}</CardTitle>
                <CardDescription className="mt-1">
                  {trait.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <ConfidenceBadge confidence={confidence} />
              <DataIndicator hasData={hasData} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Result Display */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Prediction
            </span>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mt-1">
              {predictedPhenotype}
            </p>
            {userGenotype && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your genotype:{' '}
                <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  {userGenotype}
                </code>
              </p>
            )}
          </div>

          {/* Explanation */}
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              What this means
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              {explanation}
            </p>
          </div>

          {/* Fun Fact */}
          <FunFactBox fact={funFact} />

          {/* Scientific Details */}
          <ScientificDetails details={trait.scientificDetails} snps={trait.snps} />
        </CardContent>

        <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Category: {trait.category}
            </span>
            <ShareButton onClick={handleShare} />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label={trait.name}>
              {trait.icon}
            </span>
            <div>
              <CardTitle className="text-base">{trait.name}</CardTitle>
              <DataIndicator hasData={hasData} />
            </div>
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {predictedPhenotype}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {explanation}
          </p>
        </div>

        <FunFactBox fact={funFact} />
      </CardContent>

      {onShare && (
        <CardFooter className="pt-0">
          <ShareButton onClick={handleShare} />
        </CardFooter>
      )}
    </Card>
  );
});

export default TraitCard;

/**
 * Trait Card Skeleton for loading states
 */
export function TraitCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="space-y-1">
              <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </CardContent>
    </Card>
  );
}

/**
 * Empty state for when no traits match filters
 */
export function TraitCardEmpty({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
        No traits found
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Try adjusting your filters to see more results.
      </p>
      {onClearFilters && (
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

/**
 * Trait Comparison Card - for comparing traits between two genomes
 */
interface TraitComparisonCardProps {
  traitA: TraitResult;
  traitB: TraitResult;
  similarity: 'identical' | 'similar' | 'different';
  className?: string;
}

export const TraitComparisonCard = memo(function TraitComparisonCard({
  traitA,
  traitB,
  similarity,
  className,
}: TraitComparisonCardProps) {
  const similarityConfig = {
    identical: {
      icon: '🤝',
      label: 'Same',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    similar: {
      icon: '👥',
      label: 'Similar',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    different: {
      icon: '🔄',
      label: 'Different',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    },
  };

  const config = similarityConfig[similarity];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{traitA.trait.icon}</span>
            <CardTitle className="text-base">{traitA.trait.name}</CardTitle>
          </div>
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
            {config.icon} {config.label}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-xs text-slate-500 dark:text-slate-400">Genome A</span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
              {traitA.predictedPhenotype}
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-xs text-slate-500 dark:text-slate-400">Genome B</span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
              {traitB.predictedPhenotype}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
