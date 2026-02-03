import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '~/components/Navbar';
import { TraitCard } from '~/components/TraitCard';
import { TraitsSummary } from '~/components/traits/TraitsSummary';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import {
  ArrowLeft,
  Sparkles,
  Share2,
  Users,
  Search,
  Filter,
  Download,
  Dna,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
} from 'lucide-react';
import { getGenome } from '~/utils/database';
import {
  generateTraitsReport,
  filterTraitResults,
  getAnalysisStats,
  getShareableTraitData,
  type ConfidenceLevel,
} from '~/utils/traitsAnalysis';
import type { TraitsReport, TraitResult, TraitCategory } from '~/types/traits';
import type { GenomeData } from '~/types/genetics';
import {
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
} from '~/data/traitsDatabase';

export const Route = createFileRoute('/traits/$id')({
  component: TraitsReportPage,
});

const CATEGORIES: TraitCategory[] = ['physical', 'sensory', 'behavioral', 'abilities', 'miscellaneous'];

const CONFIDENCE_LEVELS: { value: ConfidenceLevel | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Levels', color: 'bg-slate-100 text-slate-700' },
  { value: 'very-high', label: 'Very High', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'high', label: 'High', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600' },
];

function TraitsReportPage() {
  const { id } = Route.useParams();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [report, setReport] = useState<TraitsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TraitCategory | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setIsLoading(true);

      // Get genome data
      const genomeData = getGenome(id);
      if (!genomeData) {
        setError('Genome not found');
        return;
      }

      setGenome(genomeData);

      // Generate traits report
      const traitsReport = generateTraitsReport(genomeData);
      setReport(traitsReport);
    } catch (err) {
      console.error('Traits report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate traits report');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all trait results from all categories
  const allResults = useMemo(() => {
    if (!report) return [];
    return report.categories.flatMap((cat) => cat.traits);
  }, [report]);

  // Filter results based on current filters
  const filteredResults = useMemo(() => {
    return filterTraitResults(allResults, {
      category: activeCategory,
      confidence: confidenceFilter,
      search: searchQuery,
    });
  }, [allResults, activeCategory, confidenceFilter, searchQuery]);

  // Get stats for the summary
  const stats = useMemo(() => {
    return getAnalysisStats(allResults);
  }, [allResults]);

  // Get traits for current category tab
  const currentCategoryTraits = useMemo(() => {
    if (activeCategory === 'all') return filteredResults;
    return filteredResults.filter((r) => r.trait.category === activeCategory);
  }, [filteredResults, activeCategory]);

  const handleShare = async () => {
    const shareText = report?.shareableSummary || '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Genetic Traits Report',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTrait = (result: TraitResult) => {
    const shareData = getShareableTraitData(result);
    const text = `${shareData.emoji} ${shareData.traitName}: ${shareData.result}\n\n💡 ${shareData.funFact}\n\nAnalyzed with Genetic Explorer 🧬`;
    copyToClipboard(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Analyzing Your Traits 🧬
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              We're decoding your genetic blueprint to reveal fascinating insights about your unique characteristics...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Error Loading Report
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error || 'Report could not be generated'}
            </p>
            <Link
              to="/genomes"
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Back to Genomes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/genomes"
            className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Genomes
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Your Genetic Traits 🧬
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {genome?.filename} • {stats.analyzed} of {stats.total} traits analyzed
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowComparisonModal(true)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <TraitsSummary report={report} stats={stats} />
        </motion.div>

        {/* Fun Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl shadow-lg p-8 mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">✨</div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Your Genetic Story</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                {report.shareableSummary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {report.highlights.mostInteresting.slice(0, 3).map((trait) => (
                  <Badge
                    key={trait.trait.id}
                    className="bg-white/20 text-white border-white/30"
                  >
                    {trait.trait.icon} {trait.predictedPhenotype}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search traits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Confidence Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value as ConfidenceLevel | 'all')}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CONFIDENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} Confidence
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Dna className="w-4 h-4" />
            All Traits
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeCategory === 'all' ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              {allResults.length}
            </span>
          </button>

          {CATEGORIES.map((category) => {
            const count = allResults.filter((r) => r.trait.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{CATEGORY_ICONS[category]}</span>
                {CATEGORY_DISPLAY_NAMES[category]}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    activeCategory === category ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Traits Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {currentCategoryTraits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {currentCategoryTraits.map((result, index) => (
                  <motion.div
                    key={result.trait.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TraitCard
                      result={result}
                      variant="default"
                      onShare={handleShareTrait}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No traits found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Try adjusting your filters to see more results.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveCategory('all');
                  setConfidenceFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Highlights Section */}
        {report.highlights.mostInteresting.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Most Interesting Findings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.highlights.mostInteresting.slice(0, 3).map((result, index) => (
                <motion.div
                  key={result.trait.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <TraitCard result={result} variant="detailed" onShare={handleShareTrait} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fun Facts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎉</span>
            Did You Know?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.highlights.mostInteresting.slice(0, 4).map((result) => (
              <div
                key={result.trait.id}
                className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
              >
                <span className="text-2xl">{result.trait.icon}</span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {result.trait.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {result.funFact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6"
        >
          <h3 className="font-semibold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Scientific Note
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            These traits are based on genetic associations from scientific research. However, genetics
            is just one part of who you are—environment, lifestyle, and other factors also play
            important roles. Think of this as a fun exploration of your genetic tendencies, not a
            definitive prediction!
          </p>
        </motion.div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Share Your Traits 🧬
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Let others discover what makes you unique!
              </p>
              
              <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {report.shareableSummary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(report.shareableSummary)}
                  className="flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(window.location.href)}
                  className="flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link
                </Button>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(report.shareableSummary);
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                  }}
                  className="p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const text = encodeURIComponent(report.shareableSummary);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                  className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const text = encodeURIComponent(report.shareableSummary);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                  className="p-3 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparisonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComparisonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Compare with Friends & Family
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Coming soon! Soon you'll be able to compare your traits side-by-side with friends
                and family to discover what you have in common.
              </p>
              <Button onClick={() => setShowComparisonModal(false)}>Got it!</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
