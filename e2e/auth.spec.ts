import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    // Attempt to access an authenticated route
    await page.goto('/projects');
    
    // Should be redirected to the sign-in page
    await expect(page).toHaveURL(/.*\/login.*/);
    
    // Should display the Login UI
    await expect(page.getByRole('heading', { name: /Login to Launch IQ/i })).toBeVisible();
  });

  test('should load the login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login buttons exist
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  });
});
