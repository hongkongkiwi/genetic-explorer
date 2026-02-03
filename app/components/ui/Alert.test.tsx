import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders with default info variant', () => {
    render(<Alert>Information message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Information message');
    expect(alert).toHaveClass('bg-blue-50');
    expect(alert).toHaveClass('text-blue-800');
  });

  it('renders with success variant', () => {
    render(<Alert variant="success">Success message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Success message');
    expect(alert).toHaveClass('bg-green-50');
    expect(alert).toHaveClass('text-green-800');
  });

  it('renders with warning variant', () => {
    render(<Alert variant="warning">Warning message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Warning message');
    expect(alert).toHaveClass('bg-yellow-50');
    expect(alert).toHaveClass('text-yellow-800');
  });

  it('renders with destructive variant', () => {
    render(<Alert variant="destructive">Error message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Error message');
    expect(alert).toHaveClass('bg-red-50');
    expect(alert).toHaveClass('text-red-800');
  });

  it('applies custom className', () => {
    render(<Alert className="custom-alert-class">Message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert-class');
  });

  it('renders complex children', () => {
    render(
      <Alert>
        <strong>Important:</strong> Please check your settings
      </Alert>
    );
    expect(screen.getByRole('alert')).toContainHTML('<strong>Important:</strong>');
  });

  it('has correct ARIA role', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders icon for each variant', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert variant="destructive">Destructive</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
