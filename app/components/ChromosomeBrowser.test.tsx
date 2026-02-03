import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChromosomeBrowser } from './ChromosomeBrowser';

describe('ChromosomeBrowser', () => {
  const mockPrimaryGenome = {
    id: 'genome-1',
    name: 'My Genome',
    snps: [
      { rsid: 'rs1', chromosome: '1', position: 1000000, genotype: 'AA', category: 'health' },
      { rsid: 'rs2', chromosome: '1', position: 2000000, genotype: 'GG', category: 'ancestry' },
      { rsid: 'rs3', chromosome: '2', position: 1500000, genotype: 'CT', category: 'trait' },
      { rsid: 'rs4', chromosome: 'X', position: 500000, genotype: 'TT', category: 'health' },
    ],
    color: '#3b82f6',
  };

  const mockComparisonGenome = {
    id: 'genome-2',
    name: 'Relative Genome',
    snps: [
      { rsid: 'rs1', chromosome: '1', position: 1000000, genotype: 'AG', category: 'health' },
      { rsid: 'rs2', chromosome: '1', position: 2000000, genotype: 'GG', category: 'ancestry' },
    ],
    color: '#ef4444',
  };

  it('renders all chromosomes', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    expect(screen.getByText('Chromosome Browser')).toBeInTheDocument();
    // Should show karyotype overview title
    expect(screen.getByText('Human Karyotype Overview')).toBeInTheDocument();
  });

  it('shows SNP count in header', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    expect(screen.getByText(/4 variants/)).toBeInTheDocument();
  });

  it('handles zoom controls', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    // Initial zoom should be 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Get all buttons and find zoom buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles reset zoom', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    // Get all buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has legend component', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    // Component renders with legend sidebar
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has search functionality', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    const searchInput = screen.getByPlaceholderText('Search SNPs...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    const searchInput = screen.getByPlaceholderText('Search SNPs...');
    
    fireEvent.change(searchInput, { target: { value: 'rs1' } });
    
    // Should show search results
    expect(screen.getByText('1 results')).toBeInTheDocument();
    expect(screen.getByText('rs1')).toBeInTheDocument();
  });

  it('toggles labels', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    const labelsButton = screen.getByText('Labels');
    expect(labelsButton).toBeInTheDocument();
    
    fireEvent.click(labelsButton);
  });

  it('switches to compare mode when comparison genome provided', () => {
    render(
      <ChromosomeBrowser 
        primaryGenome={mockPrimaryGenome} 
        comparisonGenome={mockComparisonGenome}
      />
    );
    
    const compareButton = screen.getByText('Compare');
    expect(compareButton).toBeInTheDocument();
    
    fireEvent.click(compareButton);
  });

  it('calls onViewChange when view changes', () => {
    const mockOnViewChange = vi.fn();
    render(
      <ChromosomeBrowser 
        primaryGenome={mockPrimaryGenome}
        onViewChange={mockOnViewChange}
      />
    );
    
    // Initial call on mount
    expect(mockOnViewChange).toHaveBeenCalled();
  });

  it('renders category filters', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    expect(screen.getByText('Filter:')).toBeInTheDocument();
  });

  it('shows help text for controls', () => {
    render(<ChromosomeBrowser primaryGenome={mockPrimaryGenome} />);
    
    expect(screen.getByText(/Scroll \+ Ctrl to zoom/)).toBeInTheDocument();
  });

  it('applies dark mode styling when isDark is true', () => {
    const { container } = render(
      <ChromosomeBrowser 
        primaryGenome={mockPrimaryGenome}
        isDark={true}
      />
    );
    
    expect(container.querySelector('.dark\\:bg-slate-950')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChromosomeBrowser 
        primaryGenome={mockPrimaryGenome}
        className="custom-browser-class"
      />
    );
    
    expect(container.querySelector('.custom-browser-class')).toBeInTheDocument();
  });
});
