import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from './CategoryBadge';

describe('CategoryBadge', () => {
  it('renders drug_metabolism category with icon and label', () => {
    render(<CategoryBadge category="drug_metabolism" />);
    expect(screen.getByText('💊')).toBeInTheDocument();
    expect(screen.getByText('Drug Metabolism')).toBeInTheDocument();
  });

  it('renders methylation category with icon and label', () => {
    render(<CategoryBadge category="methylation" />);
    expect(screen.getByText('🧬')).toBeInTheDocument();
    expect(screen.getByText('Methylation')).toBeInTheDocument();
  });

  it('renders nutrition category with icon and label', () => {
    render(<CategoryBadge category="nutrition" />);
    expect(screen.getByText('🥗')).toBeInTheDocument();
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
  });

  it('renders fitness category with icon and label', () => {
    render(<CategoryBadge category="fitness" />);
    expect(screen.getByText('💪')).toBeInTheDocument();
    expect(screen.getByText('Fitness')).toBeInTheDocument();
  });

  it('renders cardiovascular category with icon and label', () => {
    render(<CategoryBadge category="cardiovascular" />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
  });

  it('renders sleep category with icon and label', () => {
    render(<CategoryBadge category="sleep" />);
    expect(screen.getByText('😴')).toBeInTheDocument();
    expect(screen.getByText('Sleep')).toBeInTheDocument();
  });

  it('renders disease_risk category with icon and label', () => {
    render(<CategoryBadge category="disease_risk" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Disease Risk')).toBeInTheDocument();
  });

  it('renders carrier_status category with icon and label', () => {
    render(<CategoryBadge category="carrier_status" />);
    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(screen.getByText('Carrier Status')).toBeInTheDocument();
  });

  it('renders immune category with icon and label', () => {
    render(<CategoryBadge category="immune" />);
    expect(screen.getByText('🛡️')).toBeInTheDocument();
    expect(screen.getByText('Immune')).toBeInTheDocument();
  });

  it('renders cognitive category with icon and label', () => {
    render(<CategoryBadge category="cognitive" />);
    expect(screen.getByText('🧠')).toBeInTheDocument();
    expect(screen.getByText('Cognitive')).toBeInTheDocument();
  });

  it('renders longevity category with icon and label', () => {
    render(<CategoryBadge category="longevity" />);
    expect(screen.getByText('⏳')).toBeInTheDocument();
    expect(screen.getByText('Longevity')).toBeInTheDocument();
  });

  it('renders Mental Health category (Title Case)', () => {
    render(<CategoryBadge category="Mental Health" />);
    expect(screen.getByText('🧠')).toBeInTheDocument();
    expect(screen.getByText('Mental Health')).toBeInTheDocument();
  });

  it('renders Drug Metabolism category (Title Case)', () => {
    render(<CategoryBadge category="Drug Metabolism" />);
    expect(screen.getByText('💊')).toBeInTheDocument();
    expect(screen.getByText('Drug Metabolism')).toBeInTheDocument();
  });

  it('renders Methylation category (Title Case)', () => {
    render(<CategoryBadge category="Methylation" />);
    expect(screen.getByText('🧬')).toBeInTheDocument();
    expect(screen.getByText('Methylation')).toBeInTheDocument();
  });

  it('renders Cardiovascular category (Title Case)', () => {
    render(<CategoryBadge category="Cardiovascular" />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
    expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
  });

  it('renders Nutrition category (Title Case)', () => {
    render(<CategoryBadge category="Nutrition" />);
    expect(screen.getByText('🥗')).toBeInTheDocument();
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
  });

  it('renders Fitness category (Title Case)', () => {
    render(<CategoryBadge category="Fitness" />);
    expect(screen.getByText('💪')).toBeInTheDocument();
    expect(screen.getByText('Fitness')).toBeInTheDocument();
  });

  it('renders Immune System category (Title Case)', () => {
    render(<CategoryBadge category="Immune System" />);
    expect(screen.getByText('🛡️')).toBeInTheDocument();
    expect(screen.getByText('Immune System')).toBeInTheDocument();
  });

  it('renders Disease Risk category (Title Case)', () => {
    render(<CategoryBadge category="Disease Risk" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Disease Risk')).toBeInTheDocument();
  });

  it('renders Hormonal category (Title Case)', () => {
    render(<CategoryBadge category="Hormonal" />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('Hormonal')).toBeInTheDocument();
  });

  it('renders with small size classes', () => {
    render(<CategoryBadge category="nutrition" size="sm" />);
    const badge = screen.getByText('Nutrition').parentElement;
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs', 'gap-1');
  });

  it('renders with medium size classes (default)', () => {
    render(<CategoryBadge category="nutrition" size="md" />);
    const badge = screen.getByText('Nutrition').parentElement;
    expect(badge).toHaveClass('px-3', 'py-1', 'text-sm', 'gap-1.5');
  });

  it('renders with large size classes', () => {
    render(<CategoryBadge category="nutrition" size="lg" />);
    const badge = screen.getByText('Nutrition').parentElement;
    expect(badge).toHaveClass('px-4', 'py-1.5', 'text-base', 'gap-2');
  });

  it('defaults to medium size when size prop is not provided', () => {
    render(<CategoryBadge category="nutrition" />);
    const badge = screen.getByText('Nutrition').parentElement;
    expect(badge).toHaveClass('px-3', 'py-1', 'text-sm', 'gap-1.5');
  });

  it('renders as span element', () => {
    render(<CategoryBadge category="nutrition" />);
    expect(screen.getByText('Nutrition').parentElement?.tagName).toBe('SPAN');
  });

  it('applies color classes for drug_metabolism category', () => {
    render(<CategoryBadge category="drug_metabolism" />);
    const badge = screen.getByText('Drug Metabolism').parentElement;
    expect(badge).toHaveClass('bg-purple-500/20', 'text-purple-400', 'border-purple-500/30');
  });

  it('applies color classes for methylation category', () => {
    render(<CategoryBadge category="methylation" />);
    const badge = screen.getByText('Methylation').parentElement;
    expect(badge).toHaveClass('bg-blue-500/20', 'text-blue-400', 'border-blue-500/30');
  });

  it('applies color classes for nutrition category', () => {
    render(<CategoryBadge category="nutrition" />);
    const badge = screen.getByText('Nutrition').parentElement;
    expect(badge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
  });

  it('applies color classes for fitness category', () => {
    render(<CategoryBadge category="fitness" />);
    const badge = screen.getByText('Fitness').parentElement;
    expect(badge).toHaveClass('bg-orange-500/20', 'text-orange-400', 'border-orange-500/30');
  });

  it('applies color classes for cardiovascular category', () => {
    render(<CategoryBadge category="cardiovascular" />);
    const badge = screen.getByText('Cardiovascular').parentElement;
    expect(badge).toHaveClass('bg-red-500/20', 'text-red-400', 'border-red-500/30');
  });

  it('applies base styling classes', () => {
    render(<CategoryBadge category="nutrition" />);
    const badge = screen.getByText('Nutrition').parentElement;
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'font-medium');
  });

  it('renders icon in separate span element', () => {
    render(<CategoryBadge category="nutrition" />);
    const iconSpan = screen.getByText('🥗');
    expect(iconSpan.tagName).toBe('SPAN');
  });

  it('renders label in separate span element', () => {
    render(<CategoryBadge category="nutrition" />);
    const labelSpan = screen.getByText('Nutrition');
    expect(labelSpan.tagName).toBe('SPAN');
  });
});
