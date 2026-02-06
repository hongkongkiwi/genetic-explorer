import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 */

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should display registration link', async ({ page }) => {
    await page.goto('/login');
    
    // Check for register link
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
  });

  test('should display forgot password link', async ({ page }) => {
    await page.goto('/login');
    
    // Check for forgot password link
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/email is required|invalid email/i)).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('should display home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for main content
    await expect(page.getByRole('heading', { name: /genetic explorer/i })).toBeVisible();
  });

  test('should display about page', async ({ page }) => {
    await page.goto('/about');
    
    // Check for about content
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });

  test('should display features page', async ({ page }) => {
    await page.goto('/features');
    
    // Check for features content
    await expect(page.getByRole('heading', { name: /features/i })).toBeVisible();
  });

  test('should display pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for pricing content
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
  });

  test('should display 404 page for unknown routes', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Check for 404 content
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });
});
