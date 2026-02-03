/**
 * ChromosomeVisualizer Component
 * 
 * Detailed visualization of a single chromosome with:
 * - Cytogenetic banding pattern (G-banding)
 * - SNP positions marked with category colors
 * - Gene regions highlighted
 * - Interactive hover and click for details
 * - Zoom controls and position ruler
 */

import { useState, useRef, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  Info,
  Dna,
  Target,
  X,
} from 'lucide-react';
import { cn } from '~/utils/cn';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import type { SNPInfo } from '~/types/genetics';
import type { ChromosomeInfo, CytogeneticBand } from '~/data/chromosomeData';
import {
  getChromosome,
  formatBasePairs,
  getBandForPosition,
  getCytogeneticPosition,
  getStainColor,
  getCategoryColor,
  positionToPercent,
  STAIN_COLORS,
} from '~/data/chromosomeData';

// ============================================================================
// Types
// ============================================================================

interface ChromosomeVisualizerProps {
  /** Chromosome name (1-22, X) */
  chromosome: string;
  /** User's SNPs to display */
  snps?: Array<{
    rsid: string;
    position: number;
    genotype: string;
    category?: string;
    gene?: string;
    impact?: string;
  }>;
  /** Available SNP info from database */
  snpDatabase?: Record<string, SNPInfo>;
  /** Callback when SNP is clicked */
  onSNPClick?: (rsid: string) => void;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Initial zoom level */
  initialZoom?: number;
  /** Initial visible region (start, end) */
  initialRegion?: { start: number; end: number };
}

interface TooltipData {
  x: number;
  y: number;
  content: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

export function ChromosomeVisualizer({
  chromosome,
  snps = [],
  snpDatabase = {},
  onSNPClick,
  onBack,
  className,
  isDark = false,
  initialZoom = 1,
  initialRegion,
}: ChromosomeVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [selectedSNP, setSelectedSNP] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showGenes, setShowGenes] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const chrInfo = useMemo(() => getChromosome(chromosome), [chromosome]);

  // Calculate visible region based on zoom and pan
  const visibleRegion = useMemo(() => {
    if (!chrInfo) return { start: 0, end: 0 };
    
    if (initialRegion && zoom === 1 && pan.x === 0) {
      return initialRegion;
    }
    
    const viewWidth = chrInfo.length / zoom;
    const offset = (-pan.x / 1000) * viewWidth; // Convert pan to base pairs
    
    let start = Math.max(0, offset);
    let end = Math.min(chrInfo.length, start + viewWidth);
    
    // Adjust if we're at the edges
    if (end >= chrInfo.length) {
      end = chrInfo.length;
      start = Math.max(0, end - viewWidth);
    }
    
    return { start: Math.floor(start), end: Math.ceil(end) };
  }, [chrInfo, zoom, pan, initialRegion]);

  // Filter SNPs by visible region and category
  const visibleSNPs = useMemo(() => {
    return snps.filter((snp) => {
      const inRegion = snp.position >= visibleRegion.start && snp.position <= visibleRegion.end;
      const inCategory = categoryFilter.length === 0 || 
        (snp.category && categoryFilter.includes(snp.category));
      return inRegion && inCategory;
    });
  }, [snps, visibleRegion, categoryFilter]);

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    snps.forEach((snp) => {
      if (snp.category) categories.add(snp.category);
    });
    return Array.from(categories);
  }, [snps]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.5, 50));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const newZoom = Math.max(z / 1.5, 1);
      if (newZoom === 1) {
        setPan({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      // Limit pan
      const maxPan = 0;
      const minPan = -(zoom - 1) * 1000;
      const clampedX = Math.max(minPan, Math.min(maxPan, newX));
      setPan({ x: clampedX, y: 0 });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  }, [handleZoomIn, handleZoomOut]);

  // SNP click handler
  const handleSNPClick = useCallback((rsid: string) => {
    setSelectedSNP(rsid);
    onSNPClick?.(rsid);
  }, [onSNPClick]);

  // Tooltip handlers
  const showTooltip = useCallback((e: React.MouseEvent, content: React.ReactNode) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: e.clientX - rect.left + 10,
        y: e.clientY - rect.top - 10,
        content,
      });
    }
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  if (!chrInfo) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Chromosome {chromosome} not found</p>
      </div>
    );
  }

  const svgWidth = 1000;
  const svgHeight = 400;
  const chromosomeY = 150;
  const chromosomeWidth = 60;
  const scale = svgWidth / (visibleRegion.end - visibleRegion.start || 1);

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Chromosome {chromosome}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {formatBasePairs(chrInfo.length)} • {chrInfo.bands.length} bands
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 1}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono w-16 text-center text-slate-700 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 50}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={zoom === 1}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Toggle buttons */}
          <Button
            variant={showLabels ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
          >
            Labels
          </Button>
          <Button
            variant={showGenes ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGenes(!showGenes)}
          >
            Genes
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setCategoryFilter((prev) =>
                    prev.includes(category)
                      ? prev.filter((c) => c !== category)
                      : [...prev, category]
                  );
                }}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  categoryFilter.includes(category)
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                )}
              >
                {category}
              </button>
            ))}
            {categoryFilter.length > 0 && (
              <button
                onClick={() => setCategoryFilter([])}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main visualization area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
      >
        {/* SVG Visualization */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Define gradients */}
            <linearGradient id="chromosomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
              <stop offset="50%" stopColor={isDark ? '#334155' : '#f1f5f9'} />
              <stop offset="100%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
            </linearGradient>
            
            {/* Centromere gradient */}
            <radialGradient id="centromereGradient">
              <stop offset="0%" stopColor={isDark ? '#ef4444' : '#dc2626'} />
              <stop offset="100%" stopColor={isDark ? '#b91c1c' : '#991b1b'} />
            </radialGradient>
          </defs>

          {/* Ruler */}
          <g transform={`translate(0, 30)`}>
            <line
              x1={50}
              y1={0}
              x2={svgWidth - 50}
              y2={0}
              stroke={isDark ? '#475569' : '#94a3b8'}
              strokeWidth={1}
            />
            {Array.from({ length: 11 }, (_, i) => {
              const x = 50 + (i / 10) * (svgWidth - 100);
              const position = visibleRegion.start + (i / 10) * (visibleRegion.end - visibleRegion.start);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={-5}
                    x2={x}
                    y2={5}
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={-10}
                    textAnchor="middle"
                    className="text-xs fill-slate-500 dark:fill-slate-400"
                    style={{ fontSize: '10px' }}
                  >
                    {formatBasePairs(position)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Chromosome body */}
          <g transform={`translate(0, ${chromosomeY})`}>
            {/* Calculate centromere position in SVG coordinates */}
            {(() => {
              const centromereX = 50 + ((chrInfo.centromere - visibleRegion.start) * (svgWidth - 100)) / 
                (visibleRegion.end - visibleRegion.start);
              const chrHeight = 120;
              const pArmWidth = centromereX - 50;
              const qArmWidth = svgWidth - 50 - centromereX;

              return (
                <>
                  {/* Render cytogenetic bands */}
                  {chrInfo.bands.map((band, i) => {
                    // Skip if band is outside visible region
                    if (band.end < visibleRegion.start || band.start > visibleRegion.end) {
                      return null;
                    }

                    const startX = 50 + ((band.start - visibleRegion.start) * (svgWidth - 100)) / 
                      (visibleRegion.end - visibleRegion.start);
                    const endX = 50 + ((band.end - visibleRegion.start) * (svgWidth - 100)) / 
                      (visibleRegion.end - visibleRegion.start);
                    const width = Math.max(endX - startX, 1);

                    const isCentromere = band.stain === 'acen';
                    const color = getStainColor(band.stain, isDark);

                    if (isCentromere) {
                      // Draw centromere as constriction
                      return (
                        <g key={i}>
                          <ellipse
                            cx={startX + width / 2}
                            cy={chrHeight / 2}
                            rx={width / 2}
                            ry={chrHeight / 2 - 10}
                            fill="url(#centromereGradient)"
                          />
                        </g>
                      );
                    }

                    return (
                      <rect
                        key={i}
                        x={startX}
                        y={0}
                        width={width}
                        height={chrHeight}
                        fill={color}
                        stroke={isDark ? '#334155' : '#cbd5e1'}
                        strokeWidth={0.5}
                      />
                    );
                  })}

                  {/* Chromosome outline */}
                  <rect
                    x={50}
                    y={0}
                    width={svgWidth - 100}
                    height={chrHeight}
                    fill="none"
                    stroke={isDark ? '#64748b' : '#64748b'}
                    strokeWidth={2}
                    rx={10}
                  />

                  {/* SNP markers */}
                  {visibleSNPs.map((snp) => {
                    const x = 50 + ((snp.position - visibleRegion.start) * (svgWidth - 100)) / 
                      (visibleRegion.end - visibleRegion.start);
                    const isSelected = selectedSNP === snp.rsid;
                    const color = getCategoryColor(snp.category || 'Unknown');
                    const snpInfo = snpDatabase[snp.rsid];

                    return (
                      <g key={snp.rsid}>
                        {/* Position marker line */}
                        <line
                          x1={x}
                          y1={-20}
                          x2={x}
                          y2={chrHeight + 20}
                          stroke={color}
                          strokeWidth={isSelected ? 3 : 1}
                          strokeDasharray="4,2"
                          opacity={0.5}
                        />
                        
                        {/* SNP dot */}
                        <circle
                          cx={x}
                          cy={chrHeight / 2}
                          r={isSelected ? 10 : 6}
                          fill={color}
                          stroke={isDark ? '#1e293b' : '#ffffff'}
                          strokeWidth={2}
                          className="cursor-pointer transition-all hover:r-8"
                          onClick={() => handleSNPClick(snp.rsid)}
                          onMouseEnter={(e) => {
                            showTooltip(e as any, (
                              <SNPTooltipContent snp={snp} snpInfo={snpInfo} />
                            ));
                          }}
                          onMouseLeave={hideTooltip}
                        />

                        {/* Label */}
                        {showLabels && zoom >= 5 && (
                          <text
                            x={x}
                            y={chrHeight + 40}
                            textAnchor="middle"
                            className="text-xs fill-slate-700 dark:fill-slate-300"
                            style={{ fontSize: '9px' }}
                          >
                            {snp.rsid}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Gene labels */}
                  {showGenes && zoom >= 10 && visibleSNPs.filter(s => s.gene).map((snp) => {
                    const x = 50 + ((snp.position - visibleRegion.start) * (svgWidth - 100)) / 
                      (visibleRegion.end - visibleRegion.start);
                    
                    return (
                      <text
                        key={`gene-${snp.rsid}`}
                        x={x}
                        y={-30}
                        textAnchor="middle"
                        className="text-xs fill-indigo-600 dark:fill-indigo-400 font-medium"
                        style={{ fontSize: '10px' }}
                      >
                        {snp.gene}
                      </text>
                    );
                  })}
                </>
              );
            })()}
          </g>

          {/* Position indicator */}
          <g transform={`translate(0, ${svgHeight - 40})`}>
            <text
              x={svgWidth / 2}
              y={0}
              textAnchor="middle"
              className="text-sm fill-slate-600 dark:fill-slate-400"
            >
              Showing {formatBasePairs(visibleRegion.start)} - {formatBasePairs(visibleRegion.end)}
              {' '}({formatBasePairs(visibleRegion.end - visibleRegion.start)})
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}

        {/* SNP Details Panel */}
        {selectedSNP && (
          <SNPDetailPanel
            rsid={selectedSNP}
            snp={visibleSNPs.find(s => s.rsid === selectedSNP)}
            snpInfo={snpDatabase[selectedSNP]}
            onClose={() => setSelectedSNP(null)}
            isDark={isDark}
          />
        )}
      </div>

      {/* Info bar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            <Dna className="w-3 h-3 inline mr-1" />
            {snps.length} SNPs on Chr {chromosome}
          </span>
          <span>
            <Target className="w-3 h-3 inline mr-1" />
            {visibleSNPs.length} visible
          </span>
        </div>
        <span>
          {isDragging ? 'Dragging...' : zoom > 1 ? 'Drag to pan' : 'Scroll + Ctrl to zoom'}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * SNP Tooltip Content
 */
function SNPTooltipContent({
  snp,
  snpInfo,
}: {
  snp: { rsid: string; position: number; genotype: string; category?: string; gene?: string };
  snpInfo?: SNPInfo;
}) {
  return (
    <div className="space-y-1 min-w-[200px]">
      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        {snp.rsid}
        <span 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getCategoryColor(snp.category || 'Unknown') }}
        />
      </div>
      {snp.gene && (
        <div className="text-sm text-indigo-600 dark:text-indigo-400">
          Gene: {snp.gene}
        </div>
      )}
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Position: {snp.position.toLocaleString()}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Genotype: <span className="font-mono font-medium">{snp.genotype}</span>
      </div>
      {snp.category && (
        <div className="text-xs text-slate-600 dark:text-slate-500">
          Category: {snp.category}
        </div>
      )}
      {snpInfo?.impact && (
        <div className="text-xs">
          Impact: <span className={getImpactColorClass(snpInfo.impact)}>{snpInfo.impact}</span>
        </div>
      )}
      {snpInfo?.description && (
        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 line-clamp-2">
          {snpInfo.description}
        </div>
      )}
    </div>
  );
}

/**
 * SNP Detail Panel
 */
function SNPDetailPanel({
  rsid,
  snp,
  snpInfo,
  onClose,
  isDark,
}: {
  rsid: string;
  snp?: { rsid: string; position: number; genotype: string; category?: string; gene?: string; impact?: string };
  snpInfo?: SNPInfo;
  onClose: () => void;
  isDark: boolean;
}) {
  if (!snp) return null;

  return (
    <div className="absolute right-4 top-4 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-40">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {rsid}
          <a
            href={`https://www.ncbi.nlm.nih.gov/snp/${rsid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs"
          >
            dbSNP ↗
          </a>
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          {snp.gene && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Gene</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{snp.gene}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Position</span>
            <span className="text-sm font-mono text-slate-900 dark:text-white">
              {snp.position.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Genotype</span>
            <Badge variant="default" size="sm" className="font-mono">
              {snp.genotype}
            </Badge>
          </div>
          {snp.category && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
              <span className="text-sm text-slate-900 dark:text-white">{snp.category}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {snpInfo?.description && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Description</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {snpInfo.description}
            </p>
          </div>
        )}

        {/* Impact */}
        {snpInfo?.impact && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Impact</h4>
            <Badge variant={getImpactVariant(snpInfo.impact)} size="sm">
              {snpInfo.impact}
            </Badge>
          </div>
        )}

        {/* Conditions */}
        {snpInfo?.conditions && snpInfo.conditions.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Related Conditions</h4>
            <div className="flex flex-wrap gap-1">
              {snpInfo.conditions.map((condition) => (
                <Badge key={condition} variant="warning" size="sm">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {snpInfo?.recommendations && snpInfo.recommendations.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Recommendations</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {snpInfo.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getImpactColorClass(impact: string): string {
  switch (impact.toLowerCase()) {
    case 'very high':
    case 'high':
      return 'text-red-600 dark:text-red-400 font-medium';
    case 'moderate':
      return 'text-amber-700 dark:text-amber-400';
    case 'low':
      return 'text-blue-700 dark:text-blue-400';
    case 'protective':
      return 'text-emerald-700 dark:text-emerald-400';
    default:
      return 'text-slate-600 dark:text-slate-400';
  }
}

function getImpactVariant(impact: string): 'default' | 'error' | 'warning' | 'success' | 'info' {
  switch (impact.toLowerCase()) {
    case 'very high':
    case 'high':
      return 'error';
    case 'moderate':
      return 'warning';
    case 'low':
      return 'info';
    case 'protective':
      return 'success';
    default:
      return 'default';
  }
}

export default ChromosomeVisualizer;
