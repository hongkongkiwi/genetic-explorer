import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarrierStatusCard, CarrierSummaryCard } from './CarrierStatusCard';
import { InheritancePattern } from '~/types/carrier';
import type { CarrierResult } from '~/types/carrier';

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

describe('CarrierStatusCard', () => {
  const mockCarrierResult: CarrierResult = {
    condition: {
      id: 'cystic-fibrosis',
      name: 'Cystic Fibrosis',
      gene: 'CFTR',
      geneFullName: 'Cystic Fibrosis Transmembrane Conductance Regulator',
      chromosome: '7',
      inheritance: InheritancePattern.AUTOSOMAL_RECESSIVE,
      description: 'A genetic disorder that affects the lungs, pancreas, and other organs.',
      symptoms: ['Chronic cough', 'Frequent lung infections', 'Poor growth', 'Salt-tasting skin'],
      treatments: ['Airway clearance', 'CFTR modulators', 'Nutritional support'],
      pathogenicVariants: [
        { id: 'F508del', name: 'F508del', pathogenicGenotypes: ['del/del', 'F508del/F508del'] },
      ],
      associatedSNPs: ['rs113993960'],
      prevalence: { european: '1/25', ashkenazi: '1/29' },
      clinicalSignificance: 'definitive',
      severity: 'high',
      recommendations: ['Genetic counseling', 'Family screening', 'Prenatal testing'],
      resources: [
        { title: 'Cystic Fibrosis Foundation', url: 'https://www.cff.org', type: 'website' },
      ],
      category: 'Respiratory',
      prenatalTestingAvailable: true,
      newbornScreeningAvailable: true,
    },
    status: 'carrier',
    variantsFound: [{ id: 'F508del', name: 'F508del', pathogenicGenotypes: ['del/del'] }],
    userGenotypes: [{ rsid: 'rs113993960', genotype: 'CT' }],
    explanation: 'You carry one copy of the F508del variant in the CFTR gene.',
    riskToOffspring: 'depends_on_partner',
    riskExplanation: 'If your partner is also a carrier, there is a 25% chance with each pregnancy of having a child with CF.',
    recommendations: ['Consider partner screening', 'Genetic counseling'],
    resources: [
      { title: 'CF Foundation', url: 'https://www.cff.org', type: 'website' },
    ],
    analyzedAt: new Date('2024-01-15'),
    counselingRecommended: true,
    urgency: 'moderate',
  };

  const mockNotCarrierResult: CarrierResult = {
    ...mockCarrierResult,
    status: 'not_carrier',
    variantsFound: [],
    userGenotypes: [{ rsid: 'rs113993960', genotype: 'CC' }],
    explanation: 'No pathogenic variants were detected in the CFTR gene.',
    riskToOffspring: 'low',
    riskExplanation: 'Your risk of having a child with CF is very low unless your partner is a carrier.',
    counselingRecommended: false,
    urgency: 'none',
  };

  const mockAffectedResult: CarrierResult = {
    ...mockCarrierResult,
    status: 'affected',
    variantsFound: [
      { id: 'F508del', name: 'F508del', pathogenicGenotypes: ['del/del'] },
      { id: 'G551D', name: 'G551D', pathogenicGenotypes: ['G551D/G551D'] },
    ],
    userGenotypes: [
      { rsid: 'rs113993960', genotype: 'TT' },
      { rsid: 'rs75527207', genotype: 'AA' },
    ],
    explanation: 'You have two pathogenic variants in the CFTR gene.',
    riskToOffspring: 'high',
    riskExplanation: 'All of your children will be carriers of Cystic Fibrosis.',
    counselingRecommended: true,
    urgency: 'immediate',
  };

  it('renders condition name', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('Cystic Fibrosis')).toBeInTheDocument();
  });

  it('shows carrier status badge', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('Carrier')).toBeInTheDocument();
  });

  it('shows not_carrier status badge', () => {
    render(<CarrierStatusCard result={mockNotCarrierResult} />);
    
    expect(screen.getByText('Not a Carrier')).toBeInTheDocument();
  });

  it('shows affected status badge', () => {
    render(<CarrierStatusCard result={mockAffectedResult} />);
    
    expect(screen.getByText('Affected')).toBeInTheDocument();
  });

  it('displays severity badge', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('has expand/collapse details', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    // Should have expand button
    const expandButton = screen.getByLabelText('Expand');
    expect(expandButton).toBeInTheDocument();
    
    // Expand
    fireEvent.click(expandButton);
    expect(screen.getByLabelText('Collapse')).toBeInTheDocument();
    
    // Should show detailed sections
    expect(screen.getByText('About This Condition')).toBeInTheDocument();
    expect(screen.getByText('Variants Detected')).toBeInTheDocument();
    expect(screen.getByText('What This Means For You')).toBeInTheDocument();
  });

  it('shows counseling CTA for high risk', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('Genetic Counseling Recommended')).toBeInTheDocument();
    expect(screen.getByText(/Find a Genetic Counselor/)).toBeInTheDocument();
    expect(screen.getByText(/Learn About Genetic Counseling/)).toBeInTheDocument();
  });

  it('does not show counseling CTA for low risk', () => {
    render(<CarrierStatusCard result={mockNotCarrierResult} />);
    
    expect(screen.queryByText('Genetic Counseling Recommended')).not.toBeInTheDocument();
  });

  it('shows urgency indicator when urgency is not none', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('Moderate Priority')).toBeInTheDocument();
  });

  it('shows gene information', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('CFTR')).toBeInTheDocument();
    expect(screen.getByText('Respiratory')).toBeInTheDocument();
  });

  it('shows inheritance pattern', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('Autosomal Recessive')).toBeInTheDocument();
  });

  it('shows inheritance explanation when clicked', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    const inheritanceButton = screen.getByText('Autosomal Recessive');
    fireEvent.click(inheritanceButton);
    
    expect(screen.getByText('Autosomal Recessive Inheritance')).toBeInTheDocument();
    expect(screen.getByText(/Both parents must be carriers/)).toBeInTheDocument();
  });

  it('shows symptoms when expanded', () => {
    render(<CarrierStatusCard result={mockCarrierResult} showDetailed={true} />);
    
    expect(screen.getByText('Symptoms & Effects')).toBeInTheDocument();
    expect(screen.getByText('Chronic cough')).toBeInTheDocument();
    expect(screen.getByText('Frequent lung infections')).toBeInTheDocument();
  });

  it('shows treatment options when expanded', () => {
    render(<CarrierStatusCard result={mockCarrierResult} showDetailed={true} />);
    
    expect(screen.getByText('Treatment Options')).toBeInTheDocument();
    expect(screen.getByText('Airway clearance')).toBeInTheDocument();
    expect(screen.getByText('CFTR modulators')).toBeInTheDocument();
  });

  it('shows family planning considerations', () => {
    render(<CarrierStatusCard result={mockCarrierResult} showDetailed={true} />);
    
    expect(screen.getByText('Family Planning Considerations')).toBeInTheDocument();
    expect(screen.getByText(/Risk Level:/)).toBeInTheDocument();
  });

  it('shows prenatal testing availability', () => {
    render(<CarrierStatusCard result={mockCarrierResult} />);
    
    expect(screen.getByText('Prenatal testing available')).toBeInTheDocument();
  });

  it('shows analysis date when expanded', () => {
    render(<CarrierStatusCard result={mockCarrierResult} showDetailed={true} />);
    
    expect(screen.getByText(/Analyzed:/)).toBeInTheDocument();
    // Check for date format pattern rather than specific date string
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{4}/;
    const analyzedText = screen.getByText(/Analyzed:/);
    expect(analyzedText.textContent).toMatch(dateRegex);
  });

  it('applies high risk styling for affected status', () => {
    const { container } = render(<CarrierStatusCard result={mockAffectedResult} />);
    
    // Should have ring styling for high risk
    expect(container.querySelector('.ring-2')).toBeInTheDocument();
  });

  describe('CarrierSummaryCard', () => {
    it('renders summary with all stats', () => {
      render(
        <CarrierSummaryCard
          totalConditions={50}
          carrierCount={5}
          affectedCount={1}
          counselingCount={2}
        />
      );
      
      expect(screen.getByText('Carrier Status Summary')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Conditions Tested')).toBeInTheDocument();
      expect(screen.getByText('44')).toBeInTheDocument(); // 50 - 5 - 1
      expect(screen.getByText('Not a Carrier')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Carrier')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Affected')).toBeInTheDocument();
    });

    it('shows counseling alert when counselingCount > 0', () => {
      render(
        <CarrierSummaryCard
          totalConditions={50}
          carrierCount={5}
          affectedCount={0}
          counselingCount={2}
        />
      );
      
      expect(screen.getByText(/Genetic Counseling Recommended/)).toBeInTheDocument();
      expect(screen.getByText(/2 of your results recommend speaking with a genetic counselor/)).toBeInTheDocument();
    });

    it('shows medical disclaimer', () => {
      render(
        <CarrierSummaryCard
          totalConditions={50}
          carrierCount={0}
          affectedCount={0}
          counselingCount={0}
        />
      );
      
      expect(screen.getByText('Important Medical Disclaimer:')).toBeInTheDocument();
      expect(screen.getByText(/This screening is for educational purposes only/)).toBeInTheDocument();
    });
  });
});
