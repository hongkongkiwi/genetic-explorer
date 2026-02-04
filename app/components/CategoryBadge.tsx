import { cn } from '~/utils/shared/cn';
import type { VariantCategory } from '~/types/genetics';

interface CategoryBadgeProps {
  category: VariantCategory;
  size?: 'sm' | 'md' | 'lg';
}

const categoryConfig: Record<VariantCategory, { label: string; icon: string; color: string }> = {
  drug_metabolism: { label: 'Drug Metabolism', icon: '💊', color: 'bg-purple-500/20 text-purple-700 border-purple-500/30 dark:text-purple-400' },
  methylation: { label: 'Methylation', icon: '🧬', color: 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400' },
  nutrition: { label: 'Nutrition', icon: '🥗', color: 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400' },
  fitness: { label: 'Fitness', icon: '💪', color: 'bg-orange-500/20 text-orange-700 border-orange-500/30 dark:text-orange-400' },
  cardiovascular: { label: 'Cardiovascular', icon: '❤️', color: 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400' },
  sleep: { label: 'Sleep', icon: '😴', color: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30 dark:text-indigo-400' },
  disease_risk: { label: 'Disease Risk', icon: '⚠️', color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400' },
  carrier_status: { label: 'Carrier Status', icon: '🧪', color: 'bg-pink-500/20 text-pink-700 border-pink-500/30 dark:text-pink-400' },
  immune: { label: 'Immune', icon: '🛡️', color: 'bg-teal-500/20 text-teal-700 border-teal-500/30 dark:text-teal-400' },
  cognitive: { label: 'Cognitive', icon: '🧠', color: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30 dark:text-cyan-400' },
  longevity: { label: 'Longevity', icon: '⏳', color: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:text-emerald-400' },
  'Mental Health': { label: 'Mental Health', icon: '🧠', color: 'bg-violet-500/20 text-violet-700 border-violet-500/30 dark:text-violet-400' },
  'Drug Metabolism': { label: 'Drug Metabolism', icon: '💊', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'Methylation': { label: 'Methylation', icon: '🧬', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'Cardiovascular': { label: 'Cardiovascular', icon: '❤️', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'Nutrition': { label: 'Nutrition', icon: '🥗', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'Fitness': { label: 'Fitness', icon: '💪', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'Immune System': { label: 'Immune System', icon: '🛡️', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  'Disease Risk': { label: 'Disease Risk', icon: '⚠️', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'Hormonal': { label: 'Hormonal', icon: '⚡', color: 'bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-400' },
};

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      config.color,
      sizeClasses[size]
    )}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
