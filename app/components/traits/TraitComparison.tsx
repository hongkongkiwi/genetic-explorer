import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import {
  Users,
  User,
  ArrowRight,
  Sparkles,
  GitCompare,
  CheckCircle2,
  XCircle,
  Minus,
  Dna,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { compareTraits, getShareableTraitData } from '~/utils/analysis/traits';
import type { GenomeData, TraitResult } from '~/types/traits';
import { CATEGORY_DISPLAY_NAMES, CATEGORY_ICONS } from '~/data/traitsDatabase';

interface TraitComparisonProps {
  genomeA: GenomeData;
  genomeB: GenomeData;
  nameA?: string;
  nameB?: string;
  onClose?: () => void;
}

export function TraitComparison({
  genomeA,
  genomeB,
  nameA = 'Person A',
  nameB = 'Person B',
  onClose,
}: TraitComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showOnlySimilarities, setShowOnlySimilarities] = useState(false);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Run comparison
  const comparison = useMemo(() => {
    return compareTraits(genomeA, genomeB);
  }, [genomeA, genomeB]);

  // Calculate statistics
  const stats = useMemo(() => {
    const identical = comparison.filter((c) => c.similarity === 'identical').length;
    const similar = comparison.filter((c) => c.similarity === 'similar').length;
    const different = comparison.filter((c) => c.similarity === 'different').length;
    const total = comparison.length;
    const similarityPercentage = total > 0 ? Math.round(((identical + similar * 0.5) / total) * 100) : 0;

    return {
      identical,
      similar,
      different,
      total,
      similarityPercentage,
    };
  }, [comparison]);

  // Filter comparisons
  const filteredComparisons = useMemo(() => {
    let filtered = comparison;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.trait.category === selectedCategory);
    }

    if (showOnlySimilarities) {
      filtered = filtered.filter((c) => c.similarity === 'identical' || c.similarity === 'similar');
    }

    if (showOnlyDifferences) {
      filtered = filtered.filter((c) => c.similarity === 'different');
    }

    return filtered;
  }, [comparison, selectedCategory, showOnlySimilarities, showOnlyDifferences]);

  // Get shared traits for highlights
  const sharedTraits = useMemo(() => {
    return comparison
      .filter((c) => c.similarity === 'identical')
      .slice(0, 5);
  }, [comparison]);

  // Get interesting differences
  const interestingDifferences = useMemo(() => {
    return comparison
      .filter((c) => c.similarity === 'different' && c.genomeAResult.userGenotype && c.genomeBResult.userGenotype)
      .slice(0, 5);
  }, [comparison]);

  const handleShareComparison = () => {
    const shareText = `${nameA} and ${nameB} compared their genetic traits! 

🧬 Similarity Score: ${stats.similarityPercentage}%
✅ Identical traits: ${stats.identical}
👥 Similar traits: ${stats.similar}
🔄 Different traits: ${stats.different}

Shared traits include: ${sharedTraits.slice(0, 3).map(t => t.trait.name).join(', ')}

Analyzed with Genetic Explorer`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSimilarityIcon = (similarity: string) => {
    switch (similarity) {
      case 'identical':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'similar':
        return <Minus className="w-5 h-5 text-blue-500" />;
      case 'different':
        return <XCircle className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getSimilarityBadge = (similarity: string) => {
    switch (similarity) {
      case 'identical':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            🤝 Same
          </Badge>
        );
      case 'similar':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            👥 Similar
          </Badge>
        );
      case 'different':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            🔄 Different
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {nameA[0]}
            </div>
            <div className="text-center px-2">
              <GitCompare className="w-5 h-5 text-slate-400" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {nameB[0]}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Trait Comparison
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {nameA} vs {nameB}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShareComparison}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Similarity Score */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Similarity Score
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Based on {stats.total} traits analyzed
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-indigo-700 dark:text-indigo-400">
                {stats.similarityPercentage}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {stats.identical + stats.similar} shared traits
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-4 bg-white dark:bg-slate-800 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.identical / stats.total) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-emerald-500"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.similar / stats.total) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-blue-500"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.different / stats.total) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-amber-500"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Identical ({stats.identical})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Similar ({stats.similar})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Different ({stats.different})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shared Traits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Shared Traits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sharedTraits.length > 0 ? (
              <div className="space-y-3">
                {sharedTraits.map((trait) => (
                  <div
                    key={trait.trait.id}
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                  >
                    <span className="text-2xl">{trait.trait.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {trait.trait.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Both: {trait.genomeAResult.predictedPhenotype}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      🤝
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                No identical traits found. You're quite different!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Interesting Differences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Key Differences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interestingDifferences.length > 0 ? (
              <div className="space-y-3">
                {interestingDifferences.map((trait) => (
                  <div
                    key={trait.trait.id}
                    className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                  >
                    <span className="text-2xl">{trait.trait.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {trait.trait.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">
                          {trait.genomeAResult.predictedPhenotype}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-pink-600 dark:text-pink-400">
                          {trait.genomeBResult.predictedPhenotype}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      🔄
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                You're very similar in most analyzed traits!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          <Dna className="w-4 h-4 mr-1" />
          All
        </Button>
        {['physical', 'sensory', 'behavioral', 'abilities', 'miscellaneous'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_DISPLAY_NAMES[cat]}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant={showOnlySimilarities ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setShowOnlySimilarities(!showOnlySimilarities);
            setShowOnlyDifferences(false);
          }}
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Similarities
        </Button>
        <Button
          variant={showOnlyDifferences ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setShowOnlyDifferences(!showOnlyDifferences);
            setShowOnlySimilarities(false);
          }}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Differences
        </Button>
      </div>

      {/* Detailed Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredComparisons.map((comparison) => (
            <motion.div
              key={comparison.trait.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  expandedTrait === comparison.trait.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() =>
                  setExpandedTrait(
                    expandedTrait === comparison.trait.id ? null : comparison.trait.id
                  )
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{comparison.trait.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {comparison.trait.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {CATEGORY_DISPLAY_NAMES[comparison.trait.category]}
                        </p>
                      </div>
                    </div>
                    {getSimilarityBadge(comparison.similarity)}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {nameA}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {comparison.genomeAResult.predictedPhenotype}
                      </p>
                      {comparison.genomeAResult.userGenotype && (
                        <code className="text-xs text-slate-500 dark:text-slate-400">
                          {comparison.genomeAResult.userGenotype}
                        </code>
                      )}
                    </div>

                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
                          {nameB}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {comparison.genomeBResult.predictedPhenotype}
                      </p>
                      {comparison.genomeBResult.userGenotype && (
                        <code className="text-xs text-slate-500 dark:text-slate-400">
                          {comparison.genomeBResult.userGenotype}
                        </code>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedTrait === comparison.trait.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {comparison.trait.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">💡</span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {comparison.genomeAResult.funFact}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredComparisons.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No traits match your filters
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your filter settings to see more results.
          </p>
        </div>
      )}
    </div>
  );
}

export default TraitComparison;
