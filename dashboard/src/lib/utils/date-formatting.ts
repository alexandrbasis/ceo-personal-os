/**
 * Date Formatting Utilities
 *
 * These utilities provide consistent date formatting between SSR and client
 * to prevent hydration mismatches.
 *
 * Key principle: All functions use UTC-based formatting to ensure identical
 * output regardless of the runtime environment's timezone or locale settings.
 */

/**
 * Format a Date object as YYYY-MM-DD for form input fields
 * This format is locale-independent and consistent across server/client
 */
export function formatDateForForm(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object for human-readable display
 * Uses a fixed format that is consistent regardless of locale
 * Format: "Jan 15, 2026"
 */
export function formatDisplayDate(date: Date): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const year = date.getUTCFullYear();
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();

  return `${month} ${day}, ${year}`;
}

// Alias for backward compatibility with some tests
export const formatDateForDisplay = formatDisplayDate;

/**
 * Get today's date as YYYY-MM-DD string
 * Consistent between server and client rendering
 */
export function getTodayISOString(): string {
  return formatDateForForm(new Date());
}

/**
 * Compare two ISO date strings
 * @returns negative if date1 < date2, 0 if equal, positive if date1 > date2
 */
export function compareDates(date1: string, date2: string): number {
  // ISO date strings (YYYY-MM-DD) can be compared lexicographically
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

/**
 * Check if a date string represents today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayISOString();
}

/**
 * Parse a YYYY-MM-DD string into a Date object
 * Throws if the format is invalid or the date is invalid
 */
export function parseISODate(dateString: string): Date {
  // Validate format: YYYY-MM-DD
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    throw new Error(`Invalid date format: "${dateString}". Expected YYYY-MM-DD.`);
  }

  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Validate ranges
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
  }

  // Check day validity for the given month/year
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    throw new Error(
      `Invalid day: ${day}. Must be between 1 and ${daysInMonth} for ${year}-${monthStr}.`
    );
  }

  // Create date at noon UTC to avoid timezone edge cases
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}
