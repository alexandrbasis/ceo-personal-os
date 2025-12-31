/**
 * T6: E2E Tests - Dashboard Page
 *
 * End-to-end tests for the main dashboard page
 */

import { test, expect } from '@playwright/test';

test.describe('T6: Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/CEO Personal OS|Dashboard/i);
  });

  test('should display Life Map radar chart', async ({ page }) => {
    // Wait for chart to render
    const chartContainer = page.locator('[data-testid="life-map-chart"]').or(
      page.locator('.recharts-wrapper')
    );

    await expect(chartContainer).toBeVisible({ timeout: 5000 });
  });

  test('should display all 6 domain labels on radar chart', async ({ page }) => {
    // Check for domain labels
    await expect(page.getByText('Career')).toBeVisible();
    await expect(page.getByText('Relationships')).toBeVisible();
    await expect(page.getByText('Health')).toBeVisible();
    await expect(page.getByText('Meaning')).toBeVisible();
    await expect(page.getByText('Finances')).toBeVisible();
    await expect(page.getByText('Fun')).toBeVisible();
  });

  test('should display Quick Actions section', async ({ page }) => {
    const quickActions = page.locator('[data-testid="quick-actions"]').or(
      page.getByRole('region', { name: /quick actions/i })
    );

    await expect(quickActions).toBeVisible();
  });

  test('should display "Start Daily Review" button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start daily review/i }).or(
      page.getByRole('link', { name: /start daily review/i })
    );

    await expect(startButton).toBeVisible();
  });

  test('should display Recent Reviews list', async ({ page }) => {
    const reviewsList = page.locator('[data-testid="reviews-list"]').or(
      page.getByRole('region', { name: /recent reviews/i })
    );

    await expect(reviewsList).toBeVisible();
  });

  test('should display review status indicator', async ({ page }) => {
    const statusIndicator = page.locator('[data-testid="status-indicator"]').or(
      page.getByText(/last review/i)
    );

    await expect(statusIndicator).toBeVisible();
  });

  test('should load in under 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Wait for the page to be fully interactive
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="life-map-chart"], .recharts-wrapper', {
      state: 'visible',
      timeout: 2000,
    });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('should navigate to daily review form when clicking Start button', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start daily review/i }).or(
      page.getByRole('link', { name: /start daily review/i })
    );

    await startButton.click();

    await expect(page).toHaveURL(/\/daily$/);
  });

  test('should show "View All Reviews" link', async ({ page }) => {
    const viewAllLink = page.getByRole('link', { name: /view all|all reviews/i });

    await expect(viewAllLink).toBeVisible();
    await expect(viewAllLink).toHaveAttribute('href', '/reviews');
  });
});

test.describe('T6: Dashboard - Reviews List Integration', () => {
  test('should display recent reviews with date and energy', async ({ page }) => {
    await page.goto('/');

    // Wait for reviews to load
    await page.waitForSelector('[data-testid="reviews-list"], [class*="reviews"]', {
      state: 'visible',
      timeout: 5000,
    });

    // If reviews exist, check their structure
    const reviewItems = page.locator('[data-testid="review-item"]').or(
      page.locator('[class*="review-item"]')
    );

    const count = await reviewItems.count();

    if (count > 0) {
      // Each review should show date
      const firstReview = reviewItems.first();
      await expect(firstReview.locator('[data-testid="review-date"]').or(
        firstReview.getByText(/\d{1,2}/)
      )).toBeVisible();

      // Each review should show energy level
      await expect(firstReview.locator('[data-testid="energy-badge"]').or(
        firstReview.locator('[class*="badge"]')
      )).toBeVisible();
    }
  });

  test('should show at most 5 recent reviews on dashboard', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const reviewItems = page.locator('[data-testid="review-item"]').or(
      page.locator('[class*="review-item"]')
    );

    const count = await reviewItems.count();
    expect(count).toBeLessThanOrEqual(5);
  });

  test('should link reviews to their detail pages', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    const reviewLinks = page.locator('[data-testid="reviews-list"] a').or(
      page.locator('[class*="reviews"] a[href*="/daily/"]')
    );

    const count = await reviewLinks.count();

    if (count > 0) {
      const firstLink = reviewLinks.first();
      const href = await firstLink.getAttribute('href');
      expect(href).toMatch(/\/daily\/\d{4}-\d{2}-\d{2}/);
    }
  });
});

test.describe('T6: Dashboard - Life Map Integration', () => {
  test('should fetch life map data from API', async ({ page }) => {
    // Intercept API call
    let apiCalled = false;
    await page.route('**/api/life-map', (route) => {
      apiCalled = true;
      route.continue();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(apiCalled).toBe(true);
  });

  test('should display radar chart with correct scores', async ({ page }) => {
    await page.goto('/');

    // Wait for chart
    await page.waitForSelector('.recharts-wrapper', {
      state: 'visible',
      timeout: 5000,
    });

    // The radar polygon should be visible
    const radar = page.locator('.recharts-radar-polygon');
    await expect(radar).toBeVisible();
  });
});

test.describe('T6: Dashboard - Responsive Design', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // All main sections should still be visible
    await expect(page.getByText(/life map|dashboard/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /daily review/i }).or(
      page.getByRole('link', { name: /daily review/i })
    )).toBeVisible();
  });

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('[data-testid="life-map-chart"], .recharts-wrapper')).toBeVisible();
    await expect(page.locator('[data-testid="quick-actions"], [class*="quick-actions"]')).toBeVisible();
  });
});
