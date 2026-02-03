/**
 * ChromosomeBrowser Component
 * 
 * Interactive chromosome browser visualization featuring:
 * - Overview of all 23 chromosomes (1-22 + X)
 * - Zoom and pan functionality
 * - SNPs displayed as colored position markers
 * - Color-coding by category (health, ancestry, traits, etc.)
 * - Click to zoom into chromosome
 * - Gene names when zoomed in
 * - rsid labels for significant SNPs
 * - Legend for colors
 * - Export view as image
 * - Compare mode (show two genomes side by side)
 */

import { 
  useState, 
  useRef, 
  useMemo, 
  useCallback,
  useEffect,
} from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  GitCompare,
  Target,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  EyeOff,
  Search,
  Share2,
  Settings,
  Dna,
  Filter,
} from 'lucide-react';
import { cn } from '~/utils/cn';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { ChromosomeVisualizer } from './ChromosomeVisualizer';
import { ChromosomeLegend, MiniLegend } from './ChromosomeLegend';
import type { SNPInfo } from '~/types/genetics';
import {
  CHROMOSOMES,
  getChromosome,
  formatBasePairs,
  getCategoryColor,
  getCategoryLabel,
  getCategoryIcon,
  getStainColor,
  positionToPercent,
  type CompareMode,
} from '~/data/chromosomeData';

// ============================================================================
// Types
// ============================================================================

interface UserSNP {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
  category?: string;
  gene?: string;
  impact?: string;
}

interface GenomeData {
  id: string;
  name: string;
  snps: UserSNP[];
  color?: string;
}

interface ChromosomeBrowserProps {
  /** Primary genome data */
  primaryGenome: GenomeData;
  /** Optional comparison genome for compare mode */
  comparisonGenome?: GenomeData;
  /** Available SNP database */
  snpDatabase?: Record<string, SNPInfo>;
  /** Callback when SNP is clicked */
  onSNPClick?: (rsid: string, genomeId: string) => void;
  /** Callback when view changes */
  onViewChange?: (chromosome: string | null, zoom: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether dark mode is active */
  isDark?: boolean;
  /** Default compare mode */
  defaultCompareMode?: CompareMode;
}

interface SNPTooltipData {
  x: number;
  y: number;
  snp: UserSNP;
  genomeName: string;
  snpInfo?: SNPInfo;
}

// ============================================================================
// Main Component
// ============================================================================

export function ChromosomeBrowser({
  primaryGenome,
  comparisonGenome,
  snpDatabase = {},
  onSNPClick,
  onViewChange,
  className,
  isDark = false,
  defaultCompareMode = 'single',
}: ChromosomeBrowserProps) {
  // State
  const [selectedChromosome, setSelectedChromosome] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [compareMode, setCompareMode] = useState<CompareMode>(defaultCompareMode);
  const [showLegend, setShowLegend] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<SNPTooltipData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedSNP, setHighlightedSNP] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Notify parent of view changes
  useEffect(() => {
    onViewChange?.(selectedChromosome, zoom);
  }, [selectedChromosome, zoom, onViewChange]);

  // Filter SNPs by category
  const filteredPrimarySNPs = useMemo(() => {
    if (categoryFilter.length === 0) return primaryGenome.snps;
    return primaryGenome.snps.filter((snp) => 
      snp.category && categoryFilter.includes(snp.category)
    );
  }, [primaryGenome.snps, categoryFilter]);

  const filteredComparisonSNPs = useMemo(() => {
    if (!comparisonGenome) return [];
    if (categoryFilter.length === 0) return comparisonGenome.snps;
    return comparisonGenome.snps.filter((snp) => 
      snp.category && categoryFilter.includes(snp.category)
    );
  }, [comparisonGenome, categoryFilter]);

  // Get unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    primaryGenome.snps.forEach((snp) => {
      if (snp.category) categories.add(snp.category);
    });
    return Array.from(categories).sort();
  }, [primaryGenome.snps]);

  // Search SNPs
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return primaryGenome.snps.filter(
      (snp) =>
        snp.rsid.toLowerCase().includes(query) ||
        snp.gene?.toLowerCase().includes(query) ||
        snp.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, primaryGenome.snps]);

  // Chromosome selection
  const handleChromosomeClick = useCallback((chromosome: string) => {
    setSelectedChromosome(chromosome);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleBackToOverview = useCallback(() => {
    setSelectedChromosome(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.3, 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const newZoom = Math.max(z / 1.3, 1);
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

  // Pan handlers for overview
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 && !selectedChromosome) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan, selectedChromosome]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPan({ x: newX, y: newY });
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

  // Export image
  const handleExport = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bbox = svg.getBoundingClientRect();
    canvas.width = bbox.width * 2;
    canvas.height = bbox.height * 2;

    const img = new Image();
    img.onload = () => {
      // Fill background
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `chromosome-browser-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
  }, [isDark]);

  // Toggle category filter
  const toggleCategory = useCallback((category: string) => {
    setCategoryFilter((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  // Calculate SNP density for overview
  const getSNPDensity = useCallback((chromosome: string) => {
    const snps = filteredPrimarySNPs.filter((s) => s.chromosome === chromosome);
    return snps.length;
  }, [filteredPrimarySNPs]);

  // Render detailed chromosome view
  if (selectedChromosome) {
    return (
      <div className={cn(
        'flex flex-col bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToOverview}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Overview
            </Button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Chromosome {selectedChromosome}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getSNPDensity(selectedChromosome)} SNPs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Chromosome Visualizer */}
        <div className="flex-1 p-4">
          {compareMode === 'compare' && comparisonGenome ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {primaryGenome.name}
                  </span>
                </div>
                <ChromosomeVisualizer
                  chromosome={selectedChromosome}
                  snps={filteredPrimarySNPs}
                  snpDatabase={snpDatabase}
                  onSNPClick={(rsid) => onSNPClick?.(rsid, primaryGenome.id)}
                  isDark={isDark}
                  className="h-[500px]"
                />
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {comparisonGenome.name}
                  </span>
                </div>
                <ChromosomeVisualizer
                  chromosome={selectedChromosome}
                  snps={filteredComparisonSNPs}
                  snpDatabase={snpDatabase}
                  onSNPClick={(rsid) => onSNPClick?.(rsid, comparisonGenome.id)}
                  isDark={isDark}
                  className="h-[500px]"
                />
              </div>
            </div>
          ) : (
            <ChromosomeVisualizer
              chromosome={selectedChromosome}
              snps={filteredPrimarySNPs}
              snpDatabase={snpDatabase}
              onSNPClick={(rsid) => onSNPClick?.(rsid, primaryGenome.id)}
              onBack={handleBackToOverview}
              isDark={isDark}
              className="h-full"
            />
          )}
        </div>
      </div>
    );
  }

  // Render overview of all chromosomes
  return (
    <div className={cn(
      'flex flex-col bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800',
      isFullscreen && 'fixed inset-0 z-50 rounded-none',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Chromosome Browser
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {primaryGenome.name} • {filteredPrimarySNPs.length} variants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search SNPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Compare mode toggle */}
          {comparisonGenome && (
            <Button
              variant={compareMode === 'compare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCompareMode(compareMode === 'compare' ? 'single' : 'compare')}
            >
              <GitCompare className="w-4 h-4 mr-1" />
              Compare
            </Button>
          )}

          {/* Legend toggle */}
          <MiniLegend onClick={() => setShowLegend(!showLegend)} />

          {/* Export */}
          <Button variant="ghost" size="sm" onClick={handleExport} aria-label="Export image">
            <Download className="w-4 h-4" />
          </Button>

          {/* Fullscreen */}
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
        {allCategories.slice(0, 6).map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={cn(
              'px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
              categoryFilter.includes(category)
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-300'
            )}
          >
            <span>{getCategoryIcon(category)}</span>
            {category}
          </button>
        ))}
        {allCategories.length > 6 && (
          <Badge variant="default" size="sm">
            +{allCategories.length - 6} more
          </Badge>
        )}
        {categoryFilter.length > 0 && (
          <button
            onClick={() => setCategoryFilter([])}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 ml-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chromosome Overview */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-auto p-6"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 1200 ${800 * zoom}`}
            className="w-full max-w-5xl mx-auto"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="chrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
                <stop offset="50%" stopColor={isDark ? '#334155' : '#f8fafc'} />
                <stop offset="100%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
              </linearGradient>
            </defs>

            {/* Title */}
            <text
              x={600}
              y={30}
              textAnchor="middle"
              className="text-lg font-bold fill-slate-900 dark:fill-white"
            >
              Human Karyotype Overview
            </text>

            {/* Render chromosomes */}
            {CHROMOSOMES.map((chr, index) => {
              const col = index % 2;
              const row = Math.floor(index / 2);
              const x = col === 0 ? 150 : 750;
              const y = 80 + row * 60;
              const density = getSNPDensity(chr.name);
              const hasSNPs = density > 0;

              // Calculate height based on relative size
              const maxLength = CHROMOSOMES[0].length;
              const height = 40 + (chr.length / maxLength) * 100;
              const width = 24;

              // Get SNPs for this chromosome
              const chrSNPs = filteredPrimarySNPs
                .filter((s) => s.chromosome === chr.name)
                .slice(0, 20); // Limit visible SNPs

              return (
                <g
                  key={chr.name}
                  className="cursor-pointer"
                  onClick={() => handleChromosomeClick(chr.name)}
                >
                  {/* Chromosome number label */}
                  <text
                    x={x - 30}
                    y={y + height / 2 + 4}
                    textAnchor="end"
                    className="text-sm font-bold fill-slate-700 dark:fill-slate-300"
                  >
                    {chr.name}
                  </text>

                  {/* Chromosome body */}
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={12}
                    fill="url(#chrGradient)"
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    strokeWidth={2}
                    className="hover:stroke-indigo-500 transition-colors"
                  />

                  {/* Centromere */}
                  <ellipse
                    cx={x + width / 2}
                    cy={y + (chr.centromere / chr.length) * height}
                    rx={width / 2 + 2}
                    ry={6}
                    fill={isDark ? '#ef4444' : '#dc2626'}
                  />

                  {/* SNP markers */}
                  {chrSNPs.map((snp, i) => {
                    const snpY = y + (snp.position / chr.length) * height;
                    const color = getCategoryColor(snp.category || 'Unknown');
                    const isHighlighted = highlightedSNP === snp.rsid;

                    return (
                      <g key={snp.rsid}>
                        <circle
                          cx={x + width / 2}
                          cy={snpY}
                          r={isHighlighted ? 6 : 4}
                          fill={color}
                          stroke={isDark ? '#1e293b' : '#ffffff'}
                          strokeWidth={1}
                          className="hover:r-6 transition-all"
                          onMouseEnter={(e) => {
                            setTooltip({
                              x: (e as any).clientX,
                              y: (e as any).clientY,
                              snp,
                              genomeName: primaryGenome.name,
                              snpInfo: snpDatabase[snp.rsid],
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                        {/* Label for significant SNPs */}
                        {showLabels && (snp.impact === 'High' || snp.impact === 'Very High') && (
                          <text
                            x={x + width + 8}
                            y={snpY + 3}
                            className="text-xs fill-slate-600 dark:fill-slate-400"
                          >
                            {snp.rsid}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* SNP count badge */}
                  {hasSNPs && (
                    <g transform={`translate(${x + width + 5}, ${y + 5})`}>
                      <rect
                        width={28}
                        height={16}
                        rx={8}
                        fill="#6366f1"
                      />
                      <text
                        x={14}
                        y={12}
                        textAnchor="middle"
                        className="text-xs font-medium fill-white"
                      >
                        {density}
                      </text>
                    </g>
                  )}

                  {/* Length label */}
                  <text
                    x={x + width / 2}
                    y={y + height + 15}
                    textAnchor="middle"
                    className="text-xs fill-slate-500 dark:fill-slate-500"
                  >
                    {formatBasePairs(chr.length)}
                  </text>
                </g>
              );
            })}

            {/* Bottom info */}
            <text
              x={600}
              y={780}
              textAnchor="middle"
              className="text-sm fill-slate-500 dark:fill-slate-400"
            >
              Click a chromosome to view details • {filteredPrimarySNPs.length} total variants
            </text>
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 pointer-events-none"
              style={{ 
                left: Math.min(tooltip.x + 10, window.innerWidth - 250), 
                top: Math.max(tooltip.y - 100, 10),
              }}
            >
              <div className="space-y-1 min-w-[200px]">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {tooltip.snp.rsid}
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(tooltip.snp.category || 'Unknown') }}
                  />
                </div>
                {tooltip.snp.gene && (
                  <div className="text-sm text-indigo-700 dark:text-indigo-400">
                    {tooltip.snp.gene}
                  </div>
                )}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Chr{tooltip.snp.chromosome}:{tooltip.snp.position.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Genotype: <span className="font-mono font-medium">{tooltip.snp.genotype}</span>
                </div>
                {tooltip.snp.category && (
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    {getCategoryIcon(tooltip.snp.category)} {tooltip.snp.category}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend sidebar */}
        {showLegend && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
            <ChromosomeLegend
              isDark={isDark}
              onClose={() => setShowLegend(false)}
            />
          </div>
        )}
      </div>

      {/* Search results overlay */}
      {searchQuery && searchResults.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 max-h-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-y-auto z-30">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {searchResults.length} results
            </span>
            <button onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {searchResults.slice(0, 10).map((snp) => (
              <button
                key={snp.rsid}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                onClick={() => {
                  handleChromosomeClick(snp.chromosome);
                  setHighlightedSNP(snp.rsid);
                  setSearchQuery('');
                }}
              >
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">{snp.rsid}</span>
                  {snp.gene && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                      {snp.gene}
                    </span>
                  )}
                </div>
                <Badge variant="default" size="sm">
                  Chr {snp.chromosome}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 1} aria-label="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono w-14 text-center text-slate-700 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 10} aria-label="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={zoom === 1} aria-label="Reset zoom">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className={showLabels ? 'text-indigo-600' : ''}
          >
            {showLabels ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
            Labels
          </Button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {isDragging ? 'Dragging...' : 'Scroll + Ctrl to zoom • Click chromosome for details'}
        </div>
      </div>
    </div>
  );
}

export default ChromosomeBrowser;
