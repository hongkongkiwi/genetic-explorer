// Genome Comparison View Component
// Side-by-side visual comparison of shared DNA segments

import { useState, useMemo, useCallback } from 'react';
import { 
  Dna, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Info,
  Share2,
  Download,
  ZoomIn,
  ZoomOut,
  Target,
  GitCompare,
  X
} from 'lucide-react';
import { cn } from '~/utils/cn';
import type { 
  GenomeComparison, 
  ChromosomeComparison, 
  IBD_Segment,
  RelationshipType 
} from '~/types/relatives';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface GenomeComparisonViewProps {
  /** The comparison data to display */
  comparison: GenomeComparison;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when share button is clicked */
  onShare?: () => void;
  /** Callback when download button is clicked */
  onDownload?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show in fullscreen mode */
  defaultFullscreen?: boolean;
}

/**
 * Genome Comparison View
 * 
 * Provides visual comparison of shared DNA segments including:
 * - Side-by-side genome overview
 * - Chromosome-by-chromosome view
 * - Shared SNP highlighting
 * - Similarity percentage
 */
export function GenomeComparisonView({
  comparison,
  onClose,
  onShare,
  onDownload,
  className,
  defaultFullscreen = false,
}: GenomeComparisonViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(defaultFullscreen);
  const [selectedChromosome, setSelectedChromosome] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDetails, setShowDetails] = useState(true);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleChromosomeSelect = useCallback((chromosome: string) => {
    setSelectedChromosome(prev => prev === chromosome ? null : chromosome);
    setZoomLevel(1);
  }, []);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalSegments = comparison.sharedDNA.ibdSegments.length;
    const chromosomesWithMatches = new Set(
      comparison.sharedDNA.ibdSegments.map(s => s.chromosome)
    ).size;
    const largestSegment = comparison.sharedDNA.largestSegment;
    
    return {
      totalSegments,
      chromosomesWithMatches,
      largestSegment,
    };
  }, [comparison]);

  return (
    <div className={cn(
      'flex flex-col bg-white dark:bg-slate-950',
      isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl border shadow-lg',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Genome Comparison
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {comparison.genomeA.name} vs {comparison.genomeB.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400 w-16 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className={cn(showDetails && 'bg-slate-100 dark:bg-slate-800')}
          >
            <Info className="w-4 h-4" />
          </Button>

          {onShare && (
            <Button variant="ghost" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          )}

          {onDownload && (
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={handleToggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Summary */}
        {showDetails && (
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-4">
            <ComparisonSummary comparison={comparison} stats={stats} />
            <RelationshipInfo comparison={comparison} />
            <SegmentList 
              segments={comparison.sharedDNA.ibdSegments}
              onSegmentClick={(seg) => setSelectedChromosome(seg.chromosome)}
            />
          </div>
        )}

        {/* Right Panel - Visualization */}
        <div className="flex-1 overflow-auto p-4">
          {selectedChromosome ? (
            <ChromosomeDetailView
              chromosome={selectedChromosome}
              comparison={comparison}
              zoomLevel={zoomLevel}
              onBack={() => setSelectedChromosome(null)}
            />
          ) : (
            <GenomeOverview
              comparison={comparison}
              zoomLevel={zoomLevel}
              onChromosomeSelect={handleChromosomeSelect}
              selectedChromosome={selectedChromosome}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison Summary Panel
 */
function ComparisonSummary({ 
  comparison, 
  stats 
}: { 
  comparison: GenomeComparison;
  stats: { totalSegments: number; chromosomesWithMatches: number; largestSegment: number };
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <StatValue
            label="Shared DNA"
            value={`${comparison.sharedDNA.percentage.toFixed(2)}%`}
            subtext={`${comparison.sharedDNA.centimorgans} cM`}
          />
          <StatValue
            label="Similarity"
            value={`${comparison.similarityScore.toFixed(1)}%`}
            subtext="Overall match"
          />
          <StatValue
            label="Segments"
            value={stats.totalSegments.toString()}
            subtext="IBD segments"
          />
          <StatValue
            label="Chromosomes"
            value={stats.chromosomesWithMatches.toString()}
            subtext="With matches"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Relationship Information Panel
 */
function RelationshipInfo({ comparison }: { comparison: GenomeComparison }) {
  const { predictedRelationship } = comparison;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Relationship</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {predictedRelationship.displayName}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ConfidenceBadge level={predictedRelationship.confidence} />
          </div>
        </div>

        {predictedRelationship.possibleRelationships.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Also possible:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {predictedRelationship.possibleRelationships.slice(0, 3).map((rel, i) => (
                <Badge key={i} variant="default" size="sm">
                  {rel}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Expected range: {predictedRelationship.expectedRange.min}-{predictedRelationship.expectedRange.max} cM
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Average: {predictedRelationship.expectedRange.average} cM
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Segment List Panel
 */
function SegmentList({ 
  segments, 
  onSegmentClick 
}: { 
  segments: IBD_Segment[];
  onSegmentClick: (segment: IBD_Segment) => void;
}) {
  const sortedSegments = useMemo(() => {
    return [...segments].sort((a, b) => b.centimorgans - a.centimorgans);
  }, [segments]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Segments ({segments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedSegments.map((segment, i) => (
            <button
              key={i}
              onClick={() => onSegmentClick(segment)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                    Chr {segment.chromosome}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatBP(segment.lengthBP)}
                  </span>
                </div>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {segment.centimorgans} cM
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {formatPosition(segment.start)} - {formatPosition(segment.end)}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Genome Overview Visualization
 */
function GenomeOverview({
  comparison,
  zoomLevel,
  onChromosomeSelect,
  selectedChromosome,
}: {
  comparison: GenomeComparison;
  zoomLevel: number;
  onChromosomeSelect: (chr: string) => void;
  selectedChromosome: string | null;
}) {
  // Chromosome sizes (relative to largest)
  const chromosomeSizes: Record<string, number> = {
    '1': 100, '2': 97, '3': 79, '4': 77, '5': 73,
    '6': 69, '7': 64, '8': 59, '9': 57, '10': 54,
    '11': 54, '12': 54, '13': 46, '14': 43, '15': 41,
    '16': 36, '17': 33, '18': 31, '19': 24, '20': 25,
    '21': 19, '22': 21, 'X': 62, 'Y': 24,
  };

  const chromosomes = Object.keys(chromosomeSizes);
  const autosomes = chromosomes.filter(c => !isNaN(Number(c))).sort((a, b) => Number(a) - Number(b));
  const sexChromosomes = ['X', 'Y'];

  return (
    <div 
      className="space-y-4"
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Genome Overview
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Click a chromosome to view details
        </p>
      </div>

      {/* Autosomes */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-3xl mx-auto">
        {autosomes.map((chr) => (
          <ChromosomeBar
            key={chr}
            chromosome={chr}
            size={chromosomeSizes[chr]}
            comparison={comparison}
            isSelected={selectedChromosome === chr}
            onClick={() => onChromosomeSelect(chr)}
          />
        ))}
      </div>

      {/* Sex Chromosomes */}
      <div className="flex justify-center gap-8 mt-6">
        {sexChromosomes.map((chr) => (
          <ChromosomeBar
            key={chr}
            chromosome={chr}
            size={chromosomeSizes[chr]}
            comparison={comparison}
            isSelected={selectedChromosome === chr}
            onClick={() => onChromosomeSelect(chr)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
          <span className="text-slate-600 dark:text-slate-400">No shared DNA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-500" />
          <span className="text-slate-600 dark:text-slate-400">Shared segment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400" />
          <span className="text-slate-600 dark:text-slate-400">Largest segment</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Chromosome Bar
 */
function ChromosomeBar({
  chromosome,
  size,
  comparison,
  isSelected,
  onClick,
}: {
  chromosome: string;
  size: number;
  comparison: GenomeComparison;
  isSelected: boolean;
  onClick: () => void;
}) {
  const chrData = comparison.chromosomeComparisons.find(c => c.chromosome === chromosome);
  const segments = chrData?.ibdSegments || [];
  const totalSharedCM = chrData?.sharedCM || 0;

  // Find the largest segment on this chromosome
  const largestSegment = segments.length > 0
    ? segments.reduce((max, s) => s.centimorgans > max.centimorgans ? s : max, segments[0])
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg transition-all',
        'hover:bg-slate-50 dark:hover:bg-slate-800',
        isSelected && 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
      )}
    >
      <span className="w-8 font-mono font-medium text-slate-600 dark:text-slate-400">
        {chromosome}
      </span>
      
      <div 
        className="relative h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
        style={{ width: `${size * 2}px` }}
      >
        {/* Render segments */}
        {segments.map((segment, i) => {
          const start = (segment.start / (chrData?.lengthBP || 1)) * 100;
          const width = ((segment.end - segment.start) / (chrData?.lengthBP || 1)) * 100;
          const isLargest = largestSegment === segment;
          
          return (
            <div
              key={i}
              className={cn(
                'absolute top-0 bottom-0',
                isLargest ? 'bg-amber-400' : 'bg-indigo-500'
              )}
              style={{
                left: `${start}%`,
                width: `${Math.max(width, 0.5)}%`,
              }}
              title={`${segment.centimorgans} cM`}
            />
          );
        })}
      </div>

      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16 text-right">
        {totalSharedCM > 0 ? `${totalSharedCM} cM` : '-'}
      </span>
    </button>
  );
}

/**
 * Chromosome Detail View
 */
function ChromosomeDetailView({
  chromosome,
  comparison,
  zoomLevel,
  onBack,
}: {
  chromosome: string;
  comparison: GenomeComparison;
  zoomLevel: number;
  onBack: () => void;
}) {
  const chrData = comparison.chromosomeComparisons.find(c => c.chromosome === chromosome);
  const segments = chrData?.ibdSegments || [];
  
  // Mock SNP data for visualization (in real implementation, would come from actual comparison)
  const mockSharedSNPs = useMemo(() => {
    const snps: Array<{ position: number; isShared: boolean }> = [];
    const totalLength = chrData?.lengthBP || 100000000;
    
    // Generate mock data points
    for (let i = 0; i < 1000; i++) {
      const position = Math.floor((i / 1000) * totalLength);
      const inSegment = segments.some(s => position >= s.start && position <= s.end);
      snps.push({ position, isShared: inSegment && Math.random() > 0.3 });
    }
    return snps;
  }, [chrData, segments]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Chromosome {chromosome}
        </h3>
        <Badge variant="primary">
          {segments.length} segment{segments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Chromosome Map */}
      <div className="relative bg-slate-100 dark:bg-slate-800 rounded-xl p-6 overflow-x-auto">
        <div 
          className="relative h-32 min-w-[800px]"
          style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}
        >
          {/* Chromosome bar */}
          <div className="absolute top-1/2 left-0 right-0 h-8 -mt-4 bg-slate-300 dark:bg-slate-600 rounded-full" />
          
          {/* Centromere (approximate position) */}
          <div 
            className="absolute top-1/2 w-4 h-10 -mt-5 bg-slate-400 dark:bg-slate-500 rounded-full"
            style={{ left: '45%' }}
          />

          {/* Segment highlights */}
          {segments.map((segment, i) => {
            const totalLength = chrData?.lengthBP || 1;
            const start = (segment.start / totalLength) * 100;
            const width = ((segment.end - segment.start) / totalLength) * 100;
            
            return (
              <div
                key={i}
                className="absolute top-1/2 h-12 -mt-6 bg-indigo-500/80 rounded-lg border-2 border-indigo-600 cursor-pointer hover:bg-indigo-500 transition-colors flex items-center justify-center"
                style={{
                  left: `${start}%`,
                  width: `${Math.max(width, 1)}%`,
                }}
                title={`${segment.centimorgans} cM, ${segment.snpCount} SNPs`}
              >
                <span className="text-white text-xs font-medium px-2 whitespace-nowrap overflow-hidden">
                  {segment.centimorgans} cM
                </span>
              </div>
            );
          })}

          {/* Position markers */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 mt-2">
            <span>0</span>
            <span>25M</span>
            <span>50M</span>
            <span>75M</span>
            <span>{formatBP(chrData?.lengthBP || 0)}</span>
          </div>
        </div>
      </div>

      {/* SNP Density Visualization */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Shared SNP Density
        </h4>
        <div className="h-24 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <svg className="w-full h-full">
            {mockSharedSNPs.map((snp, i) => {
              const totalLength = chrData?.lengthBP || 1;
              const x = (snp.position / totalLength) * 100;
              const height = snp.isShared ? Math.random() * 80 + 20 : Math.random() * 20;
              
              return (
                <rect
                  key={i}
                  x={`${x}%`}
                  y={100 - height}
                  width="0.1%"
                  height={height}
                  fill={snp.isShared ? '#6366f1' : '#e2e8f0'}
                  className="dark:fill-slate-700"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Segment Details Table */}
      {segments.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Segment Details
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">Start</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">End</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">Length (bp)</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">cM</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">SNPs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {segments.map((segment, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-2 font-mono">{formatPosition(segment.start)}</td>
                    <td className="px-4 py-2 font-mono">{formatPosition(segment.end)}</td>
                    <td className="px-4 py-2">{formatBP(segment.lengthBP)}</td>
                    <td className="px-4 py-2 font-medium text-indigo-600 dark:text-indigo-400">
                      {segment.centimorgans}
                    </td>
                    <td className="px-4 py-2">{segment.snpCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Confidence badge component
 */
function ConfidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    very_high: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    high: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    very_low: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const labels: Record<string, string> = {
    very_high: 'Very High',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    very_low: 'Very Low',
  };

  return (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded-full font-medium',
      colors[level] || colors.medium
    )}>
      {labels[level] || level}
    </span>
  );
}

/**
 * Stat value component
 */
function StatValue({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

/**
 * Format base pair count
 */
function formatBP(bp: number): string {
  if (bp >= 1000000) {
    return `${(bp / 1000000).toFixed(1)}M`;
  }
  if (bp >= 1000) {
    return `${(bp / 1000).toFixed(1)}K`;
  }
  return bp.toString();
}

/**
 * Format genomic position
 */
function formatPosition(position: number): string {
  return formatBP(position);
}

export default GenomeComparisonView;
