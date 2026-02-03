import { cn } from '~/utils/cn';
import type { ImpactLevel } from '~/types/genetics';

interface ImpactBadgeProps {
  impact: ImpactLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ImpactBadge({ impact, showLabel = true, size = 'md' }: ImpactBadgeProps) {
  const config: Record<number, { label: string; className: string }> = {
    0: { label: 'None', className: 'impact-low' },
    1: { label: 'Minor', className: 'impact-low' },
    2: { label: 'Moderate', className: 'impact-moderate' },
    3: { label: 'Significant', className: 'impact-moderate' },
    4: { label: 'High', className: 'impact-high' },
    5: { label: 'Very High', className: 'impact-high' },
    6: { label: 'Critical', className: 'impact-critical' },
  };

  const { label, className } = config[impact] || config[0];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={cn('impact-badge', className, sizeClasses[size])}>
      {showLabel ? label : impact}
    </span>
  );
}
