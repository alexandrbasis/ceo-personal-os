/**
 * ClientDate Component (Stub)
 *
 * This component is a placeholder for TDD. It throws "Not implemented"
 * to ensure tests fail for the right reason (missing implementation, not missing module).
 *
 * The real implementation will render dates in a client-only manner to avoid
 * hydration mismatches between server and client.
 */

'use client';

import React from 'react';

export interface ClientDateProps {
  /** The date to display. If not provided, uses current date. */
  date?: Date | string;
  /** Format for display. Defaults to 'short'. */
  format?: 'short' | 'long' | 'iso';
  /** Optional className for styling */
  className?: string;
}

/**
 * A client-only date component that avoids hydration mismatches
 * by rendering dates only on the client side.
 *
 * @throws Not implemented - stub for TDD
 */
export function ClientDate(_props: ClientDateProps): React.ReactElement {
  throw new Error('Not implemented: ClientDate component');
}

export default ClientDate;
