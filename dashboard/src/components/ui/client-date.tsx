/**
 * ClientDate Component
 *
 * A client-only date component that avoids hydration mismatches
 * by rendering dates only on the client side.
 *
 * Key pattern: Uses useState + useEffect to detect client-side,
 * shows placeholder during SSR, real content on client.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  formatDateForForm,
  formatDisplayDate,
} from '@/lib/utils/date-formatting';

export interface ClientDateProps {
  /** The date to display. If not provided, uses current date. */
  date?: Date | string;
  /** Format for display. Defaults to 'short'. */
  format?: 'short' | 'long' | 'iso';
  /** Optional className for styling */
  className?: string;
  /** Placeholder text to show during SSR. Defaults to empty string for minimal layout shift. */
  placeholder?: string;
}

/**
 * Format date according to the specified format type
 */
function formatDate(date: Date, format: 'short' | 'long' | 'iso'): string {
  switch (format) {
    case 'iso':
      return formatDateForForm(date);
    case 'long':
      return formatDisplayDate(date);
    case 'short':
    default:
      return formatDisplayDate(date);
  }
}

/**
 * Parse date input into a Date object
 */
function parseDate(date: Date | string | undefined): Date {
  if (!date) {
    return new Date();
  }
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}

/**
 * A client-only date component that avoids hydration mismatches
 * by rendering dates only on the client side.
 *
 * During SSR, renders a placeholder (or empty span).
 * After hydration, renders the formatted date.
 */
export function ClientDate({
  date,
  format = 'short',
  className,
  placeholder = '',
}: ClientDateProps): React.ReactElement {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is a standard React pattern for detecting client-side hydration.
    // The lint warning about setState in effect is a false positive here because:
    // 1. This only runs once on mount (empty deps array)
    // 2. It's intentionally triggering a single re-render to show client content
    // 3. This is the recommended pattern from React docs for client-only rendering
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // During SSR or before hydration, show placeholder
  if (!mounted) {
    return (
      <span className={className} suppressHydrationWarning>
        {placeholder}
      </span>
    );
  }

  // After hydration, show the actual date
  const parsedDate = parseDate(date);
  const formattedDate = formatDate(parsedDate, format);

  return (
    <span className={className} suppressHydrationWarning>
      {formattedDate}
    </span>
  );
}

export default ClientDate;
