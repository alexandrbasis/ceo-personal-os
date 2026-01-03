'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type ReviewFilterType = 'all' | 'daily' | 'weekly';

export interface ReviewsFilterProps {
  /** Current selected filter type */
  currentFilter?: ReviewFilterType;
  /** Callback when filter changes */
  onFilterChange: (filter: ReviewFilterType) => void;
  /** Whether to update URL when filter changes */
  updateUrl?: boolean;
  /** Whether to read initial filter from URL params */
  readFromUrl?: boolean;
  /** Optional counts for each filter type */
  counts?: {
    all: number;
    daily: number;
    weekly: number;
  };
  /** Whether to disable filter options with zero count */
  disableEmpty?: boolean;
}

const VALID_TYPES: ReviewFilterType[] = ['all', 'daily', 'weekly'];

function isValidFilterType(type: string | null): type is ReviewFilterType {
  return type !== null && VALID_TYPES.includes(type as ReviewFilterType);
}

/**
 * ReviewsFilter - Filter tabs for review types (All/Daily/Weekly)
 *
 * Features:
 * - Tab-based filter UI with accessible aria attributes
 * - URL state management via Next.js useSearchParams
 * - Filter persistence across page refresh
 * - Optional display of review counts per type
 * - Keyboard navigation support
 * - Supports both controlled and uncontrolled modes
 */
export function ReviewsFilter({
  currentFilter,
  onFilterChange,
  updateUrl = false,
  readFromUrl = false,
  counts,
  disableEmpty = false,
}: ReviewsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Determine initial filter from URL or props
  const getInitialFilter = (): ReviewFilterType => {
    if (readFromUrl) {
      const urlType = searchParams.get('type');
      if (isValidFilterType(urlType)) {
        return urlType;
      }
    }
    return currentFilter || 'all';
  };

  // Internal state for uncontrolled mode
  const [internalFilter, setInternalFilter] = useState<ReviewFilterType>(getInitialFilter);

  // Sync internal state with currentFilter prop when it changes
  useEffect(() => {
    if (currentFilter !== undefined) {
      setInternalFilter(currentFilter);
    }
  }, [currentFilter]);

  // Sync with URL params when readFromUrl is enabled
  useEffect(() => {
    if (readFromUrl) {
      const urlType = searchParams.get('type');
      if (isValidFilterType(urlType)) {
        setInternalFilter(urlType);
      } else {
        setInternalFilter('all');
      }
    }
  }, [readFromUrl, searchParams]);

  // Use internal state as the active filter
  const activeFilter = internalFilter;

  const handleFilterChange = (value: string) => {
    const filterValue = value as ReviewFilterType;

    // Update internal state for uncontrolled mode
    setInternalFilter(filterValue);

    // Notify parent
    onFilterChange(filterValue);

    if (updateUrl) {
      const params = new URLSearchParams(searchParams.toString());

      if (filterValue === 'all') {
        // Remove type param when "All" is selected
        params.delete('type');
      } else {
        params.set('type', filterValue);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl);
    }
  };

  const isDisabled = (type: ReviewFilterType): boolean => {
    if (!disableEmpty || !counts) return false;
    return counts[type] === 0;
  };

  const getLabel = (type: ReviewFilterType, label: string): string => {
    if (counts) {
      return `${label} (${counts[type]})`;
    }
    return label;
  };

  return (
    <Tabs
      data-testid="reviews-filter"
      value={activeFilter}
      onValueChange={handleFilterChange}
      aria-label="Filter by type"
    >
      <TabsList role="tablist" aria-label="Filter by review type">
        <TabsTrigger
          value="all"
          data-testid="filter-all"
          role="tab"
          aria-selected={activeFilter === 'all'}
          disabled={isDisabled('all')}
          aria-disabled={isDisabled('all') || undefined}
          className={cn(activeFilter === 'all' && 'selected')}
        >
          {getLabel('all', 'All')}
        </TabsTrigger>
        <TabsTrigger
          value="daily"
          data-testid="filter-daily"
          role="tab"
          aria-selected={activeFilter === 'daily'}
          disabled={isDisabled('daily')}
          aria-disabled={isDisabled('daily') || undefined}
          className={cn(activeFilter === 'daily' && 'selected')}
        >
          {getLabel('daily', 'Daily')}
        </TabsTrigger>
        <TabsTrigger
          value="weekly"
          data-testid="filter-weekly"
          role="tab"
          aria-selected={activeFilter === 'weekly'}
          disabled={isDisabled('weekly')}
          aria-disabled={isDisabled('weekly') || undefined}
          className={cn(activeFilter === 'weekly' && 'selected')}
        >
          {getLabel('weekly', 'Weekly')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
