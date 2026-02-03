import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<Input defaultValue="default text" />);
    expect(screen.getByDisplayValue('default text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles focus events', () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('handles blur events', () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is required when required prop is true', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    // Password inputs don't have a textbox role by default
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();

    rerender(<Input type="number" />);
    expect(document.querySelector('input[type="number"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input-class');
  });

  it('applies base styling classes', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has correct name attribute', () => {
    render(<Input name="username" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
  });

  it('has correct id attribute', () => {
    render(<Input id="user-input" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'user-input');
  });

  it('renders with aria-label for accessibility', () => {
    render(<Input aria-label="Search input" />);
    expect(screen.getByLabelText('Search input')).toBeInTheDocument();
  });

  it('renders with aria-describedby for accessibility', () => {
    render(<Input aria-describedby="input-help" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'input-help');
  });

  it('has readOnly attribute when readOnly prop is true', () => {
    render(<Input readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('has maxLength attribute when specified', () => {
    render(<Input maxLength={100} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '100');
  });
});
