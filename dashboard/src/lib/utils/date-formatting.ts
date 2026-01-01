/**
 * Date Formatting Utilities (Stub)
 *
 * This module is a placeholder for TDD. All functions throw "Not implemented"
 * to ensure tests fail for the right reason (missing implementation, not missing module).
 *
 * These utilities provide consistent date formatting between SSR and client
 * to prevent hydration mismatches.
 */

/**
 * Format a Date object as YYYY-MM-DD for form input fields
 * This format is locale-independent and consistent across server/client
 * @throws Not implemented - stub for TDD
 */
export function formatDateForForm(_date: Date): string {
  throw new Error('Not implemented: formatDateForForm');
}

/**
 * Format a Date object for human-readable display
 * Uses a fixed format that is consistent regardless of locale
 * @throws Not implemented - stub for TDD
 */
export function formatDisplayDate(_date: Date): string {
  throw new Error('Not implemented: formatDisplayDate');
}

// Alias for backward compatibility with some tests
export const formatDateForDisplay = formatDisplayDate;

/**
 * Get today's date as YYYY-MM-DD string
 * Consistent between server and client rendering
 * @throws Not implemented - stub for TDD
 */
export function getTodayISOString(): string {
  throw new Error('Not implemented: getTodayISOString');
}

/**
 * Compare two ISO date strings
 * @returns negative if date1 < date2, 0 if equal, positive if date1 > date2
 * @throws Not implemented - stub for TDD
 */
export function compareDates(_date1: string, _date2: string): number {
  throw new Error('Not implemented: compareDates');
}

/**
 * Check if a date string represents today
 * @throws Not implemented - stub for TDD
 */
export function isToday(_dateString: string): boolean {
  throw new Error('Not implemented: isToday');
}

/**
 * Parse a YYYY-MM-DD string into a Date object
 * Throws if the format is invalid or the date is invalid
 * @throws Not implemented - stub for TDD
 */
export function parseISODate(_dateString: string): Date {
  throw new Error('Not implemented: parseISODate');
}
