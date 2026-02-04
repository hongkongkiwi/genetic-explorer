/**
 * EthnicityChart Component
 * 
 * Interactive pie/donut chart showing ethnicity composition with
 * hover tooltips, legend, and confidence indicators.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from 'recharts';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { PopulationEstimate, ConfidenceLevel } from '~/types/ancestry';

interface EthnicityChartProps {
  populations: PopulationEstimate[];
  className?: string;
  variant?: 'pie' | 'donut' | 'bar';
  showConfidence?: boolean;
  showSubPopulations?: boolean;
}

// Color palette for population groups
const POPULATION_COLORS: Record<string, string> = {
  'European': '#3b82f6',      // blue-500
  'African': '#8b5cf6',       // violet-500
  'East Asian': '#ef4444',    // red-500
  'South Asian': '#f97316',   // orange-500
  'Native American': '#22c55e', // green-500
  'Middle Eastern': '#eab308', // yellow-500
  'Oceanian': '#06b6d4',      // cyan-500
  'Central Asian': '#ec4899', // pink-500
  'Southeast Asian': '#14b8a6', // teal-500
};

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  'high': 'bg-green-500',
  'medium': 'bg-yellow-500',
  'low': 'bg-orange-500',
  'very_low': 'bg-red-500',
};

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  'high': 'High Confidence',
  'medium': 'Medium Confidence',
  'low': 'Low Confidence',
  'very_low': 'Very Low Confidence',
};

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  confidence: ConfidenceLevel;
  population: PopulationEstimate;
}

/**
 * Custom Tooltip for the chart
 */
function CustomTooltip({ 
  active, 
  payload 
}: { 
  active?: boolean; 
  payload?: Array<{ payload: ChartDataItem }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
          {data.value.toFixed(1)}%
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={cn('w-2 h-2 rounded-full', CONFIDENCE_COLORS[data.confidence])} />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {CONFIDENCE_LABELS[data.confidence]}
          </span>
        </div>
        {data.population.region && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Region: {data.population.region}
          </p>
        )}
      </div>
    );
  }
  return null;
}

/**
 * Population Legend Item
 */
function LegendItem({ 
  data, 
  isActive, 
  onClick 
}: { 
  data: ChartDataItem; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-3 rounded-lg transition-all',
        isActive 
          ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-indigo-500' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <div className="text-left">
          <p className="font-medium text-slate-900 dark:text-white text-sm">
            {data.name}
          </p>
          <div className="flex items-center gap-2">
            <span className={cn('w-1.5 h-1.5 rounded-full', CONFIDENCE_COLORS[data.confidence])} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {CONFIDENCE_LABELS[data.confidence].split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
      <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
        {data.value.toFixed(1)}%
      </span>
    </button>
  );
}

/**
 * Sub-population breakdown
 */
function SubPopulationBreakdown({ 
  population 
}: { 
  population: PopulationEstimate;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!population.subPopulations || population.subPopulations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pl-7">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-400 hover:text-indigo-800"
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {isExpanded ? 'Hide' : 'Show'} sub-regions
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {population.subPopulations.map((sub, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between text-sm pl-2"
                >
                  <div>
                    <span className="text-slate-700 dark:text-slate-300">{sub.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
                      ({sub.region})
                    </span>
                  </div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {sub.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Main EthnicityChart Component
 */
export function EthnicityChart({
  populations,
  className,
  variant = 'donut',
  showConfidence = true,
  showSubPopulations = true,
}: EthnicityChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Prepare chart data
  const chartData: ChartDataItem[] = useMemo(() => {
    return populations
      .sort((a, b) => b.percentage - a.percentage)
      .map((pop) => ({
        name: pop.population,
        value: pop.percentage,
        color: POPULATION_COLORS[pop.population] || '#6b7280',
        confidence: pop.confidence,
        population: pop,
      }));
  }, [populations]);

  // Calculate total for validation
  const totalPercentage = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const handleLegendClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const activePopulation = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ethnicity Estimate
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Based on {populations.length} population references
          </p>
        </div>
        {showConfidence && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4" />
            <span>Confidence indicators shown</span>
          </div>
        )}
      </div>

      {/* Chart and Legend Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="relative h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={variant === 'donut' ? 60 : 0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => {
                  setHoveredSegment(chartData[index]?.name);
                  setActiveIndex(index);
                }}
                onMouseLeave={() => {
                  setHoveredSegment(null);
                  if (activeIndex !== null && !activePopulation) {
                    setActiveIndex(null);
                  }
                }}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={activeIndex === index ? '#1e293b' : 'transparent'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{
                      filter: hoveredSegment && hoveredSegment !== entry.name 
                        ? 'opacity(0.5)' 
                        : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center label for donut chart */}
          {variant === 'donut' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                {activePopulation ? (
                  <>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {activePopulation.value.toFixed(1)}%
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activePopulation.name}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {totalPercentage.toFixed(0)}%
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Population Breakdown
          </h4>
          <div className="space-y-2 max-h-64 lg:max-h-80 overflow-y-auto pr-2">
            {chartData.map((item, index) => (
              <div key={item.name}>
                <LegendItem
                  data={item}
                  isActive={activeIndex === index}
                  onClick={() => handleLegendClick(index)}
                />
                {showSubPopulations && activeIndex === index && (
                  <SubPopulationBreakdown population={item.population} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Legend */}
      {showConfidence && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Confidence levels:</span>
            {(Object.keys(CONFIDENCE_COLORS) as ConfidenceLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', CONFIDENCE_COLORS[level])} />
                <span className="text-slate-600 dark:text-slate-400">
                  {CONFIDENCE_LABELS[level].split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for summary views
 */
export function EthnicityChartCompact({
  populations,
  className,
}: Pick<EthnicityChartProps, 'populations' | 'className'>) {
  const topPopulations = useMemo(() => {
    return populations
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [populations]);

  return (
    <div className={cn('space-y-3', className)}>
      {topPopulations.map((pop, index) => (
        <div key={pop.population} className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: POPULATION_COLORS[pop.population] || '#6b7280' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                {pop.population}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {pop.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pop.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: POPULATION_COLORS[pop.population] || '#6b7280' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EthnicityChart;
