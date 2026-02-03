import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { 
  GitCompare, 
  X, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Dna,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '~/utils/cn';

interface Genome {
  id: string;
  filename: string;
  uploadedAt: string;
  snpCount: number;
}

interface ComparisonResult {
  sharedVariants: number;
  uniqueToA: number;
  uniqueToB: number;
  differences: Array<{
    rsid: string;
    gene?: string;
    genomeA: { genotype: string; impact: string };
    genomeB: { genotype: string; impact: string };
    significance: 'high' | 'medium' | 'low';
  }>;
  similarity: number;
}

interface ReportComparisonProps {
  genomes: Genome[];
}

export function ReportComparison({ genomes }: ReportComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [genomeA, setGenomeA] = useState<string>('');
  const [genomeB, setGenomeB] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['differences']));

  const handleCompare = async () => {
    if (!genomeA || !genomeB) return;
    
    setIsComparing(true);
    try {
      const response = await fetch(`/api/compare-genomes?a=${genomeA}&b=${genomeB}`);
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Comparison failed:', error);
    }
    setIsComparing(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const reset = () => {
    setGenomeA('');
    setGenomeB('');
    setResult(null);
  };

  if (genomes.length < 2) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <GitCompare className="w-4 h-4" />
        Compare Genomes
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setTimeout(reset, 300);
        }}
        title="Compare Genomes"
        description="Select two genomes to compare their variants and similarity"
        size="xl"
      >
        {!result ? (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Genome
                </label>
                <select
                  value={genomeA}
                  onChange={(e) => setGenomeA(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select genome...</option>
                  {genomes.map((g) => (
                    <option key={g.id} value={g.id} disabled={g.id === genomeB}>
                      {g.filename}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Second Genome
                </label>
                <select
                  value={genomeB}
                  onChange={(e) => setGenomeB(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select genome...</option>
                  {genomes.map((g) => (
                    <option key={g.id} value={g.id} disabled={g.id === genomeA}>
                      {g.filename}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompare}
                disabled={!genomeA || !genomeB || isComparing}
                isLoading={isComparing}
                className="gap-2"
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SummaryCard
                label="Similarity"
                value={`${result.similarity.toFixed(1)}%`}
                color={result.similarity > 90 ? 'green' : result.similarity > 70 ? 'yellow' : 'red'}
                icon={result.similarity > 90 ? CheckCircle : AlertCircle}
              />
              <SummaryCard
                label="Shared Variants"
                value={result.sharedVariants.toLocaleString()}
                color="blue"
              />
              <SummaryCard
                label={`Unique to ${genomes.find(g => g.id === genomeA)?.filename.slice(0, 10)}...`}
                value={result.uniqueToA.toLocaleString()}
                color="purple"
              />
              <SummaryCard
                label={`Unique to ${genomes.find(g => g.id === genomeB)?.filename.slice(0, 10)}...`}
                value={result.uniqueToB.toLocaleString()}
                color="orange"
              />
            </div>

            {/* Differences Section */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('differences')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    Key Differences ({result.differences.length})
                  </span>
                </div>
                {expandedSections.has('differences') ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {expandedSections.has('differences') && (
                <div className="max-h-96 overflow-y-auto">
                  {result.differences.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400">
                        No significant differences found between these genomes.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">RSID</th>
                          <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                            {genomes.find(g => g.id === genomeA)?.filename.slice(0, 15)}...
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                            {genomes.find(g => g.id === genomeB)?.filename.slice(0, 15)}...
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">Significance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {result.differences.map((diff, index) => (
                          <motion.tr
                            key={diff.rsid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-mono font-medium text-indigo-700 dark:text-indigo-400">
                                  {diff.rsid}
                                </span>
                                {diff.gene && (
                                  <span className="text-xs text-slate-500 block">{diff.gene}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <GenotypeBadge genotype={diff.genomeA.genotype} impact={diff.genomeA.impact} />
                            </td>
                            <td className="px-4 py-3">
                              <GenotypeBadge genotype={diff.genomeB.genotype} impact={diff.genomeB.impact} />
                            </td>
                            <td className="px-4 py-3">
                              <SignificanceBadge level={diff.significance} />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Interpretation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Dna className="w-4 h-4" />
                Interpretation
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {result.similarity > 95
                  ? 'These genomes are remarkably similar, suggesting they may be from close relatives or the same individual tested with different services.'
                  : result.similarity > 80
                  ? 'These genomes show significant similarity, consistent with close family members (parent-child or siblings).'
                  : result.similarity > 50
                  ? 'These genomes show moderate similarity, consistent with more distant relatives.'
                  : 'These genomes show low similarity, suggesting unrelated individuals or very distant relatives.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={reset} className="gap-2">
                <GitCompare className="w-4 h-4" />
                Compare Others
              </Button>
              <Button onClick={() => setIsOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function SummaryCard({ 
  label, 
  value, 
  color, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange';
  icon?: any;
}) {
  const colors = {
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4 text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
      {Icon && <Icon className="w-4 h-4 mx-auto mt-2 opacity-60" />}
    </div>
  );
}

function GenotypeBadge({ genotype, impact }: { genotype: string; impact: string }) {
  const impactColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    protective: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-sm font-medium">{genotype}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${impactColors[impact] || 'bg-slate-100 text-slate-700'}`}>
        {impact}
      </span>
    </div>
  );
}

function SignificanceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}
