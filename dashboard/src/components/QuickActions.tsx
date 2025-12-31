'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickActionsProps {
  lastReviewDate: string | null;
}

/**
 * Calculate days since a given date
 */
function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get status indicator class based on days since last review
 * - Green: reviewed today
 * - Yellow: reviewed yesterday
 * - Red: 2+ days or never
 */
function getStatusClass(daysSince: number | null): string {
  if (daysSince === null) {
    return 'bg-red-500';
  }
  if (daysSince === 0) {
    return 'bg-green-500';
  }
  if (daysSince === 1) {
    return 'bg-yellow-500';
  }
  return 'bg-red-500';
}

/**
 * Get status text based on days since last review
 */
function getStatusText(daysSince: number | null): string {
  if (daysSince === null) {
    return 'No reviews yet';
  }
  if (daysSince === 0) {
    return 'Last review: Today';
  }
  if (daysSince === 1) {
    return 'Last review: Yesterday';
  }
  return `Last review: ${daysSince} days ago`;
}

/**
 * QuickActions - Quick action buttons with review status indicator
 * Features:
 * - "Start Daily Review" button linking to /daily
 * - "View All Reviews" link to /reviews
 * - Color-coded status indicator based on last review date
 */
export function QuickActions({ lastReviewDate }: QuickActionsProps) {
  const router = useRouter();
  const daysSince = lastReviewDate ? getDaysSince(lastReviewDate) : null;
  const statusClass = getStatusClass(daysSince);
  const statusText = getStatusText(daysSince);

  const handleStartReview = () => {
    router.push('/daily');
  };

  return (
    <div className="space-y-4">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div
          data-testid="status-indicator"
          aria-label="Review status"
          className={cn(
            'w-3 h-3 rounded-full',
            statusClass
          )}
        />
        <span className="text-sm text-muted-foreground">{statusText}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={handleStartReview}>Start Daily Review</Button>
        <Button variant="outline" asChild>
          <Link href="/reviews">View All Reviews</Link>
        </Button>
      </div>
    </div>
  );
}
