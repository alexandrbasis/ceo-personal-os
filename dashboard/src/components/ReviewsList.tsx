'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { ReviewListItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface ReviewsListProps {
  reviews: ReviewListItem[];
  limit?: number;
}

/**
 * Get energy badge color class based on energy level
 * - Green (>7): high energy
 * - Yellow (5-7): medium energy
 * - Red (<5): low energy
 */
function getEnergyBadgeClass(energy: number): string {
  if (energy > 7) {
    return 'bg-green-100 text-green-800';
  } else if (energy >= 5) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-red-100 text-red-800';
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format date for display (e.g., "Dec 31")
 */
function formatDisplayDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMM d');
  } catch {
    return dateStr;
  }
}

/**
 * ReviewsList - Display list of recent daily reviews
 * Features:
 * - Color-coded energy badges
 * - Truncated priority preview
 * - Links to detail pages
 * - Configurable limit (default: 5)
 */
export function ReviewsList({ reviews, limit = 5 }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Start your first daily review!
      </div>
    );
  }

  // Limit displayed reviews
  const displayedReviews = reviews.slice(0, limit);

  return (
    <ul className="space-y-2">
      {displayedReviews.map((review) => (
        <li key={review.date} data-testid="review-item" role="listitem">
          <Link
            href={`/daily/${review.date}`}
            className="block p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Date */}
              <div data-testid="review-date" className="text-sm font-medium">
                {formatDisplayDate(review.date)}
              </div>

              {/* Energy Badge */}
              <span
                data-testid={`energy-badge-${review.energyLevel}`}
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium badge',
                  getEnergyBadgeClass(review.energyLevel)
                )}
              >
                {review.energyLevel}
              </span>
            </div>

            {/* Priority Preview */}
            <p className="mt-2 text-sm text-muted-foreground">
              {truncateText(review.tomorrowPriority)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
