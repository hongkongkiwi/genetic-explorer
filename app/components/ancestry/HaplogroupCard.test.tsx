import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HaplogroupCard, HaplogroupCardCompact } from './HaplogroupCard';
import type { YHaplogroupResult, MtHaplogroupResult } from '~/types/ancestry';

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

describe('HaplogroupCard', () => {
  const mockYHaplogroup: YHaplogroupResult = {
    haplogroup: 'R1b1a2',
    name: 'Western European',
    description: 'The most common haplogroup in Western Europe, associated with the Bell Beaker culture and Indo-European expansion.',
    origin: 'Pontic-Caspian Steppe',
    timeDepth: '~6,000 years ago',
    migrationPath: 'Pontic-Caspian Steppe → Central Europe → Western Europe',
    definingSnps: ['M269', 'L23', 'L11', 'P312', 'U106'],
    confidence: 'high',
    subclade: 'R1b1a2a1a1',
    notableMembers: ['King Louis XVI', 'Napoleon Bonaparte'],
  };

  const mockMtHaplogroup: MtHaplogroupResult = {
    haplogroup: 'H1',
    name: 'Haplogroup H1',
    description: 'A subclade of haplogroup H, the most common mitochondrial haplogroup in Europe.',
    origin: 'Southwest Europe',
    timeDepth: '~12,000 years ago',
    migrationPath: 'Southwest Europe → Mediterranean → Northern Europe',
    definingVariants: ['T7028C', 'G3010A', 'T14766C'],
    confidence: 'medium',
    distribution: 'Most common in Iberia and Scandinavia',
  };

  describe('Y-DNA Haplogroup', () => {
    it('renders Y-DNA haplogroup with subtitle and name', () => {
      render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
      
      // Component shows subtitle, not title
      expect(screen.getByText('Paternal Lineage')).toBeInTheDocument();
      expect(screen.getByText('R1b1a2')).toBeInTheDocument();
      expect(screen.getByText('Western European')).toBeInTheDocument();
    });

    it('shows origin location', () => {
      render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
      
      expect(screen.getByText('Origin')).toBeInTheDocument();
      expect(screen.getByText('Pontic-Caspian Steppe')).toBeInTheDocument();
    });

    it('displays migration path when expanded', () => {
      render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
      
      const expandButton = screen.getByText(/Show details/);
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Migration Path')).toBeInTheDocument();
      // The migration path is rendered as numbered steps
      // Use getAllByText since origin appears in both header and migration path
      const originElements = screen.getAllByText('Pontic-Caspian Steppe');
      expect(originElements.length).toBeGreaterThan(0);
    });

    it('has share button', async () => {
      const mockShare = vi.fn();
      Object.assign(navigator, {
        share: mockShare,
      });
      
      render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
      
      // Find share button by title
      const shareButton = screen.getByTitle('Share');
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(mockShare).toHaveBeenCalled();
      });
    });

    it('shows notable members for Y-DNA', () => {
      render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
      
      const expandButton = screen.getByText(/Show details/);
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Notable Members')).toBeInTheDocument();
      expect(screen.getByText('King Louis XVI')).toBeInTheDocument();
      expect(screen.getByText('Napoleon Bonaparte')).toBeInTheDocument();
    });

    it('shows defining SNPs', () => {
      render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
      
      const expandButton = screen.getByText(/Show details/);
      fireEvent.click(expandButton);
      
      expect(screen.getByText(/Defining SNPs/)).toBeInTheDocument();
      expect(screen.getByText('M269')).toBeInTheDocument();
      expect(screen.getByText('L23')).toBeInTheDocument();
    });
  });

  describe('mtDNA Haplogroup', () => {
    it('renders mtDNA haplogroup with subtitle and name', () => {
      render(<HaplogroupCard type="mtdna" haplogroup={mockMtHaplogroup} />);
      
      // Component shows subtitle, not title
      expect(screen.getByText('Maternal Lineage')).toBeInTheDocument();
      expect(screen.getByText('H1')).toBeInTheDocument();
    });

    it('shows origin location', () => {
      render(<HaplogroupCard type="mtdna" haplogroup={mockMtHaplogroup} />);
      
      expect(screen.getByText('Origin')).toBeInTheDocument();
      expect(screen.getByText('Southwest Europe')).toBeInTheDocument();
    });

    it('shows time depth', () => {
      render(<HaplogroupCard type="mtdna" haplogroup={mockMtHaplogroup} />);
      
      expect(screen.getByText('Time Depth')).toBeInTheDocument();
      expect(screen.getByText('~12,000 years ago')).toBeInTheDocument();
    });

    it('shows distribution info for mtDNA', () => {
      render(<HaplogroupCard type="mtdna" haplogroup={mockMtHaplogroup} />);
      
      const expandButton = screen.getByText(/Show details/);
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Regional Distribution')).toBeInTheDocument();
      expect(screen.getByText('Most common in Iberia and Scandinavia')).toBeInTheDocument();
    });

    it('shows defining variants for mtDNA', () => {
      render(<HaplogroupCard type="mtdna" haplogroup={mockMtHaplogroup} />);
      
      const expandButton = screen.getByText(/Show details/);
      fireEvent.click(expandButton);
      
      expect(screen.getByText(/Defining Variants/)).toBeInTheDocument();
      expect(screen.getByText('T7028C')).toBeInTheDocument();
    });
  });

  it('displays confidence badge', () => {
    render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
    
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('toggles expansion on click', () => {
    render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
    
    // Initially collapsed
    expect(screen.getByText(/Show details/)).toBeInTheDocument();
    
    // Expand
    fireEvent.click(screen.getByText(/Show details/));
    expect(screen.getByText(/Show less/)).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(screen.getByText(/Show less/));
    expect(screen.getByText(/Show details/)).toBeInTheDocument();
  });

  it('shows related haplogroups when expanded', () => {
    render(<HaplogroupCard type="y-dna" haplogroup={mockYHaplogroup} />);
    
    const expandButton = screen.getByText(/Show details/);
    fireEvent.click(expandButton);
    
    expect(screen.getByText('Related Haplogroups')).toBeInTheDocument();
  });

  describe('HaplogroupCardCompact', () => {
    it('renders compact Y-DNA card', () => {
      render(<HaplogroupCardCompact type="y-dna" haplogroup={mockYHaplogroup} />);
      
      expect(screen.getByText('Paternal Lineage')).toBeInTheDocument();
      expect(screen.getByText('R1b1a2')).toBeInTheDocument();
      expect(screen.getByText('Pontic-Caspian Steppe')).toBeInTheDocument();
    });

    it('renders compact mtDNA card', () => {
      render(<HaplogroupCardCompact type="mtdna" haplogroup={mockMtHaplogroup} />);
      
      expect(screen.getByText('Maternal Lineage')).toBeInTheDocument();
      expect(screen.getByText('H1')).toBeInTheDocument();
    });
  });
});
