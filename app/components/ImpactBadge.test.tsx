import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImpactBadge } from './ImpactBadge';

describe('ImpactBadge', () => {
  it('renders with impact level 0 (None)', () => {
    render(<ImpactBadge impact={0} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders with impact level 1 (Minor)', () => {
    render(<ImpactBadge impact={1} />);
    expect(screen.getByText('Minor')).toBeInTheDocument();
  });

  it('renders with impact level 2 (Moderate)', () => {
    render(<ImpactBadge impact={2} />);
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('renders with impact level 3 (Significant)', () => {
    render(<ImpactBadge impact={3} />);
    expect(screen.getByText('Significant')).toBeInTheDocument();
  });

  it('renders with impact level 4 (High)', () => {
    render(<ImpactBadge impact={4} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders with impact level 5 (Very High)', () => {
    render(<ImpactBadge impact={5} />);
    expect(screen.getByText('Very High')).toBeInTheDocument();
  });

  it('renders with impact level 6 (Critical)', () => {
    render(<ImpactBadge impact={6} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders number instead of label when showLabel is false', () => {
    render(<ImpactBadge impact={4} showLabel={false} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });

  it('renders number for all impact levels when showLabel is false', () => {
    const { rerender } = render(<ImpactBadge impact={0} showLabel={false} />);
    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(<ImpactBadge impact={3} showLabel={false} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<ImpactBadge impact={6} showLabel={false} />);
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('applies impact-low class for levels 0 and 1', () => {
    const { rerender } = render(<ImpactBadge impact={0} />);
    expect(screen.getByText('None')).toHaveClass('impact-low');

    rerender(<ImpactBadge impact={1} />);
    expect(screen.getByText('Minor')).toHaveClass('impact-low');
  });

  it('applies impact-moderate class for levels 2 and 3', () => {
    const { rerender } = render(<ImpactBadge impact={2} />);
    expect(screen.getByText('Moderate')).toHaveClass('impact-moderate');

    rerender(<ImpactBadge impact={3} />);
    expect(screen.getByText('Significant')).toHaveClass('impact-moderate');
  });

  it('applies impact-high class for levels 4 and 5', () => {
    const { rerender } = render(<ImpactBadge impact={4} />);
    expect(screen.getByText('High')).toHaveClass('impact-high');

    rerender(<ImpactBadge impact={5} />);
    expect(screen.getByText('Very High')).toHaveClass('impact-high');
  });

  it('applies impact-critical class for level 6', () => {
    render(<ImpactBadge impact={6} />);
    expect(screen.getByText('Critical')).toHaveClass('impact-critical');
  });

  it('applies base impact-badge class', () => {
    render(<ImpactBadge impact={3} />);
    expect(screen.getByText('Significant')).toHaveClass('impact-badge');
  });

  it('renders with small size classes', () => {
    render(<ImpactBadge impact={2} size="sm" />);
    const badge = screen.getByText('Moderate');
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
  });

  it('renders with medium size classes (default)', () => {
    render(<ImpactBadge impact={2} size="md" />);
    const badge = screen.getByText('Moderate');
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
  });

  it('renders with large size classes', () => {
    render(<ImpactBadge impact={2} size="lg" />);
    const badge = screen.getByText('Moderate');
    expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
  });

  it('defaults to medium size when size prop is not provided', () => {
    render(<ImpactBadge impact={2} />);
    const badge = screen.getByText('Moderate');
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
  });

  it('renders as span element', () => {
    render(<ImpactBadge impact={3} />);
    expect(screen.getByText('Significant').tagName).toBe('SPAN');
  });

  it('handles invalid impact level gracefully (defaults to None)', () => {
    // @ts-expect-error Testing invalid impact level
    render(<ImpactBadge impact={99} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('handles negative impact level gracefully (defaults to None)', () => {
    // @ts-expect-error Testing invalid impact level
    render(<ImpactBadge impact={-1} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });
});
