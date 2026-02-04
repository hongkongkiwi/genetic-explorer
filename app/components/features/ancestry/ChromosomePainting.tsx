/**
 * ChromosomePainting Component
 * 
 * Visual representation of chromosomes 1-22, X, Y with color-coded
 * ancestry segments. Includes hover tooltips and legend.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { AncestrySegment, PopulationGroup } from '~/types/ancestry';

interface ChromosomePaintingProps {
  segments: AncestrySegment[];
  className?: string;
  showChromosomeLabels?: boolean;
  allowZoom?: boolean;
}

// Color palette matching EthnicityChart
const POPULATION_COLORS: Record<PopulationGroup, string> = {
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

// Approximate chromosome lengths in base pairs (GRCh37)
const CHROMOSOME_LENGTHS: Record<string, number> = {
  '1': 249250621,
  '2': 243199373,
  '3': 198022430,
  '4': 191154276,
  '5': 180915260,
  '6': 171115067,
  '7': 159138663,
  '8': 146364022,
  '9': 141213431,
  '10': 135534747,
  '11': 135006516,
  '12': 133851895,
  '13': 115169878,
  '14': 107349540,
  '15': 102531392,
  '16': 90354753,
  '17': 81195210,
  '18': 78077248,
  '19': 59128983,
  '20': 63025520,
  '21': 48129895,
  '22': 51304566,
  'X': 155270560,
  'Y': 59373566,
};

const CHROMOSOME_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
                          '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 
                          '21', '22', 'X', 'Y'];

interface SegmentWithDisplay extends AncestrySegment {
  left: number;
  width: number;
  color: string;
}

interface ChromosomeData {
  name: string;
  length: number;
  segments: SegmentWithDisplay[];
}

/**
 * Individual Chromosome Visualization
 */
function ChromosomeBar({
  chromosome,
  isActive,
  onHover,
  scale = 1,
}: {
  chromosome: ChromosomeData;
  isActive: boolean;
  onHover: (active: boolean) => void;
  scale?: number;
}) {
  const [hoveredSegment, setHoveredSegment] = useState<SegmentWithDisplay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 80,
      });
    }
  };

  // Check if this is a sex chromosome
  const isSexChromosome = chromosome.name === 'X' || chromosome.name === 'Y';

  return (
    <div 
      className="flex items-center gap-3 py-1"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Chromosome Label */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
        isSexChromosome 
          ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
      )}>
        {chromosome.name}
      </div>

      {/* Chromosome Bar */}
      <div 
        ref={barRef}
        className="relative flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-crosshair"
        style={{ minWidth: `${200 * scale}px` }}
        onMouseMove={handleMouseMove}
      >
        {/* Centromere indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 transform -translate-x-1/2 z-10" />
        
        {/* Segments */}
        {chromosome.segments.map((segment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            className="absolute top-0 bottom-0 hover:brightness-110 transition-all"
            style={{
              left: `${segment.left}%`,
              width: `${Math.max(segment.width, 0.5)}%`,
              backgroundColor: segment.color,
            }}
            onMouseEnter={() => setHoveredSegment(segment)}
            onMouseLeave={() => setHoveredSegment(null)}
          />
        ))}

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredSegment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none whitespace-nowrap"
              style={{
                left: Math.min(tooltipPos.x, barRef.current ? barRef.current.clientWidth - 150 : 0),
                top: tooltipPos.y,
              }}
            >
              <p className="font-semibold">{hoveredSegment.population}</p>
              <p>Position: {hoveredSegment.start.toLocaleString()} - {hoveredSegment.end.toLocaleString()}</p>
              <p>Confidence: {(hoveredSegment.confidence * 100).toFixed(0)}%</p>
              <p>SNPs: {hoveredSegment.snpCount}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Segment count indicator */}
      <div className="w-12 text-right text-xs text-slate-500 dark:text-slate-400">
        {chromosome.segments.length}
      </div>
    </div>
  );
}

/**
 * Legend Component
 */
function PaintingLegend({
  populations,
}: {
  populations: PopulationGroup[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedPopulations = isExpanded ? populations : populations.slice(0, 6);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Population Colors
        </h4>
        {populations.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-800"
          >
            {isExpanded ? 'Show less' : `+${populations.length - 6} more`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {displayedPopulations.map((pop) => (
          <div key={pop} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: POPULATION_COLORS[pop] || '#6b7280' }}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {pop}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Statistics Panel
 */
function StatisticsPanel({
  segments,
}: {
  segments: AncestrySegment[];
}) {
  const stats = useMemo(() => {
    const byPopulation = segments.reduce((acc, seg) => {
      acc[seg.population] = (acc[seg.population] || 0) + (seg.end - seg.start);
      return acc;
    }, {} as Record<string, number>);

    const totalLength = Object.values(byPopulation).reduce((a, b) => a + b, 0);
    
    return Object.entries(byPopulation)
      .map(([population, length]) => ({
        population,
        length,
        percentage: (length / totalLength) * 100,
      }))
      .sort((a, b) => b.length - a.length);
  }, [segments]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Segment Statistics
      </h4>
      {stats.slice(0, 5).map(({ population, length, percentage }) => (
        <div key={population} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: POPULATION_COLORS[population as PopulationGroup] || '#6b7280' }}
            />
            <span className="text-slate-600 dark:text-slate-400">{population}</span>
          </div>
          <div className="text-slate-500 dark:text-slate-500">
            {(length / 1000000).toFixed(1)}Mb ({percentage.toFixed(1)}%)
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main ChromosomePainting Component
 */
export function ChromosomePainting({
  segments,
  className,
  showChromosomeLabels = true,
  allowZoom = true,
}: ChromosomePaintingProps) {
  const [scale, setScale] = useState(1);
  const [activeChromosome, setActiveChromosome] = useState<string | null>(null);

  // Process segments into chromosome data
  const chromosomeData = useMemo(() => {
    const data: ChromosomeData[] = [];

    for (const chromName of CHROMOSOME_ORDER) {
      const chromLength = CHROMOSOME_LENGTHS[chromName];
      const chromSegments = segments.filter(s => s.chromosome === chromName);

      const processedSegments: SegmentWithDisplay[] = chromSegments.map(seg => ({
        ...seg,
        left: (seg.start / chromLength) * 100,
        width: ((seg.end - seg.start) / chromLength) * 100,
        color: POPULATION_COLORS[seg.population] || '#6b7280',
      }));

      data.push({
        name: chromName,
        length: chromLength,
        segments: processedSegments,
      });
    }

    return data;
  }, [segments]);

  // Get unique populations for legend
  const populations = useMemo(() => {
    const popSet = new Set(segments.map(s => s.population));
    return Array.from(popSet);
  }, [segments]);

  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 2));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.8));
  const handleReset = () => setScale(1);

  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700', className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Chromosome Painting
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ancestry segments across your chromosomes
            </p>
          </div>
          
          {allowZoom && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-500 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                title="Reset zoom"
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Each bar represents a chromosome. Colors indicate ancestry from different populations. 
            The vertical line in the middle marks the centromere. Hover over segments for details.
          </p>
        </div>
      </div>

      {/* Chromosome Visualization */}
      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chromosome Bars */}
          <div className="lg:col-span-2 space-y-1 max-h-96 overflow-y-auto pr-2">
            {showChromosomeLabels && (
              <div className="flex items-center gap-3 pb-2 text-xs text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <div className="w-8 text-center">Chr</div>
                <div className="flex-1 text-center">Ancestry Segments</div>
                <div className="w-12 text-right">Segs</div>
              </div>
            )}
            {chromosomeData.map((chrom) => (
              <ChromosomeBar
                key={chrom.name}
                chromosome={chrom}
                isActive={activeChromosome === chrom.name}
                onHover={(active) => setActiveChromosome(active ? chrom.name : null)}
                scale={scale}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PaintingLegend populations={populations as PopulationGroup[]} />
            <StatisticsPanel segments={segments} />
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Total segments:</span>
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">
              {segments.length.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Populations detected:</span>
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">
              {populations.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Avg confidence:</span>
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">
              {(segments.reduce((acc, s) => acc + s.confidence, 0) / segments.length * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for summary views
 */
export function ChromosomePaintingCompact({
  segments,
  className,
}: Pick<ChromosomePaintingProps, 'segments' | 'className'>) {
  // Show only chromosomes 1-5 and X for compact view
  const compactChromosomes = ['1', '2', '3', '4', '5', 'X'];
  
  const chromosomeData = useMemo(() => {
    return compactChromosomes.map(chromName => {
      const chromLength = CHROMOSOME_LENGTHS[chromName];
      const chromSegments = segments.filter(s => s.chromosome === chromName);
      
      return {
        name: chromName,
        segments: chromSegments.map(seg => ({
          left: (seg.start / chromLength) * 100,
          width: ((seg.end - seg.start) / chromLength) * 100,
          color: POPULATION_COLORS[seg.population] || '#6b7280',
          population: seg.population,
        })),
      };
    });
  }, [segments]);

  return (
    <div className={cn('space-y-2', className)}>
      {chromosomeData.map((chrom) => (
        <div key={chrom.name} className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 w-4">{chrom.name}</span>
          <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            {chrom.segments.slice(0, 5).map((seg, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${seg.left}%`,
                  width: `${Math.max(seg.width, 1)}%`,
                  backgroundColor: seg.color,
                }}
                title={seg.population}
              />
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-400 text-center">Showing chromosomes 1-5, X</p>
    </div>
  );
}

export default ChromosomePainting;
