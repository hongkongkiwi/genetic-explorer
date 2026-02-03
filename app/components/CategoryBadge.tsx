import { cn } from '~/utils/cn';
import type { VariantCategory } from '~/types/genetics';

interface CategoryBadgeProps {
  category: VariantCategory;
  size?: 'sm' | 'md' | 'lg';
}

const categoryConfig: Record<VariantCategory, { label: string; icon: string; color: string }> = {
  drug_metabolism: { label: 'Drug Metabolism', icon: '💊', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  methylation: { label: 'Methylation', icon: '🧬', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  nutrition: { label: 'Nutrition', icon: '🥗', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  fitness: { label: 'Fitness', icon: '💪', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  cardiovascular: { label: 'Cardiovascular', icon: '❤️', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  sleep: { label: 'Sleep', icon: '😴', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  disease_risk: { label: 'Disease Risk', icon: '⚠️', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  carrier_status: { label: 'Carrier Status', icon: '🧪', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  immune: { label: 'Immune', icon: '🛡️', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  cognitive: { label: 'Cognitive', icon: '🧠', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  longevity: { label: 'Longevity', icon: '⏳', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
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
