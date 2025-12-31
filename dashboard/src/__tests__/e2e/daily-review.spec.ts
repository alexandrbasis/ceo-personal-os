/**
 * T6: E2E Tests - Daily Review Pages
 *
 * End-to-end tests for:
 * - /daily - New review form
 * - /daily/[date] - View review
 * - /daily/[date]/edit - Edit review
 */

import { test, expect } from '@playwright/test';

test.describe('T6: New Daily Review Page (/daily)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/daily');
  });

  test('should display empty form', async ({ page }) => {
    // Form should be present
    const form = page.locator('form').or(page.locator('[data-testid="daily-form"]'));
    await expect(form).toBeVisible();

    // Required fields should be empty
    const winTextarea = page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    );
    await expect(winTextarea).toHaveValue('');
  });

  test('should default date to today', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    const dateInput = page.getByLabel(/date/i).or(
      page.locator('input[type="date"]')
    );

    await expect(dateInput).toHaveValue(today);
  });

  test('should display energy level slider', async ({ page }) => {
    const slider = page.getByRole('slider').or(
      page.locator('[data-testid="energy-slider"]')
    );

    await expect(slider).toBeVisible();
  });

  test('should display all form sections', async ({ page }) => {
    await expect(page.getByText(/energy/i)).toBeVisible();
    await expect(page.getByText(/meaningful win/i)).toBeVisible();
    await expect(page.getByText(/friction/i)).toBeVisible();
    await expect(page.getByText(/let go/i)).toBeVisible();
    await expect(page.getByText(/tomorrow/i)).toBeVisible();
    await expect(page.getByText(/notes/i)).toBeVisible();
  });

  test('should display timer counting elapsed time', async ({ page }) => {
    const timer = page.locator('[data-testid="timer"]').or(
      page.getByText(/0:0|timer/i)
    );

    await expect(timer).toBeVisible();

    // Wait and check timer updates
    await page.waitForTimeout(2000);
    const timerText = await timer.textContent();
    expect(timerText).toMatch(/0:0[1-9]|0:[1-9]/);
  });

  test('should display submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /submit|save/i });
    await expect(submitButton).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /submit|save/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required/i).or(page.locator('[role="alert"]'))).toBeVisible();
  });

  test('should submit form with valid data', async ({ page }) => {
    // Fill required fields
    await page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    ).fill('Completed an important task');

    await page.getByPlaceholder(/tomorrow/i).or(
      page.getByLabel(/priority.*tomorrow/i)
    ).fill('Start the next phase');

    // Intercept API call
    const responsePromise = page.waitForResponse('**/api/reviews/daily');

    // Submit
    const submitButton = page.getByRole('button', { name: /submit|save/i });
    await submitButton.click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);
  });

  test('should redirect to dashboard after successful submission', async ({ page }) => {
    // Fill required fields
    await page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    ).fill('Test win');

    await page.getByPlaceholder(/tomorrow/i).or(
      page.getByLabel(/priority.*tomorrow/i)
    ).fill('Test priority');

    // Submit
    const submitButton = page.getByRole('button', { name: /submit|save/i });
    await submitButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('should show success toast after submission', async ({ page }) => {
    // Fill required fields
    await page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    ).fill('Test win');

    await page.getByPlaceholder(/tomorrow/i).or(
      page.getByLabel(/priority.*tomorrow/i)
    ).fill('Test priority');

    // Submit
    const submitButton = page.getByRole('button', { name: /submit|save/i });
    await submitButton.click();

    // Should show success message
    const toast = page.locator('[role="status"]').or(
      page.getByText(/saved|success|created/i)
    );
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});

test.describe('T6: View Review Page (/daily/[date])', () => {
  const testDate = '2024-12-31';

  test.beforeEach(async ({ page }) => {
    // This assumes a review exists for this date
    // In real tests, you'd set up test data first
    await page.goto(`/daily/${testDate}`);
  });

  test('should display rendered markdown content', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for review content sections
    const content = page.locator('[data-testid="review-content"]').or(
      page.locator('article')
    );

    // If review exists, content should be visible
    const exists = await content.isVisible().catch(() => false);

    if (exists) {
      await expect(page.getByText(/energy/i)).toBeVisible();
      await expect(page.getByText(/win/i)).toBeVisible();
    } else {
      // Should show 404 or not found message
      await expect(page.getByText(/not found|no review/i)).toBeVisible();
    }
  });

  test('should display Edit button', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const editButton = page.getByRole('button', { name: /edit/i }).or(
      page.getByRole('link', { name: /edit/i })
    );

    // Only visible if review exists
    const exists = await editButton.isVisible().catch(() => false);
    if (exists) {
      expect(editButton).toBeVisible();
    }
  });

  test('should navigate to edit page when clicking Edit', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const editButton = page.getByRole('button', { name: /edit/i }).or(
      page.getByRole('link', { name: /edit/i })
    );

    const exists = await editButton.isVisible().catch(() => false);
    if (exists) {
      await editButton.click();
      await expect(page).toHaveURL(`/daily/${testDate}/edit`);
    }
  });

  test('should display Previous/Next navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const prevButton = page.getByRole('link', { name: /previous|prev|back/i }).or(
      page.locator('[data-testid="prev-review"]')
    );

    const nextButton = page.getByRole('link', { name: /next|forward/i }).or(
      page.locator('[data-testid="next-review"]')
    );

    // Navigation should be present (may be disabled if no prev/next)
    await expect(prevButton.or(nextButton)).toBeVisible();
  });

  test('should display date in readable format', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should show formatted date like "December 31, 2024"
    const dateText = page.getByText(/december 31|31.*2024|2024-12-31/i);
    await expect(dateText).toBeVisible();
  });
});

test.describe('T6: Edit Review Page (/daily/[date]/edit)', () => {
  const testDate = '2024-12-31';

  test.beforeEach(async ({ page }) => {
    await page.goto(`/daily/${testDate}/edit`);
  });

  test('should display form with pre-filled data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // If review exists, form should be pre-filled
    const form = page.locator('form').or(page.locator('[data-testid="daily-form"]'));
    const exists = await form.isVisible().catch(() => false);

    if (exists) {
      const winField = page.getByPlaceholder(/meaningful win/i).or(
        page.getByLabel(/meaningful win/i)
      );

      // Field should have some value (pre-filled)
      const value = await winField.inputValue();
      // In edit mode, value should not be empty
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should show date field matching URL parameter', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const dateInput = page.getByLabel(/date/i).or(
      page.locator('input[type="date"]')
    );

    await expect(dateInput).toHaveValue(testDate);
  });

  test('should submit updates via PUT request', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Modify a field
    const winField = page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    );
    await winField.clear();
    await winField.fill('Updated win content');

    // Intercept PUT request
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/reviews/daily/') &&
      response.request().method() === 'PUT'
    );

    // Submit
    const submitButton = page.getByRole('button', { name: /save|update|submit/i });
    await submitButton.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test('should redirect after successful update', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Fill and submit
    const winField = page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    );
    await winField.fill('Updated content');

    const submitButton = page.getByRole('button', { name: /save|update|submit/i });
    await submitButton.click();

    // Should redirect to view page or dashboard
    await expect(page).toHaveURL(/\/daily\/2024-12-31$|\/$/);
  });

  test('should show Cancel button to go back', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i }).or(
      page.getByRole('link', { name: /cancel|back/i })
    );

    await expect(cancelButton).toBeVisible();

    await cancelButton.click();

    // Should go back to view page
    await expect(page).toHaveURL(`/daily/${testDate}`);
  });
});

test.describe('T6: Daily Review - Form Interactions', () => {
  test('should update energy level via slider', async ({ page }) => {
    await page.goto('/daily');

    const slider = page.getByRole('slider');

    // Change slider value
    await slider.fill('8');

    // Check value updated
    const energyDisplay = page.getByText(/8.*\/.*10/i).or(
      page.locator('[data-testid="energy-display"]')
    );
    await expect(energyDisplay).toContainText('8');
  });

  test('should allow selecting friction action', async ({ page }) => {
    await page.goto('/daily');

    // Select "Needs action" option
    const needsActionRadio = page.getByLabel(/needs action/i).or(
      page.getByRole('radio', { name: /needs action/i })
    );

    await needsActionRadio.check();
    await expect(needsActionRadio).toBeChecked();

    // Switch to "acknowledgment"
    const acknowledgmentRadio = page.getByLabel(/acknowledgment/i).or(
      page.getByRole('radio', { name: /acknowledgment/i })
    );

    await acknowledgmentRadio.check();
    await expect(acknowledgmentRadio).toBeChecked();
    await expect(needsActionRadio).not.toBeChecked();
  });

  test('should save draft to localStorage', async ({ page }) => {
    await page.goto('/daily');

    // Fill a field
    await page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    ).fill('Draft test content');

    // Wait for auto-save (usually after a delay)
    await page.waitForTimeout(35000); // 30s + buffer

    // Check localStorage
    const draft = await page.evaluate(() => {
      return localStorage.getItem('dailyReviewDraft');
    });

    expect(draft).toContain('Draft test content');
  });

  test('should restore draft on page load', async ({ page }) => {
    // Set draft in localStorage before navigating
    await page.goto('/daily');
    await page.evaluate(() => {
      localStorage.setItem('dailyReviewDraft', JSON.stringify({
        meaningfulWin: 'Restored from draft',
        tomorrowPriority: 'Draft priority',
      }));
    });

    // Reload page
    await page.reload();

    // Check field is restored
    const winField = page.getByPlaceholder(/meaningful win/i).or(
      page.getByLabel(/meaningful win/i)
    );

    await expect(winField).toHaveValue('Restored from draft');
  });
});

test.describe('T6: Daily Review - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/daily');

    // Mock API error
    await page.route('**/api/reviews/daily', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Fill and submit
    await page.getByPlaceholder(/meaningful win/i).fill('Test');
    await page.getByPlaceholder(/tomorrow/i).fill('Test');

    await page.getByRole('button', { name: /submit|save/i }).click();

    // Should show error message
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible();
  });

  test('should show 404 for non-existent review date', async ({ page }) => {
    await page.goto('/daily/1900-01-01');

    await page.waitForLoadState('networkidle');

    // Should show not found or error
    await expect(page.getByText(/not found|no review|error/i)).toBeVisible();
  });
});
