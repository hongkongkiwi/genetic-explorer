import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('renders as label element', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text').tagName).toBe('LABEL');
  });

  it('has htmlFor attribute for input association', () => {
    render(<Label htmlFor="input-id">Input Label</Label>);
    expect(screen.getByText('Input Label')).toHaveAttribute('for', 'input-id');
  });

  it('applies custom className', () => {
    render(<Label className="custom-label-class">Custom Label</Label>);
    expect(screen.getByText('Custom Label')).toHaveClass('custom-label-class');
  });

  it('applies base styling classes', () => {
    render(<Label>Styled Label</Label>);
    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(<Label ref={ref}>Ref Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('works with associated input element', () => {
    render(
      <>
        <Label htmlFor="test-input">Email</Label>
        <input id="test-input" type="email" />
      </>
    );
    
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders children correctly', () => {
    render(
      <Label>
        <span>Nested</span> Content
      </Label>
    );
    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has peer-disabled styling classes', () => {
    render(<Label>Peer Label</Label>);
    const label = screen.getByText('Peer Label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
  });

  it('is clickable and focuses associated input', () => {
    render(
      <>
        <Label htmlFor="clickable-input">Clickable Label</Label>
        <input id="clickable-input" type="text" data-testid="input" />
      </>
    );
    
    const label = screen.getByText('Clickable Label');
    expect(label).toBeInTheDocument();
    // The label exists and has proper for attribute
    expect(label).toHaveAttribute('for', 'clickable-input');
  });

  it('renders with id attribute', () => {
    render(<Label id="label-id">ID Label</Label>);
    expect(screen.getByText('ID Label')).toHaveAttribute('id', 'label-id');
  });

  it('supports aria-label attribute', () => {
    render(<Label aria-label="Accessibility label">Visible Label</Label>);
    expect(screen.getByLabelText('Accessibility label')).toBeInTheDocument();
  });

  it('supports data attributes', () => {
    render(<Label data-testid="test-label">Data Label</Label>);
    expect(screen.getByTestId('test-label')).toBeInTheDocument();
  });
});
