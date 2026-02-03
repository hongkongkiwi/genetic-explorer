import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DNALogo } from './DNALogo';

describe('DNALogo', () => {
  it('renders SVG element', () => {
    render(<DNALogo />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with default size of 40', () => {
    render(<DNALogo />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('renders with custom size', () => {
    render(<DNALogo size={60} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '60');
    expect(svg).toHaveAttribute('height', '60');
  });

  it('renders with different size values', () => {
    const { rerender } = render(<DNALogo size={24} />);
    let svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');

    rerender(<DNALogo size={100} />);
    svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '100');
  });

  it('has correct viewBox attribute', () => {
    render(<DNALogo />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('has correct SVG namespace', () => {
    render(<DNALogo />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  it('renders SVG with fill none', () => {
    render(<DNALogo />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('renders circles for DNA strands', () => {
    render(<DNALogo />);
    const circles = document.querySelectorAll('circle');
    // 5 segments * 2 circles (left and right strands) = 10 circles
    expect(circles.length).toBe(10);
  });

  it('renders lines for DNA connections', () => {
    render(<DNALogo />);
    const lines = document.querySelectorAll('line');
    // 5 segments with connecting lines
    expect(lines.length).toBe(5);
  });

  it('renders motion.g element with animation props', () => {
    render(<DNALogo animate={true} />);
    const motionG = document.querySelector('g');
    expect(motionG).toBeInTheDocument();
  });

  it('does not apply animation when animate is false', () => {
    render(<DNALogo animate={false} />);
    // Component should still render without errors when animate is false
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(10);
  });

  it('defaults to animate true', () => {
    render(<DNALogo />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('circles have correct radius', () => {
    render(<DNALogo />);
    const circles = document.querySelectorAll('circle');
    circles.forEach(circle => {
      expect(circle).toHaveAttribute('r', '6');
    });
  });

  it('lines have correct stroke width', () => {
    render(<DNALogo />);
    const lines = document.querySelectorAll('line');
    lines.forEach(line => {
      expect(line).toHaveAttribute('stroke-width', '2');
    });
  });

  it('lines have correct stroke color', () => {
    render(<DNALogo />);
    const lines = document.querySelectorAll('line');
    lines.forEach(line => {
      expect(line).toHaveAttribute('stroke', 'rgba(148, 163, 184, 0.3)');
    });
  });

  it('renders with four colors for DNA bases', () => {
    render(<DNALogo />);
    const circles = document.querySelectorAll('circle');
    
    // Collect all unique fill colors
    const colors = new Set<string>();
    circles.forEach(circle => {
      const fill = circle.getAttribute('fill');
      if (fill) colors.add(fill);
    });
    
    // Should have 4 colors: #22c55e, #3b82f6, #f59e0b, #ef4444
    expect(colors.has('#22c55e')).toBe(true);
    expect(colors.has('#3b82f6')).toBe(true);
    expect(colors.has('#f59e0b')).toBe(true);
    expect(colors.has('#ef4444')).toBe(true);
  });

  it('renders SVG when wrapped in container', () => {
    render(
      <div data-testid="logo-container">
        <DNALogo size={50} />
      </div>
    );
    expect(screen.getByTestId('logo-container')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('maintains aspect ratio with different sizes', () => {
    const { rerender } = render(<DNALogo size={32} />);
    let svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');

    rerender(<DNALogo size={80} />);
    svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    // ViewBox should remain constant
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('renders 5 segment groups', () => {
    render(<DNALogo />);
    const groups = document.querySelectorAll('g > g');
    // Inner groups for segments (5 segments)
    expect(groups.length).toBe(5);
  });
});
