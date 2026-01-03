'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickActionsProps {
  // Support old prop for backward compatibility
  lastReviewDate?: string | null;
  // New props for separate daily/weekly tracking
  lastDailyReviewDate?: string | null;
  lastWeeklyReviewDate?: string | null;
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
 * Get daily status indicator class based on days since last review
 * - Green: reviewed today
 * - Yellow: reviewed yesterday
 * - Red: 2+ days or never
 */
function getDailyStatusClass(daysSince: number | null): string {
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
 * Get weekly status indicator class based on days since last review
 * - Green: within this week (0-6 days)
 * - Yellow: overdue (7-13 days)
 * - Red: very overdue (14+ days) or never
 */
function getWeeklyStatusClass(daysSince: number | null): string {
  if (daysSince === null) {
    return 'bg-red-500';
  }
  if (daysSince < 7) {
    return 'bg-green-500';
  }
  if (daysSince < 14) {
    return 'bg-yellow-500';
  }
  return 'bg-red-500';
}

/**
 * Get status text based on days since last daily review
 */
function getDailyStatusText(daysSince: number | null): string {
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
 * Get status text based on days since last weekly review
 */
function getWeeklyStatusText(daysSince: number | null, lastDate: string | null): string {
  if (daysSince === null || !lastDate) {
    return 'No weekly yet';
  }
  if (daysSince === 0) {
    return 'Completed today';
  }
  // Format the date for display
  const date = new Date(lastDate);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  if (daysSince >= 14) {
    return `Overdue - Last: ${month} ${day}`;
  }
  return `Last: ${month} ${day}`;
}

/**
 * Get the current ISO week number
 */
function getCurrentWeekNumber(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * QuickActions - Quick action buttons with review status indicators
 * Features:
 * - "Start Daily Review" button linking to /daily
 * - "Start Weekly Review" button linking to /weekly
 * - "View All Reviews" link to /reviews
 * - Color-coded status indicators for both daily and weekly reviews
 * - Week number display
 */
export function QuickActions({ lastReviewDate, lastDailyReviewDate, lastWeeklyReviewDate }: QuickActionsProps) {
  const router = useRouter();

  // Use lastDailyReviewDate if provided, fall back to lastReviewDate for backward compatibility
  const effectiveDailyDate = lastDailyReviewDate ?? lastReviewDate ?? null;
  const dailyDaysSince = effectiveDailyDate ? getDaysSince(effectiveDailyDate) : null;
  const dailyStatusClass = getDailyStatusClass(dailyDaysSince);
  const dailyStatusText = getDailyStatusText(dailyDaysSince);

  // Weekly review status
  const weeklyDaysSince = lastWeeklyReviewDate ? getDaysSince(lastWeeklyReviewDate) : null;
  const weeklyStatusClass = getWeeklyStatusClass(weeklyDaysSince);
  const weeklyStatusText = getWeeklyStatusText(weeklyDaysSince, lastWeeklyReviewDate ?? null);

  const currentWeek = getCurrentWeekNumber();

  const handleStartDailyReview = () => {
    router.push('/daily');
  };

  const handleStartWeeklyReview = () => {
    router.push('/weekly');
  };

  return (
    <div data-testid="quick-actions" className="space-y-6">
      {/* Daily Review Section */}
      <div data-testid="daily-section" className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            data-testid="status-indicator"
            aria-label="status"
            className={cn(
              'w-3 h-3 rounded-full',
              dailyStatusClass
            )}
          />
          <span className="text-sm text-muted-foreground">{dailyStatusText}</span>
          <span className="text-xs text-muted-foreground">~3 min</span>
        </div>
        <Button onClick={handleStartDailyReview}>Start Daily Review</Button>
      </div>

      {/* Weekly Review Section */}
      <div data-testid="weekly-section" className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            data-testid="weekly-status-indicator"
            aria-label="Weekly review status"
            className={cn(
              'w-3 h-3 rounded-full',
              weeklyStatusClass
            )}
          />
          <span className="text-sm text-muted-foreground">{weeklyStatusText}</span>
          <span className="text-xs text-muted-foreground">~20 min</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded">W{currentWeek}</span>
        </div>
        <Button onClick={handleStartWeeklyReview}>Start Weekly Review</Button>
      </div>

      {/* Goals Section */}
      <div data-testid="goals-section" className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">View & edit your goals</span>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/goals">Goals (1/3/10 Year)</Link>
        </Button>
      </div>

      {/* North Star Section */}
      <div data-testid="north-star-section" className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Your core direction</span>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/north-star">North Star</Link>
        </Button>
      </div>

      {/* View All Link */}
      <div className="pt-2 border-t">
        <Button variant="outline" asChild>
          <Link href="/reviews">View All Reviews</Link>
        </Button>
      </div>
    </div>
  );
}
