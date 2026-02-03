import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TraitCard, TraitCardSkeleton, TraitCardEmpty, TraitComparisonCard } from './TraitCard';
import type { TraitResult } from '~/types/traits';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('TraitCard', () => {
  const mockTraitResult: TraitResult = {
    trait: {
      id: 'eye-color',
      name: 'Eye Color',
      description: 'Predicted eye color based on genetic variants',
      category: 'physical',
      icon: '👁️',
      snps: [{ rsid: 'rs12913832', gene: 'HERC2', geneName: 'HERC2' }],
      genotypeMap: [
        { genotype: 'AA', phenotype: 'Brown eyes', description: 'Associated with brown eye color' },
        { genotype: 'AG', phenotype: 'Brown or hazel eyes', description: 'Associated with intermediate eye color' },
        { genotype: 'GG', phenotype: 'Blue eyes', description: 'Associated with blue eye color' },
      ],
      confidence: 'high',
      funFacts: [
        'Only 8% of the world population has blue eyes',
        'Eye color is determined by multiple genes, not just one',
      ],
      scientificDetails: 'The HERC2 gene regulates OCA2 expression which affects melanin production in the iris.',
    },
    userGenotype: 'GG',
    predictedPhenotype: 'Blue eyes',
    confidence: 'high',
    explanation: 'Your genotype at rs12913832 (HERC2) is GG. This variant is associated with blue eye color.',
    funFact: 'Only 8% of the world population has blue eyes',
  };

  it('renders trait name', () => {
    render(<TraitCard result={mockTraitResult} />);
    
    expect(screen.getByText('Eye Color')).toBeInTheDocument();
  });

  it('displays predicted phenotype', () => {
    render(<TraitCard result={mockTraitResult} />);
    
    expect(screen.getByText('Blue eyes')).toBeInTheDocument();
  });

  it('shows confidence badge', () => {
    render(<TraitCard result={mockTraitResult} />);
    
    expect(screen.getByText('High Confidence')).toBeInTheDocument();
  });

  it('reveals fun fact on click', () => {
    render(<TraitCard result={mockTraitResult} />);
    
    // Fun fact should be hidden initially
    expect(screen.getByText('Click to reveal fun fact!')).toBeInTheDocument();
    expect(screen.queryByText('Did you know?')).not.toBeInTheDocument();
    
    // Click to reveal
    fireEvent.click(screen.getByText('Click to reveal fun fact!'));
    
    // Fun fact should now be visible
    expect(screen.getByText('Did you know?')).toBeInTheDocument();
    expect(screen.getByText('Only 8% of the world population has blue eyes')).toBeInTheDocument();
  });

  it('has share functionality', async () => {
    const mockOnShare = vi.fn();
    const mockClipboard = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    });
    
    render(<TraitCard result={mockTraitResult} onShare={mockOnShare} />);
    
    const shareButton = screen.getByText('Share');
    expect(shareButton).toBeInTheDocument();
    
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(mockOnShare).toHaveBeenCalledWith(mockTraitResult);
      expect(mockClipboard).toHaveBeenCalled();
    });
    
    // Should show "Copied!" after click
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('renders data available indicator when user has data', () => {
    render(<TraitCard result={mockTraitResult} />);
    
    expect(screen.getByText('Data Available')).toBeInTheDocument();
  });

  it('renders no data indicator when user lacks data', () => {
    const noDataResult = { ...mockTraitResult, userGenotype: null };
    render(<TraitCard result={noDataResult} />);
    
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<TraitCard result={mockTraitResult} variant="compact" />);
    
    expect(screen.getByText('Eye Color')).toBeInTheDocument();
    expect(screen.getByText('Blue eyes')).toBeInTheDocument();
    expect(screen.getByText('High Confidence')).toBeInTheDocument();
  });

  it('renders detailed variant with scientific details', () => {
    render(<TraitCard result={mockTraitResult} variant="detailed" />);
    
    expect(screen.getByText('Eye Color')).toBeInTheDocument();
    expect(screen.getByText('Prediction')).toBeInTheDocument();
    expect(screen.getByText('Blue eyes')).toBeInTheDocument();
    expect(screen.getByText('What this means')).toBeInTheDocument();
  });

  it('shows user genotype in detailed variant', () => {
    render(<TraitCard result={mockTraitResult} variant="detailed" />);
    
    expect(screen.getByText(/Your genotype:/)).toBeInTheDocument();
    expect(screen.getByText('GG')).toBeInTheDocument();
  });

  it('toggles scientific details in detailed variant', () => {
    render(<TraitCard result={mockTraitResult} variant="detailed" />);
    
    const toggleButton = screen.getByText('Show scientific details');
    expect(toggleButton).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Hide scientific details')).toBeInTheDocument();
    expect(screen.getByText(/Relevant SNPs:/)).toBeInTheDocument();
    expect(screen.getByText('rs12913832')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TraitCard result={mockTraitResult} className="custom-class" />);
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  describe('TraitCardSkeleton', () => {
    it('renders skeleton loading state', () => {
      const { container } = render(<TraitCardSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('TraitCardEmpty', () => {
    it('renders empty state', () => {
      render(<TraitCardEmpty />);
      
      expect(screen.getByText('No traits found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters to see more results.')).toBeInTheDocument();
    });

    it('shows clear filters button when onClearFilters provided', () => {
      const mockClear = vi.fn();
      render(<TraitCardEmpty onClearFilters={mockClear} />);
      
      const clearButton = screen.getByText('Clear filters');
      expect(clearButton).toBeInTheDocument();
      
      fireEvent.click(clearButton);
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('TraitComparisonCard', () => {
    const mockTraitResultB: TraitResult = {
      ...mockTraitResult,
      userGenotype: 'AA',
      predictedPhenotype: 'Brown eyes',
      explanation: 'Your genotype indicates brown eye color.',
    };

    it('renders comparison with identical similarity', () => {
      render(
        <TraitComparisonCard
          traitA={mockTraitResult}
          traitB={mockTraitResult}
          similarity="identical"
        />
      );
      
      expect(screen.getByText('Eye Color')).toBeInTheDocument();
      // Check for similarity indicator - using more flexible matching
      const sameBadge = screen.getByText(/Same|Identical/i);
      expect(sameBadge).toBeInTheDocument();
    });

    it('renders comparison with different similarity', () => {
      render(
        <TraitComparisonCard
          traitA={mockTraitResult}
          traitB={mockTraitResultB}
          similarity="different"
        />
      );
      
      expect(screen.getByText('Eye Color')).toBeInTheDocument();
      // Check for similarity indicator
      const differentBadge = screen.getByText(/Different/i);
      expect(differentBadge).toBeInTheDocument();
      expect(screen.getByText('Blue eyes')).toBeInTheDocument();
      expect(screen.getByText('Brown eyes')).toBeInTheDocument();
    });
  });
});
