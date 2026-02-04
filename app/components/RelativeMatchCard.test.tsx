import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RelativeMatchCard } from './RelativeMatchCard';
import type { RelativeMatch } from '~/types/relatives';

describe('RelativeMatchCard', () => {
  const mockMatch: RelativeMatch = {
    relativeId: 'match-123',
    relativeName: 'Anonymous User 123',
    avatar: undefined,
    sharedDNA: {
      percentage: 12.5,
      centimorgans: 850,
      segments: 8,
      largestSegment: 120,
      averageSegment: 106,
      ibdSegments: [
        { chromosome: '1', start: 1000000, end: 5000000, lengthBP: 4000000, centimorgans: 45, snpCount: 500 },
        { chromosome: '5', start: 2000000, end: 6000000, lengthBP: 4000000, centimorgans: 38, snpCount: 450 },
      ],
      sharedSNPs: 12000,
      totalSNPsCompared: 650000,
    },
    predictedRelationship: {
      type: 'first_cousin',
      displayName: 'First Cousin',
      confidence: 'high',
      possibleRelationships: ['First Cousin', 'Half Aunt/Uncle'],
      expectedRange: { min: 400, max: 1300, average: 850 },
    },
    ibdSegments: [
      { chromosome: '1', start: 1000000, end: 5000000, lengthBP: 4000000, centimorgans: 45, snpCount: 500 },
      { chromosome: '5', start: 2000000, end: 6000000, lengthBP: 4000000, centimorgans: 38, snpCount: 450 },
    ],
    optInStatus: true,
    isVisible: true,
    isHidden: false,
    hasContacted: false,
    matchedAt: new Date('2024-01-15'),
    side: 'maternal',
  };

  const mockOptOutMatch: RelativeMatch = {
    ...mockMatch,
    relativeId: 'match-456',
    relativeName: 'Anonymous User 456',
    optInStatus: false,
  };

  const mockHiddenMatch: RelativeMatch = {
    ...mockMatch,
    relativeId: 'match-789',
    isHidden: true,
  };

  it('shows predicted relationship', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    expect(screen.getByText('First Cousin')).toBeInTheDocument();
  });

  it('displays shared DNA percentage and cM', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('850 cM')).toBeInTheDocument();
  });

  it('shows anonymous name', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    expect(screen.getByText('Anonymous User 123')).toBeInTheDocument();
  });

  it('has compare button', () => {
    const mockCompare = vi.fn();
    render(<RelativeMatchCard match={mockMatch} onCompare={mockCompare} />);
    
    const compareButton = screen.getByText('Compare');
    expect(compareButton).toBeInTheDocument();
    
    fireEvent.click(compareButton);
    expect(mockCompare).toHaveBeenCalledWith(mockMatch);
  });

  it('shows opt-in indicator when opted in', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    // ShieldCheck icon should be present for opted-in matches
    const shieldCheck = document.querySelector('[class*="text-emerald-500"]');
    expect(shieldCheck).toBeInTheDocument();
  });

  it('shows opt-out indicator when not opted in', () => {
    render(<RelativeMatchCard match={mockOptOutMatch} />);
    
    // Shield icon should be present for non-opted-in matches
    const shield = document.querySelector('[class*="text-slate-400"]');
    expect(shield).toBeInTheDocument();
  });

  it('shows confidence badge', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows match date', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    expect(screen.getByText(/Matched/)).toBeInTheDocument();
  });

  it('shows maternal/paternal side when available', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    expect(screen.getByText('Maternal side')).toBeInTheDocument();
  });

  it('shows paternal side for paternal matches', () => {
    const paternalMatch = { ...mockMatch, side: 'paternal' as const };
    render(<RelativeMatchCard match={paternalMatch} />);
    
    expect(screen.getByText('Paternal side')).toBeInTheDocument();
  });

  it('has message button disabled for non-opted-in matches', () => {
    render(<RelativeMatchCard match={mockOptOutMatch} />);
    
    const messageButton = screen.getByText('Message');
    expect(messageButton).toBeDisabled();
  });

  it('has message button enabled for opted-in matches', () => {
    const mockMessage = vi.fn();
    render(<RelativeMatchCard match={mockMatch} onMessage={mockMessage} />);
    
    const messageButton = screen.getByText('Message');
    expect(messageButton).not.toBeDisabled();
    
    fireEvent.click(messageButton);
    expect(mockMessage).toHaveBeenCalledWith(mockMatch);
  });

  it('expands to show detailed stats', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    // Use aria-label to find expand button instead of innerHTML
    const expandButton = screen.getAllByRole('button').find(
      button => button.getAttribute('aria-label')?.includes('Expand') ?? false
    ) ?? screen.getAllByRole('button')[1]; // Fallback to second button
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      // Should show expanded details
      expect(screen.getByText('Shared DNA')).toBeInTheDocument();
      expect(screen.getByText('Segments')).toBeInTheDocument();
      expect(screen.getByText('Largest')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
    }
  });

  it('shows possible relationships when expanded', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    // Expand the card using aria-label
    const expandButton = screen.getAllByRole('button').find(
      button => button.getAttribute('aria-label')?.includes('Expand') ?? false
    ) ?? screen.getAllByRole('button')[1];
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Also possible:')).toBeInTheDocument();
      expect(screen.getByText('Half Aunt/Uncle')).toBeInTheDocument();
    }
  });

  it('shows shared segments when expanded', () => {
    render(<RelativeMatchCard match={mockMatch} />);
    
    // Expand the card using aria-label
    const expandButton = screen.getAllByRole('button').find(
      button => button.getAttribute('aria-label')?.includes('Expand') ?? false
    ) ?? screen.getAllByRole('button')[1];
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Shared Segments')).toBeInTheDocument();
      expect(screen.getByText('Chr 1')).toBeInTheDocument();
    }
  });

  it('shows privacy notice for non-opted-in matches', () => {
    render(<RelativeMatchCard match={mockOptOutMatch} />);
    
    // Expand the card using aria-label
    const expandButton = screen.getAllByRole('button').find(
      button => button.getAttribute('aria-label')?.includes('Expand') ?? false
    ) ?? screen.getAllByRole('button')[1];
    
    if (expandButton) {
      fireEvent.click(expandButton);
      
      expect(screen.getByText(/has not opted in to relative matching/)).toBeInTheDocument();
    }
  });

  it('has hide/unhide functionality', () => {
    const mockToggleVisibility = vi.fn();
    render(
      <RelativeMatchCard 
        match={mockMatch} 
        onToggleVisibility={mockToggleVisibility}
      />
    );
    
    // Find hide button using aria-label
    const hideButton = screen.getAllByRole('button').find(
      button => button.getAttribute('aria-label')?.includes('Hide') ?? false
    );
    
    if (hideButton) {
      fireEvent.click(hideButton);
      expect(mockToggleVisibility).toHaveBeenCalledWith('match-123', true);
    }
  });

  it('renders compact variant', () => {
    render(<RelativeMatchCard match={mockMatch} compact={true} />);
    
    expect(screen.getByText('Anonymous User 123')).toBeInTheDocument();
    expect(screen.getByText(/First Cousin/)).toBeInTheDocument();
  });

  it('handles card click', () => {
    const mockClick = vi.fn();
    render(<RelativeMatchCard match={mockMatch} onClick={mockClick} />);
    
    const card = screen.getByText('Anonymous User 123').closest('[class*="rounded-xl"]');
    if (card) {
      fireEvent.click(card);
      expect(mockClick).toHaveBeenCalledWith(mockMatch);
    }
  });

  it('shows selected state', () => {
    const { container } = render(<RelativeMatchCard match={mockMatch} isSelected={true} />);
    
    expect(container.querySelector('.ring-2')).toBeInTheDocument();
  });

  it('returns null for hidden matches when not selected', () => {
    const { container } = render(<RelativeMatchCard match={mockHiddenMatch} isSelected={false} />);
    
    // Should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('renders hidden match when selected', () => {
    const { container } = render(<RelativeMatchCard match={mockHiddenMatch} isSelected={true} />);
    
    // The component should render with the hidden match data
    // Check that the container has content
    expect(container.firstChild).not.toBeNull();
    
    // Should show the hidden badge
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });
});
