/**
 * ChromosomeLegend Component
 * 
 * Provides a comprehensive legend for the chromosome browser visualization.
 * Includes color coding explanations, chromosome size references, and navigation help.
 */

import { useState } from 'react';
import { 
  Info, 
  X, 
  ChevronDown, 
  ChevronUp,
  MousePointer2,
  Hand,
  Maximize,
  Dna,
  Layers
} from 'lucide-react';
import { cn } from '~/utils/cn';
import { 
  SNP_CATEGORIES, 
  STAIN_COLORS, 
  type CytogeneticBand,
  formatBasePairs,
  getTotalGenomeSize,
  CHROMOSOME_LENGTHS 
} from '~/data/chromosomeData';

interface ChromosomeLegendProps {
  className?: string;
  isDark?: boolean;
  compact?: boolean;
  onClose?: () => void;
}

export function ChromosomeLegend({
  className,
  isDark = false,
  compact = false,
  onClose,
}: ChromosomeLegendProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'navigation'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  const categoryItems = Object.entries(SNP_CATEGORIES).filter(
    ([key]) => key !== 'Unknown'
  );

  const stainPatterns: { stain: CytogeneticBand['stain']; label: string; description: string }[] = [
    { stain: 'gneg', label: 'Light (AT-rich)', description: 'Gene-poor regions' },
    { stain: 'gpos25', label: 'Light Gray', description: 'Low gene density' },
    { stain: 'gpos50', label: 'Medium Gray', description: 'Moderate gene density' },
    { stain: 'gpos75', label: 'Dark Gray', description: 'High gene density' },
    { stain: 'gpos100', label: 'Dark (GC-rich)', description: 'Gene-dense regions' },
    { stain: 'acen', label: 'Centromere', description: 'Chromosome constriction' },
  ];

  const sizeReferences = [
    { label: 'Chr 1 (Largest)', length: CHROMOSOME_LENGTHS['1'], percent: 8 },
    { label: 'Chr 21 (Small)', length: CHROMOSOME_LENGTHS['21'], percent: 1.5 },
    { label: 'Chr X', length: CHROMOSOME_LENGTHS['X'], percent: 5 },
    { label: 'Total Genome', length: getTotalGenomeSize(), percent: 100 },
  ];

  if (compact) {
    return (
      <div className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3',
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            Legend
          </span>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryItems.slice(0, 4).map(([key, config]) => (
            <div 
              key={key}
              className="flex items-center gap-1.5 text-xs"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-slate-600 dark:text-slate-400">{config.icon}</span>
            </div>
          ))}
          {categoryItems.length > 4 && (
            <span className="text-xs text-slate-400">+{categoryItems.length - 4} more</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden',
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Legend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Understanding the visualization
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <Section
          title="SNP Categories"
          icon={<Dna className="w-4 h-4" />}
          isExpanded={isExpanded('categories')}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-2">
            {categoryItems.map(([key, config]) => (
              <div key={key} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {config.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Cytogenetic Bands"
          icon={<Layers className="w-4 h-4" />}
          isExpanded={isExpanded('bands')}
          onToggle={() => toggleSection('bands')}
        >
          <div className="space-y-2">
            {stainPatterns.map(({ stain, label, description }) => (
              <div key={stain} className="flex items-center gap-3">
                <div 
                  className="w-8 h-5 rounded border border-slate-300 dark:border-slate-600"
                  style={{ backgroundColor: STAIN_COLORS[stain] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Chromosome Sizes"
          icon={<Maximize className="w-4 h-4" />}
          isExpanded={isExpanded('sizes')}
          onToggle={() => toggleSection('sizes')}
        >
          <div className="space-y-3">
            {sizeReferences.map(({ label, length, percent }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{label}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatBasePairs(length)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Navigation"
          icon={<MousePointer2 className="w-4 h-4" />}
          isExpanded={isExpanded('navigation')}
          onToggle={() => toggleSection('navigation')}
        >
          <div className="space-y-2">
            <NavigationItem
              icon={<span className="text-lg">🔍</span>}
              title="Zoom"
              description="Scroll wheel or pinch to zoom in/out"
            />
            <NavigationItem
              icon={<Hand className="w-4 h-4" />}
              title="Pan"
              description="Click and drag to pan when zoomed in"
            />
            <NavigationItem
              icon={<MousePointer2 className="w-4 h-4" />}
              title="Select"
              description="Click a chromosome to view details"
            />
            <NavigationItem
              icon={<Dna className="w-4 h-4" />}
              title="SNPs"
              description="Click colored dots for variant details"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-slate-500">{icon}</div>
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}

function NavigationItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </div>
      </div>
    </div>
  );
}

export function MiniLegend({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const previewColors = Object.values(SNP_CATEGORIES)
    .filter((_, i) => i < 5)
    .map((c) => c.color);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        'hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
        className
      )}
    >
      <div className="flex -space-x-1">
        {previewColors.map((color, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
        Legend
      </span>
    </button>
  );
}

export default ChromosomeLegend;
