import { motion } from 'framer-motion';
import { Card, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import {
  Dna,
  CheckCircle2,
  Sparkles,
  Share2,
  TrendingUp,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import type { TraitsReport } from '~/types/traits';
import {
  CATEGORY_ICONS,
  CATEGORY_DISPLAY_NAMES,
} from '~/data/traitsDatabase';

interface TraitsSummaryProps {
  report: TraitsReport;
  stats: {
    total: number;
    analyzed: number;
    coverage: number;
    byConfidence: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

export function TraitsSummary({ report, stats }: TraitsSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(report.shareableSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate category breakdown
  const categoryBreakdown = report.categories.map((cat) => ({
    category: cat.category,
    displayName: CATEGORY_DISPLAY_NAMES[cat.category],
    icon: CATEGORY_ICONS[cat.category],
    total: cat.totalTraits,
    analyzed: cat.analyzedTraits,
    percentage: cat.totalTraits > 0 ? Math.round((cat.analyzedTraits / cat.totalTraits) * 100) : 0,
  }));

  // Get confidence distribution
  const confidenceLevels = [
    { level: 'very-high', label: 'Very High', color: 'bg-emerald-500', count: stats.byConfidence['very-high'] || 0 },
    { level: 'high', label: 'High', color: 'bg-blue-500', count: stats.byConfidence['high'] || 0 },
    { level: 'medium', label: 'Medium', color: 'bg-amber-500', count: stats.byConfidence['medium'] || 0 },
    { level: 'low', label: 'Low', color: 'bg-slate-400', count: stats.byConfidence['low'] || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Stats Card */}
      <Card className="lg:col-span-2 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Analysis Overview
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Generated {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Summary
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox
              icon={Dna}
              value={stats.total}
              label="Total Traits"
              color="indigo"
            />
            <StatBox
              icon={CheckCircle2}
              value={stats.analyzed}
              label="Analyzed"
              color="emerald"
              subtitle={`${stats.coverage}% coverage`}
            />
            <StatBox
              icon={Sparkles}
              value={report.highlights.mostInteresting.length}
              label="Highlights"
              color="amber"
            />
            <StatBox
              icon={Star}
              value={report.highlights.rareTraits.length}
              label="Rare Findings"
              color="purple"
            />
          </div>

          {/* Confidence Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Confidence Distribution
            </h3>
            <div className="flex h-4 rounded-full overflow-hidden">
              {confidenceLevels.map((conf) =>
                conf.count > 0 ? (
                  <motion.div
                    key={conf.level}
                    initial={{ width: 0 }}
                    animate={{ width: `${(conf.count / stats.total) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={conf.color}
                    title={`${conf.label}: ${conf.count}`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {confidenceLevels.map((conf) =>
                conf.count > 0 ? (
                  <div key={conf.level} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${conf.color}`} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {conf.label} ({conf.count})
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Shareable Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-indigo-700 dark:text-indigo-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                  Share Your Results
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {report.shareableSummary}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Categories
          </h3>

          <div className="space-y-4">
            {categoryBreakdown.map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {cat.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">
                      {cat.analyzed}/{cat.total}
                    </Badge>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Insights */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Quick Insights
            </h4>
            <div className="space-y-2">
              {report.highlights.mostInteresting.slice(0, 2).map((trait) => (
                <div
                  key={trait.trait.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-lg">{trait.trait.icon}</span>
                  <span className="text-slate-600 dark:text-slate-400 truncate">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {trait.trait.name}:
                    </span>{' '}
                    {trait.predictedPhenotype}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatBoxProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose';
  subtitle?: string;
}

function StatBox({ icon: Icon, value, label, color, subtitle }: StatBoxProps) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  };

  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <Icon className="w-5 h-5 mb-2 opacity-80" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
      {subtitle && <div className="text-xs opacity-60 mt-0.5">{subtitle}</div>}
    </div>
  );
}

export default TraitsSummary;
