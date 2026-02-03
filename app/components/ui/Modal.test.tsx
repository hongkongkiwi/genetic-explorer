import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p data-testid="content">Modal content</p>
      </Modal>
    );
    
    // Content should be in the document (via portal)
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p data-testid="content">Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders description when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" description="Test description">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" showCloseButton={false}>
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('renders without title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p data-testid="content">Modal content</p>
      </Modal>
    );
    
    // Should still render content even without title
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
