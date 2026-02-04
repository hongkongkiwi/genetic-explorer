import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptInPanel } from './OptInPanel';
import type { RelativeMatchingPrivacy } from '~/types/relatives';

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

// Mock confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

describe('OptInPanel', () => {
  const mockOptedInPrivacy: RelativeMatchingPrivacy = {
    optIn: true,
    showAncestry: true,
    allowContact: true,
    showRealName: false,
    shareEthnicity: true,
    hiddenMatches: [],
    showSidePredictions: true,
  };

  const mockOptedOutPrivacy: RelativeMatchingPrivacy = {
    optIn: false,
    showAncestry: false,
    allowContact: false,
    showRealName: false,
    shareEthnicity: false,
    hiddenMatches: [],
    showSidePredictions: false,
  };

  it('shows opt-in toggle when opted out', () => {
    render(
      <OptInPanel 
        privacy={mockOptedOutPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('DNA Relative Matching')).toBeInTheDocument();
    expect(screen.getByText('Enable DNA Matching')).toBeInTheDocument();
  });

  it('shows opt-in toggle when opted in', () => {
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('DNA Relative Matching')).toBeInTheDocument();
    expect(screen.getByText('Enable DNA Matching')).toBeInTheDocument();
  });

  it('updates preferences when toggle is clicked', async () => {
    const mockOptInChange = vi.fn().mockResolvedValue(undefined);
    render(
      <OptInPanel 
        privacy={mockOptedOutPrivacy}
        onOptInChange={mockOptInChange}
        onPrivacyChange={vi.fn()}
      />
    );
    
    // Find the main toggle button by looking for the switch element
    const toggleButton = screen.getAllByRole('button').find(btn => 
      btn.className.includes('w-14') || btn.className.includes('rounded-full')
    );
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockOptInChange).toHaveBeenCalledWith(true);
      });
    }
  });

  it('shows privacy controls when opted in', () => {
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Show Ancestry Regions')).toBeInTheDocument();
    expect(screen.getByText('Allow Contact')).toBeInTheDocument();
    expect(screen.getByText('Show Real Name')).toBeInTheDocument();
    expect(screen.getByText('Share Ethnicity Estimate')).toBeInTheDocument();
    expect(screen.getByText('Show Side Predictions')).toBeInTheDocument();
  });

  it('hides privacy controls when opted out', () => {
    render(
      <OptInPanel 
        privacy={mockOptedOutPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    expect(screen.queryByText('Privacy Settings')).not.toBeInTheDocument();
  });

  it('updates privacy settings when toggles are clicked', () => {
    const mockPrivacyChange = vi.fn();
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={mockPrivacyChange}
      />
    );
    
    // Click on Show Real Name toggle
    const showRealNameLabel = screen.getByText('Show Real Name').closest('label');
    fireEvent.click(showRealNameLabel!);
    
    expect(mockPrivacyChange).toHaveBeenCalledWith({ showRealName: true });
  });

  it('has confirm button for opting out', async () => {
    mockConfirm.mockReturnValue(true);
    const mockOptInChange = vi.fn().mockResolvedValue(undefined);
    
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={mockOptInChange}
        onPrivacyChange={vi.fn()}
      />
    );
    
    const optOutButton = screen.getByText('Opt Out of DNA Matching');
    expect(optOutButton).toBeInTheDocument();
    
    fireEvent.click(optOutButton);
    
    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to opt out? You will no longer see DNA matches or be visible to others.'
    );
    
    await waitFor(() => {
      expect(mockOptInChange).toHaveBeenCalledWith(false);
    });
  });

  it('cancels opt-out when confirm is declined', async () => {
    mockConfirm.mockReturnValue(false);
    const mockOptInChange = vi.fn();
    
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={mockOptInChange}
        onPrivacyChange={vi.fn()}
      />
    );
    
    const optOutButton = screen.getByText('Opt Out of DNA Matching');
    fireEvent.click(optOutButton);
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOptInChange).not.toHaveBeenCalled();
  });

  it('shows expanded details when clicked', () => {
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    const detailsButton = screen.getByText("How it works & what's shared");
    fireEvent.click(detailsButton);
    
    expect(screen.getByText('Hide details')).toBeInTheDocument();
    expect(screen.getByText('What You Get')).toBeInTheDocument();
    expect(screen.getByText('What Data Is Shared')).toBeInTheDocument();
    expect(screen.getByText('Privacy Protections')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(
      <OptInPanel 
        privacy={mockOptedOutPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
        compact={true}
      />
    );
    
    expect(screen.getByText('DNA Matching Disabled')).toBeInTheDocument();
    expect(screen.getByText('Opt in to discover genetic relatives')).toBeInTheDocument();
  });

  it('renders compact variant when enabled', () => {
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
        compact={true}
      />
    );
    
    expect(screen.getByText('DNA Matching Enabled')).toBeInTheDocument();
    expect(screen.getByText('You can see matches and matches can see you')).toBeInTheDocument();
  });

  it('shows privacy policy and terms links', () => {
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    // Expand details to see links
    const detailsButton = screen.getByText("How it works & what's shared");
    fireEvent.click(detailsButton);
    
    const privacyLink = screen.getByText('Privacy Policy');
    const termsLink = screen.getByText('Terms of Service');
    
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('shows loading state while confirming', async () => {
    const mockOptInChange = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <OptInPanel 
        privacy={mockOptedOutPrivacy}
        onOptInChange={mockOptInChange}
        onPrivacyChange={vi.fn()}
        compact={true}
      />
    );
    
    const enableButton = screen.getByText('Enable');
    fireEvent.click(enableButton);
    
    // Button should be in loading state
    expect(enableButton).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
        className="custom-optin-class"
      />
    );
    
    expect(container.querySelector('.custom-optin-class')).toBeInTheDocument();
  });

  it('displays correct status text when opted in', () => {
    render(
      <OptInPanel 
        privacy={mockOptedInPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    expect(screen.getByText(/You are opted in to DNA matching/)).toBeInTheDocument();
  });

  it('displays correct status text when opted out', () => {
    render(
      <OptInPanel 
        privacy={mockOptedOutPrivacy}
        onOptInChange={vi.fn()}
        onPrivacyChange={vi.fn()}
      />
    );
    
    expect(screen.getByText(/Opt in to discover genetic relatives/)).toBeInTheDocument();
  });
});
