import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-class');
  });

  it('renders with hover effect when hoverable is true', () => {
    render(
      <Card hoverable>
        <p>Hoverable card</p>
      </Card>
    );
    expect(screen.getByText('Hoverable card').parentElement).toHaveClass('hover:shadow-md');
  });

  it('renders with different padding sizes', () => {
    const { rerender } = render(
      <Card padding="sm">
        <p>Small padding</p>
      </Card>
    );
    expect(screen.getByText('Small padding').parentElement).toHaveClass('p-3');

    rerender(
      <Card padding="md">
        <p>Medium padding</p>
      </Card>
    );
    expect(screen.getByText('Medium padding').parentElement).toHaveClass('p-5');

    rerender(
      <Card padding="lg">
        <p>Large padding</p>
      </Card>
    );
    expect(screen.getByText('Large padding').parentElement).toHaveClass('p-8');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Card ref={ref}>
        <p>Ref card</p>
      </Card>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
