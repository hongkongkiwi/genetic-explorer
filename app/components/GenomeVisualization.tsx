import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Interactive Chromosome Map Component
// ============================================================================

interface ChromosomeData {
  name: string;
  length: number;
  snpCount: number;
  variants: VariantData[];
}

interface VariantData {
  position: number;
  rsid: string;
  genotype: string;
  significance: 'pathogenic' | 'benign' | 'unknown';
}

interface GenomeVisualizerProps {
  chromosomes: ChromosomeData[];
  onVariantClick?: (variant: VariantData, chromosome: string) => void;
  className?: string;
}

export function GenomeVisualizer({
  chromosomes,
  onVariantClick,
  className = '',
}: GenomeVisualizerProps) {
  const [selectedChr, setSelectedChr] = useState<string>('1');
  const [hoveredVariant, setHoveredVariant] = useState<VariantData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const selectedChromosome = chromosomes.find((c) => c.name === selectedChr);

  // Color mapping for significance
  const getVariantColor = (significance: VariantData['significance']) => {
    switch (significance) {
      case 'pathogenic':
        return '#ef4444';
      case 'benign':
        return '#22c55e';
      default:
        return '#94a3b8';
    }
  };

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.max(0.5, Math.min(3, z + delta)));
    }
  }, []);

  return (
    <div className={`bg-slate-900/50 rounded-xl overflow-hidden ${className}`}>
      {/* Chromosome selector */}
      <div className="flex gap-1 p-2 overflow-x-auto bg-slate-800/50 border-b border-slate-700">
        {chromosomes.map((chr) => (
          <button
            key={chr.name}
            onClick={() => {
              setSelectedChr(chr.name);
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedChr === chr.name
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {chr.name}
          </button>
        ))}
      </div>

      {/* Visualization area */}
      <div
        className="relative overflow-hidden"
        style={{ height: '300px' }}
        onWheel={handleWheel}
      >
        {/* Chromosome representation */}
        {selectedChromosome && (
          <div
            className="absolute inset-4 flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* Chromosome body */}
            <div className="relative w-8 h-full rounded-full bg-gradient-to-b from-slate-600 via-slate-500 to-slate-600 shadow-lg">
              {/* Centromere constriction */}
              <div className="absolute top-1/2 left-0 right-0 h-3 bg-slate-900 transform -translate-y-1/2" />

              {/* Variant markers */}
              <div className="absolute inset-0">
                {selectedChromosome.variants.slice(0, 100).map((variant, i) => {
                  const yPercent = variant.position / selectedChromosome.length;
                  const yPos = yPercent * 100;

                  return (
                    <div
                      key={variant.rsid}
                      className="absolute left-0 right-0 h-0.5"
                      style={{ top: `${yPos}%` }}
                    >
                      <div
                        className="absolute left-full ml-2 w-2 h-2 rounded-full cursor-pointer transform -translate-y-1/2 hover:scale-150 transition-transform"
                        style={{
                          backgroundColor: getVariantColor(variant.significance),
                        }}
                        onMouseEnter={() => setHoveredVariant(variant)}
                        onMouseLeave={() => setHoveredVariant(null)}
                        onClick={() => onVariantClick?.(variant, selectedChr)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        )}

        {/* Hover tooltip */}
        {hoveredVariant && selectedChromosome && (
          <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl z-10">
            <div className="text-sm font-medium text-white">{hoveredVariant.rsid}</div>
            <div className="text-xs text-slate-400">
              Position: {hoveredVariant.position.toLocaleString()} bp
            </div>
            <div className="text-xs text-slate-400">Genotype: {hoveredVariant.genotype}</div>
            <div
              className="text-xs mt-1"
              style={{ color: getVariantColor(hoveredVariant.significance) }}
            >
              {hoveredVariant.significance}
            </div>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        {/* Chromosome info */}
        {selectedChromosome && (
          <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur rounded-lg px-3 py-2">
            <div className="text-sm font-medium text-white">Chromosome {selectedChr}</div>
            <div className="text-xs text-slate-400">
              {selectedChromosome.snpCount.toLocaleString()} variants
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose';
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'indigo',
}: StatsCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border p-4 transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-white/10 rounded-lg text-white">{icon}</div>
        )}
      </div>

      {/* Decorative gradient */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
    </div>
  );
}

// ============================================================================
// Progress Ring Component
// ============================================================================

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#6366f1',
  label,
  showValue = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 4px ${color}40)`,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
          {label && <span className="text-xs text-slate-400">{label}</span>}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Animated Counter Component
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  formatter = (v) => v.toLocaleString(),
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * value);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
}

export default GenomeVisualizer;
