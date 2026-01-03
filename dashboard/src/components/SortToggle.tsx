'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';

export interface SortToggleProps {
  /** Current sort direction */
  currentSort?: SortDirection;
  /** Callback when sort changes */
  onSortChange: (sort: SortDirection) => void;
  /** Whether to update URL when sort changes */
  updateUrl?: boolean;
  /** Whether to read initial sort from URL params */
  readFromUrl?: boolean;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

const VALID_SORTS: SortDirection[] = ['asc', 'desc'];

function isValidSortDirection(sort: string | null): sort is SortDirection {
  return sort !== null && sort !== '' && VALID_SORTS.includes(sort as SortDirection);
}

/**
 * SortToggle - Toggle between Newest First and Oldest First sorting
 *
 * Features:
 * - Toggle button with visual arrow indicator
 * - URL state management via Next.js useSearchParams
 * - Sort persistence across page refresh
 * - Keyboard navigation support (Enter, Space)
 * - Accessible with proper aria labels
 * - Supports both controlled and uncontrolled modes
 */
export function SortToggle({
  currentSort,
  onSortChange,
  updateUrl = false,
  readFromUrl = false,
  disabled = false,
}: SortToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Internal state for uncontrolled mode (only used when not controlled)
  const [internalSort, setInternalSort] = useState<SortDirection>('desc');

  // Derive active sort from props, URL, or internal state
  const activeSort = useMemo((): SortDirection => {
    // Priority 1: Read from URL if readFromUrl is enabled
    if (readFromUrl) {
      const urlSort = searchParams.get('sort');
      if (isValidSortDirection(urlSort)) {
        return urlSort;
      }
      // Invalid or missing URL param defaults to 'desc'
      return 'desc';
    }
    // Priority 2: Use controlled prop if provided
    if (currentSort !== undefined) {
      return currentSort;
    }
    // Priority 3: Use internal state for uncontrolled mode
    return internalSort;
  }, [readFromUrl, searchParams, currentSort, internalSort]);

  const handleToggle = () => {
    if (disabled) return;

    const newSort: SortDirection = activeSort === 'desc' ? 'asc' : 'desc';

    // Update internal state for uncontrolled mode
    setInternalSort(newSort);

    // Notify parent
    onSortChange(newSort);

    if (updateUrl) {
      const params = new URLSearchParams(searchParams.toString());

      if (newSort === 'desc') {
        // Remove sort param when default (desc) is selected
        params.delete('sort');
      } else {
        params.set('sort', newSort);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl);
    }
  };

  const sortLabel = activeSort === 'desc' ? 'Newest First' : 'Oldest First';
  const ariaLabel = `Sort by date: ${sortLabel}. Click to toggle sort direction.`;

  return (
    <Button
      data-testid="sort-toggle"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn('gap-2')}
    >
      {activeSort === 'desc' ? (
        <ArrowDown
          data-testid="sort-desc-indicator"
          aria-label="Sort direction: Newest First"
          className="h-4 w-4"
        />
      ) : (
        <ArrowUp
          data-testid="sort-asc-indicator"
          aria-label="Sort direction: Oldest First"
          className="h-4 w-4"
        />
      )}
      <span data-testid="current-sort">{sortLabel}</span>
      <span data-testid="sort-direction-indicator" aria-hidden="true" className="sr-only" />
    </Button>
  );
}
