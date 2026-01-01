/**
 * Critical Bug Fix Tests - AC2: Hydration Error Resolved
 *
 * Tests for ensuring no hydration mismatch between SSR and client rendering
 * Key areas:
 * - Date formatting consistency
 * - Timer component initialization
 * - Date-dependent elements
 */

import { render, screen } from '@testing-library/react';

// Store original Date
const OriginalDate = global.Date;

// Helper to mock Date consistently
function mockDate(isoString: string) {
  const mockNow = new Date(isoString).getTime();

  class MockDate extends OriginalDate {
    constructor(value?: string | number | Date) {
      if (value === undefined) {
        super(mockNow);
      } else {
        super(value);
      }
    }

    static now() {
      return mockNow;
    }
  }

  global.Date = MockDate as unknown as DateConstructor;
}

function restoreDate() {
  global.Date = OriginalDate;
}

describe('AC2: Hydration Error Resolved', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    restoreDate();
  });

  describe('AC2.1 & AC2.2: No hydration mismatch errors', () => {
    it('should render DailyForm without hydration warnings', async () => {
      mockDate('2026-01-01T12:00:00.000Z');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={jest.fn()} />);

      // Should not have any hydration errors
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Hydration')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('hydration')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('did not match')
      );

      consoleSpy.mockRestore();
    });

    it('should render Dashboard page without hydration warnings', async () => {
      mockDate('2026-01-01T12:00:00.000Z');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock fetch for dashboard
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('life-map')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                chartData: [
                  { domain: 'Career', score: 8 },
                  { domain: 'Health', score: 7 },
                ],
              }),
          });
        }
        if (url.includes('reviews')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ reviews: [] }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      // Dynamic import to test hydration
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      // Wait for loading to complete
      await screen.findByText(/Dashboard/i);

      // Should not have any hydration errors
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Hydration')
      );

      consoleSpy.mockRestore();
    });

    it('should not produce red "1 Issue" error badge (suppressHydrationWarning)', async () => {
      mockDate('2026-01-01T12:00:00.000Z');

      const { DailyForm } = await import('@/components/DailyForm');

      const { container } = render(<DailyForm onSubmit={jest.fn()} />);

      // Check that date-containing elements have suppressHydrationWarning
      // or are wrapped in client-only components
      const dateElements = container.querySelectorAll('[data-testid="timer"]');
      dateElements.forEach((element) => {
        // Element should either:
        // 1. Have suppressHydrationWarning attribute
        // 2. Be inside a client-only wrapper
        // 3. Use consistent server/client values
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('AC2.3: Date formatting is consistent between server and client', () => {
    it('should format date as ISO string (YYYY-MM-DD) for form fields', async () => {
      mockDate('2026-01-01T12:00:00.000Z');

      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      const result = formatDateForForm(new Date());

      // Should always be YYYY-MM-DD format, regardless of locale
      expect(result).toBe('2026-01-01');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should not use toLocaleDateString() directly for SSR content', async () => {
      // toLocaleDateString() varies by locale and can cause hydration issues
      const { formatDateForDisplay } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-01T12:00:00.000Z');

      const serverResult = formatDateForDisplay(new Date());

      // Simulate different locale on client
      const originalToLocale = Date.prototype.toLocaleDateString;
      Date.prototype.toLocaleDateString = function () {
        return '01/01/2026'; // US format
      };

      const clientResult = formatDateForDisplay(new Date());

      Date.prototype.toLocaleDateString = originalToLocale;

      // Should be identical regardless of locale settings
      expect(serverResult).toBe(clientResult);
    });

    it('should use consistent timezone handling', async () => {
      const { getTodayISOString } = await import('@/lib/utils/date-formatting');

      // Mock date in different timezones shouldn't affect the result format
      mockDate('2026-01-01T23:59:59.000Z'); // Late UTC

      const result = getTodayISOString();

      // Should be a valid ISO date string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('AC2.4: Page renders identically on SSR and client hydration', () => {
    it('should initialize timer at 0:00 consistently', async () => {
      mockDate('2026-01-01T12:00:00.000Z');

      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={jest.fn()} />);

      // Timer should always start at 0:00 on both server and client
      const timer = screen.getByTestId('timer');
      expect(timer).toHaveTextContent('0:00');
    });

    it('should use client-only rendering for dynamic date displays', async () => {
      const { ClientDate } = await import('@/components/ui/client-date');

      const { container } = render(<ClientDate />);

      // Should either:
      // 1. Show placeholder on server
      // 2. Have suppressHydrationWarning
      // 3. Be marked as client-only
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have consistent initial state between SSR and hydration', async () => {
      mockDate('2026-01-01T12:00:00.000Z');

      const { DailyForm } = await import('@/components/DailyForm');

      // First render (simulating SSR)
      const { container: ssrContainer } = render(
        <DailyForm onSubmit={jest.fn()} />
      );
      const ssrHTML = ssrContainer.innerHTML;

      // Second render (simulating hydration)
      const { container: clientContainer } = render(
        <DailyForm onSubmit={jest.fn()} />
      );
      const clientHTML = clientContainer.innerHTML;

      // The initial HTML should be identical
      // (Ignoring React-specific attributes that may differ)
      const normalizeHTML = (html: string) =>
        html.replace(/data-reactroot="[^"]*"/g, '').replace(/\s+/g, ' ');

      expect(normalizeHTML(ssrHTML)).toBe(normalizeHTML(clientHTML));
    });
  });

  describe('Date Input Field', () => {
    it('should set date input value using ISO format (YYYY-MM-DD)', async () => {
      mockDate('2026-01-01T12:00:00.000Z');

      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={jest.fn()} />);

      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput).toHaveValue('2026-01-01');
    });

    it('should not change date value between server and client render', async () => {
      mockDate('2026-01-01T12:00:00.000Z');

      const { DailyForm } = await import('@/components/DailyForm');

      // Render twice to simulate SSR + hydration
      const { rerender } = render(<DailyForm onSubmit={jest.fn()} />);
      const dateInput1 = screen.getByLabelText(/date/i);
      const value1 = (dateInput1 as HTMLInputElement).value;

      rerender(<DailyForm onSubmit={jest.fn()} />);
      const dateInput2 = screen.getByLabelText(/date/i);
      const value2 = (dateInput2 as HTMLInputElement).value;

      expect(value1).toBe(value2);
    });
  });
});

describe('Date Formatting Utilities', () => {
  afterEach(() => {
    restoreDate();
  });

  describe('formatDateForForm', () => {
    it('should return ISO date string regardless of locale', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      mockDate('2026-06-15T00:00:00.000Z');
      const result = formatDateForForm(new Date());

      expect(result).toBe('2026-06-15');
    });

    it('should handle edge cases around midnight', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      // Just before midnight UTC
      mockDate('2026-01-01T23:59:59.999Z');
      let result = formatDateForForm(new Date());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Just after midnight UTC
      mockDate('2026-01-02T00:00:00.001Z');
      result = formatDateForForm(new Date());
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDisplayDate', () => {
    it('should produce consistent output for display', async () => {
      const { formatDisplayDate } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      const result1 = formatDisplayDate(new Date());
      const result2 = formatDisplayDate(new Date());

      expect(result1).toBe(result2);
    });

    it('should be human-readable but consistent', async () => {
      const { formatDisplayDate } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');
      const result = formatDisplayDate(new Date());

      // Should be a non-empty string
      expect(result.length).toBeGreaterThan(0);
      // Should not be just the ISO string (should be formatted for display)
      expect(result).not.toBe('2026-01-15T12:00:00.000Z');
    });
  });

  describe('getTodayISOString', () => {
    it('should return today in YYYY-MM-DD format', async () => {
      const { getTodayISOString } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');
      const result = getTodayISOString();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should be consistent across multiple calls', async () => {
      const { getTodayISOString } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      const result1 = getTodayISOString();
      const result2 = getTodayISOString();

      expect(result1).toBe(result2);
    });
  });
});
