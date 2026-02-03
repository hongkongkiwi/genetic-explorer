import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EthnicityChart, EthnicityChartCompact } from './EthnicityChart';
import type { PopulationEstimate } from '~/types/ancestry';

// Mock recharts
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('EthnicityChart', () => {
  const mockPopulations: PopulationEstimate[] = [
    {
      population: 'European',
      percentage: 45.5,
      confidence: 'high',
      region: 'Europe',
      subPopulations: [
        { name: 'Northern European', percentage: 25.0, region: 'Northern Europe' },
        { name: 'Southern European', percentage: 20.5, region: 'Southern Europe' },
      ],
    },
    {
      population: 'African',
      percentage: 30.0,
      confidence: 'medium',
      region: 'Africa',
    },
    {
      population: 'East Asian',
      percentage: 24.5,
      confidence: 'high',
      region: 'East Asia',
    },
  ];

  it('renders pie chart', () => {
    render(<EthnicityChart populations={mockPopulations} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('displays percentages', () => {
    render(<EthnicityChart populations={mockPopulations} />);
    expect(screen.getByText('45.5%')).toBeInTheDocument();
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('24.5%')).toBeInTheDocument();
  });

  it('shows confidence levels', () => {
    render(<EthnicityChart populations={mockPopulations} />);
    // Confidence indicators should be visible
    expect(screen.getByText('Confidence indicators shown')).toBeInTheDocument();
    // Legend should show confidence colors in footer
    expect(screen.getByText('Confidence levels:')).toBeInTheDocument();
  });

  it('handles click interactions on legend items', () => {
    render(<EthnicityChart populations={mockPopulations} />);
    
    // Find and click on a legend item
    const europeanButton = screen.getByText('European').closest('button');
    expect(europeanButton).toBeInTheDocument();
    
    fireEvent.click(europeanButton!);
    
    // Should show active state styling
    expect(europeanButton).toHaveClass('ring-2', 'ring-indigo-500');
  });

  it('renders legend with population breakdown', () => {
    render(<EthnicityChart populations={mockPopulations} />);
    
    expect(screen.getByText('Population Breakdown')).toBeInTheDocument();
    expect(screen.getByText('European')).toBeInTheDocument();
    expect(screen.getByText('African')).toBeInTheDocument();
    expect(screen.getByText('East Asian')).toBeInTheDocument();
  });

  it('renders donut variant with center label', () => {
    render(<EthnicityChart populations={mockPopulations} variant="donut" />);
    
    // Total percentage should be shown in center
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows active population in donut center when clicked', () => {
    render(<EthnicityChart populations={mockPopulations} variant="donut" />);
    
    const europeanButton = screen.getByText('European').closest('button');
    fireEvent.click(europeanButton!);
    
    // Should show European percentage in center
    expect(screen.getAllByText('45.5%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('European').length).toBeGreaterThan(0);
  });

  it('toggles sub-populations when showSubPopulations is true', () => {
    render(<EthnicityChart populations={mockPopulations} showSubPopulations={true} />);
    
    const europeanButton = screen.getByText('European').closest('button');
    fireEvent.click(europeanButton!);
    
    // Sub-population toggle should appear
    expect(screen.getByText(/sub-regions/)).toBeInTheDocument();
  });

  it('hides confidence indicators when showConfidence is false', () => {
    render(<EthnicityChart populations={mockPopulations} showConfidence={false} />);
    
    expect(screen.queryByText('Confidence indicators shown')).not.toBeInTheDocument();
  });

  it('renders header with population count', () => {
    render(<EthnicityChart populations={mockPopulations} />);
    
    expect(screen.getByText('Ethnicity Estimate')).toBeInTheDocument();
    expect(screen.getByText(`Based on ${mockPopulations.length} population references`)).toBeInTheDocument();
  });

  describe('EthnicityChartCompact', () => {
    it('renders compact view with top populations', () => {
      render(<EthnicityChartCompact populations={mockPopulations} />);
      
      // Should show only top 3 populations
      expect(screen.getByText('European')).toBeInTheDocument();
      expect(screen.getByText('45.5%')).toBeInTheDocument();
      expect(screen.getByText('African')).toBeInTheDocument();
      expect(screen.getByText('30.0%')).toBeInTheDocument();
    });

    it('renders progress bars for each population', () => {
      const { container } = render(<EthnicityChartCompact populations={mockPopulations} />);
      
      // Should have progress bar elements
      const progressBars = container.querySelectorAll('[class*="rounded-full"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
});
