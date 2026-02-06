import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 * 
 * These tests require authentication. In a real test environment,
 * you would set up test users or use a mock authentication system.
 */

test.describe('Dashboard (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // If redirected to login, we're not authenticated
    // In a real test, you would authenticate here
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show auth gate
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  // Skip these tests until authentication is set up
  test.skip('should display dashboard stats', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for dashboard elements
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/genomes|reports|sharing/i)).toBeVisible();
  });

  test.skip('should display recent genomes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for recent genomes section
    await expect(page.getByText(/recent genomes|your genomes/i)).toBeVisible();
  });

  test.skip('should display recent reports', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for recent reports section
    await expect(page.getByText(/recent reports|your reports/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation elements
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    
    // Check for main nav links
    await expect(page.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
  });
});
