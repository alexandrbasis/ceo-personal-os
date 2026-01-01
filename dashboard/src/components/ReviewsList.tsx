'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import type { ReviewListItem, WeeklyReviewListItem, AnyReviewListItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';

export interface ReviewsListProps {
  reviews: ReviewListItem[] | AnyReviewListItem[];
  limit?: number;
  type?: 'daily' | 'weekly';
}

/**
 * Type guard to check if a review is a weekly review
 */
function isWeeklyReview(review: AnyReviewListItem): review is WeeklyReviewListItem {
  return review.type === 'weekly';
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
 * Format week range for display (e.g., "Dec 30 - Jan 5")
 */
function formatWeekRange(dateStr: string): string {
  try {
    const weekStart = parseISO(dateStr);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startMonth = format(weekStart, 'MMM');
    const startDay = format(weekStart, 'd');
    const endMonth = format(weekEnd, 'MMM');
    const endDay = format(weekEnd, 'd');

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  } catch {
    return dateStr;
  }
}

/**
 * ReviewsList - Display list of recent daily or weekly reviews
 * Features:
 * - Color-coded energy badges (daily)
 * - Week number badges (weekly)
 * - Truncated priority/insight preview
 * - Links to detail pages
 * - Configurable limit (default: 5)
 * - Encouraging empty state when no reviews exist
 * - Type filtering: when type="weekly", only shows weekly reviews
 */
export function ReviewsList({ reviews, limit = 5, type = 'daily' }: ReviewsListProps) {
  // Filter reviews by type if specified
  const filteredReviews = type === 'weekly'
    ? (reviews as AnyReviewListItem[]).filter(r => isWeeklyReview(r))
    : reviews;

  if (filteredReviews.length === 0) {
    if (type === 'weekly') {
      return (
        <EmptyState
          icon={CalendarDays}
          title="Begin Your Weekly Reviews"
          message="Weekly reviews take about 20 minutes and help you identify what truly moves the needle. Start building strategic clarity."
          ctaText="Create Weekly Review"
          ctaHref="/weekly"
        />
      );
    }
    return (
      <EmptyState
        icon={CalendarDays}
        title="Begin Your Journey"
        message="Daily reviews take just 2-3 minutes and help you reflect on what matters. Start building your self-awareness practice today."
        ctaText="Create First Review"
        ctaHref="/daily"
      />
    );
  }

  // Limit displayed reviews
  const displayedReviews = filteredReviews.slice(0, limit);

  return (
    <ul className="space-y-2">
      {displayedReviews.map((review) => {
        if (isWeeklyReview(review)) {
          // Weekly review rendering
          return (
            <li key={review.date} data-testid="review-item" role="listitem">
              <Link
                href={`/weekly/${review.date}`}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                aria-label="weekly review"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Week Number Badge */}
                  <span
                    data-testid="weekly-indicator"
                    className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 badge"
                  >
                    W{review.weekNumber}
                  </span>
                  <span data-testid="review-type-badge" className="sr-only">weekly</span>

                  {/* Date Range */}
                  <div data-testid="review-date" className="text-sm font-medium flex-1">
                    {formatWeekRange(review.date)}
                  </div>
                </div>

                {/* Moved Needle Preview */}
                <p className="mt-2 text-sm text-muted-foreground">
                  {truncateText(review.movedNeedle)}
                </p>
              </Link>
            </li>
          );
        }

        // Daily review rendering
        return (
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
        );
      })}
    </ul>
  );
}
