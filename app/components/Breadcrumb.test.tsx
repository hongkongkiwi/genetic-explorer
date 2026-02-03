import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, predefinedBreadcrumbs } from './Breadcrumb';

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

describe('Breadcrumb', () => {
  it('renders home link', () => {
    render(<Breadcrumb items={[]} />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });

  it('renders single breadcrumb item', () => {
    render(<Breadcrumb items={[{ label: 'Settings' }]} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toHaveAttribute('aria-current', 'page');
  });

  it('renders multiple breadcrumb items', () => {
    render(
      <Breadcrumb items={[
        { label: 'Reports', href: '/reports' },
        { label: 'Health Report' },
      ]} />
    );
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Health Report')).toBeInTheDocument();
    expect(screen.getByText('Health Report')).toHaveAttribute('aria-current', 'page');
  });

  it('renders link for items with href', () => {
    render(
      <Breadcrumb items={[{ label: 'Reports', href: '/reports' }]} />
    );
    const link = screen.getByText('Reports');
    // Link is rendered (either as Link component or a tag)
    expect(link).toBeInTheDocument();
    expect(link.textContent).toBe('Reports');
  });

  it('renders span for items without href', () => {
    render(
      <Breadcrumb items={[{ label: 'Current Page' }]} />
    );
    const span = screen.getByText('Current Page');
    expect(span.tagName.toLowerCase()).toBe('span');
  });

  it('applies custom className', () => {
    render(<Breadcrumb items={[]} className="custom-breadcrumb" />);
    expect(screen.getByLabelText('Breadcrumb')).toHaveClass('custom-breadcrumb');
  });

  it('has correct ARIA label', () => {
    render(<Breadcrumb items={[]} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });
});

describe('predefinedBreadcrumbs', () => {
  it('returns report breadcrumbs', () => {
    const items = predefinedBreadcrumbs.report('My Genome');
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Reports', href: '/reports' });
    expect(items[1]).toEqual({ label: 'My Genome' });
  });

  it('returns report breadcrumbs with default name', () => {
    const items = predefinedBreadcrumbs.report();
    expect(items[1]).toEqual({ label: 'Health Report' });
  });

  it('returns ancestry breadcrumbs', () => {
    const items = predefinedBreadcrumbs.ancestry('My Ancestry');
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Reports', href: '/reports' });
    expect(items[1]).toEqual({ label: 'My Ancestry' });
  });

  it('returns carrier breadcrumbs', () => {
    const items = predefinedBreadcrumbs.carrier('Cystic Fibrosis');
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Carrier Status', href: '/carrier' });
    expect(items[1]).toEqual({ label: 'Cystic Fibrosis' });
  });

  it('returns settings.root breadcrumbs', () => {
    const items = predefinedBreadcrumbs.settings.root();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ label: 'Settings' });
  });

  it('returns settings.security breadcrumbs', () => {
    const items = predefinedBreadcrumbs.settings.security();
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Settings', href: '/settings' });
    expect(items[1]).toEqual({ label: 'Security' });
  });

  it('returns settings.privacy breadcrumbs', () => {
    const items = predefinedBreadcrumbs.settings.privacy();
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Settings', href: '/settings' });
    expect(items[1]).toEqual({ label: 'Privacy' });
  });

  it('returns settings.sessions breadcrumbs', () => {
    const items = predefinedBreadcrumbs.settings.sessions();
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Settings', href: '/settings' });
    expect(items[1]).toEqual({ label: 'Active Sessions' });
  });

  it('returns settings.twoFactor breadcrumbs', () => {
    const items = predefinedBreadcrumbs.settings.twoFactor();
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: 'Settings', href: '/settings' });
    expect(items[1]).toEqual({ label: 'Two-Factor Authentication' });
  });

  it('returns explorer breadcrumbs', () => {
    const items = predefinedBreadcrumbs.explorer();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ label: 'SNP Explorer' });
  });

  it('returns upload breadcrumbs', () => {
    const items = predefinedBreadcrumbs.upload();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ label: 'Upload Genome' });
  });
});
