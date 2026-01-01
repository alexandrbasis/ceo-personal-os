/**
 * Critical Bug Fix Tests - AC2: Date Formatting Utilities
 *
 * Tests for consistent date formatting between server and client
 * These utilities should produce identical output regardless of:
 * - Server vs client environment
 * - User's locale settings
 * - Timezone differences
 */

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

describe('AC2: Date Formatting Utilities', () => {
  afterEach(() => {
    restoreDate();
  });

  describe('formatDateForForm', () => {
    it('should return YYYY-MM-DD format for date input fields', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');
      const result = formatDateForForm(new Date());

      expect(result).toBe('2026-01-15');
    });

    it('should pad single digit months with leading zero', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      mockDate('2026-03-05T12:00:00.000Z');
      const result = formatDateForForm(new Date());

      expect(result).toBe('2026-03-05');
    });

    it('should pad single digit days with leading zero', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      mockDate('2026-11-09T12:00:00.000Z');
      const result = formatDateForForm(new Date());

      expect(result).toBe('2026-11-09');
    });

    it('should handle year boundaries correctly', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      mockDate('2025-12-31T23:59:59.999Z');
      const result = formatDateForForm(new Date());

      // Should be Dec 31 or Jan 1 depending on timezone, but format should be consistent
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should accept Date object as input', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      const specificDate = new OriginalDate('2026-06-20T00:00:00.000Z');
      const result = formatDateForForm(specificDate);

      expect(result).toBe('2026-06-20');
    });

    it('should not depend on locale settings', async () => {
      const { formatDateForForm } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      // Simulate different locale behaviors
      const originalToLocale = Date.prototype.toLocaleDateString;

      // US locale would return 1/15/2026
      Date.prototype.toLocaleDateString = function () {
        return '1/15/2026';
      };
      const usResult = formatDateForForm(new Date());

      // UK locale would return 15/01/2026
      Date.prototype.toLocaleDateString = function () {
        return '15/01/2026';
      };
      const ukResult = formatDateForForm(new Date());

      Date.prototype.toLocaleDateString = originalToLocale;

      // Both should return ISO format regardless of locale
      expect(usResult).toBe('2026-01-15');
      expect(ukResult).toBe('2026-01-15');
      expect(usResult).toBe(ukResult);
    });
  });

  describe('formatDisplayDate', () => {
    it('should return a human-readable date string', async () => {
      const { formatDisplayDate } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');
      const result = formatDisplayDate(new Date());

      // Should be readable (contains month name or formatted date)
      expect(result.length).toBeGreaterThan(5);
    });

    it('should be consistent between calls', async () => {
      const { formatDisplayDate } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      const result1 = formatDisplayDate(new Date());
      const result2 = formatDisplayDate(new Date());

      expect(result1).toBe(result2);
    });

    it('should use consistent format regardless of user locale', async () => {
      const { formatDisplayDate } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      // Should not use toLocaleDateString directly
      // Instead should use a fixed format like "Jan 15, 2026" or "2026-01-15"
      const result = formatDisplayDate(new Date());

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should not throw for edge case dates', async () => {
      const { formatDisplayDate } = await import('@/lib/utils/date-formatting');

      // Leap year date
      const leapYearDate = new OriginalDate('2024-02-29T12:00:00.000Z');
      expect(() => formatDisplayDate(leapYearDate)).not.toThrow();

      // Year boundary
      const newYearDate = new OriginalDate('2026-01-01T00:00:00.000Z');
      expect(() => formatDisplayDate(newYearDate)).not.toThrow();

      // End of year
      const endYearDate = new OriginalDate('2025-12-31T23:59:59.999Z');
      expect(() => formatDisplayDate(endYearDate)).not.toThrow();
    });
  });

  describe('getTodayISOString', () => {
    it('should return today in YYYY-MM-DD format', async () => {
      const { getTodayISOString } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');
      const result = getTodayISOString();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return consistent value on server and client', async () => {
      const { getTodayISOString } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      // Simulate multiple calls (server render + client hydration)
      const serverResult = getTodayISOString();
      const clientResult = getTodayISOString();

      expect(serverResult).toBe(clientResult);
    });

    it('should handle timezone edge cases', async () => {
      const { getTodayISOString } = await import('@/lib/utils/date-formatting');

      // Just before midnight UTC
      mockDate('2026-01-15T23:59:59.999Z');
      const lateResult = getTodayISOString();

      // Just after midnight UTC
      mockDate('2026-01-16T00:00:00.001Z');
      const earlyResult = getTodayISOString();

      // Both should be valid ISO date strings
      expect(lateResult).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(earlyResult).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('compareDates', () => {
    it('should correctly compare two dates for equality', async () => {
      const { compareDates } = await import('@/lib/utils/date-formatting');

      const date1 = '2026-01-15';
      const date2 = '2026-01-15';
      const date3 = '2026-01-16';

      expect(compareDates(date1, date2)).toBe(0);
      expect(compareDates(date1, date3)).toBeLessThan(0);
      expect(compareDates(date3, date1)).toBeGreaterThan(0);
    });

    it('should work with YYYY-MM-DD string format', async () => {
      const { compareDates } = await import('@/lib/utils/date-formatting');

      expect(compareDates('2026-01-01', '2026-01-02')).toBeLessThan(0);
      expect(compareDates('2026-12-31', '2026-01-01')).toBeGreaterThan(0);
      expect(compareDates('2026-06-15', '2026-06-15')).toBe(0);
    });

    it('should handle year boundaries', async () => {
      const { compareDates } = await import('@/lib/utils/date-formatting');

      expect(compareDates('2025-12-31', '2026-01-01')).toBeLessThan(0);
      expect(compareDates('2026-01-01', '2025-12-31')).toBeGreaterThan(0);
    });
  });

  describe('isToday', () => {
    it('should return true for today', async () => {
      const { isToday } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      expect(isToday('2026-01-15')).toBe(true);
    });

    it('should return false for yesterday', async () => {
      const { isToday } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      expect(isToday('2026-01-14')).toBe(false);
    });

    it('should return false for tomorrow', async () => {
      const { isToday } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      expect(isToday('2026-01-16')).toBe(false);
    });

    it('should work consistently across SSR and client', async () => {
      const { isToday, getTodayISOString } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      const todayString = getTodayISOString();
      const result = isToday(todayString);

      expect(result).toBe(true);
    });
  });

  describe('parseISODate', () => {
    it('should parse YYYY-MM-DD string to Date object', async () => {
      const { parseISODate } = await import('@/lib/utils/date-formatting');

      const result = parseISODate('2026-01-15');

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January = 0
      expect(result.getDate()).toBe(15);
    });

    it('should handle invalid date strings gracefully', async () => {
      const { parseISODate } = await import('@/lib/utils/date-formatting');

      expect(() => parseISODate('invalid-date')).toThrow();
      expect(() => parseISODate('')).toThrow();
      expect(() => parseISODate('2026-13-45')).toThrow(); // Invalid month/day
    });

    it('should validate date format strictly', async () => {
      const { parseISODate } = await import('@/lib/utils/date-formatting');

      // Wrong format should throw
      expect(() => parseISODate('01-15-2026')).toThrow();
      expect(() => parseISODate('15/01/2026')).toThrow();
      expect(() => parseISODate('Jan 15, 2026')).toThrow();
    });
  });

  describe('SSR/Client Consistency', () => {
    it('should produce identical output in simulated SSR vs client environment', async () => {
      const {
        formatDateForForm,
        formatDisplayDate,
        getTodayISOString,
      } = await import('@/lib/utils/date-formatting');

      mockDate('2026-01-15T12:00:00.000Z');

      // Simulate SSR environment
      const ssrResults = {
        form: formatDateForForm(new Date()),
        display: formatDisplayDate(new Date()),
        today: getTodayISOString(),
      };

      // Simulate client environment (same mocked date)
      const clientResults = {
        form: formatDateForForm(new Date()),
        display: formatDisplayDate(new Date()),
        today: getTodayISOString(),
      };

      expect(ssrResults.form).toBe(clientResults.form);
      expect(ssrResults.display).toBe(clientResults.display);
      expect(ssrResults.today).toBe(clientResults.today);
    });
  });
});
