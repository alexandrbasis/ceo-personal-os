/**
 * Component Tests - ReviewsList Weekly Filtering
 *
 * Tests for the reviews list component with weekly review support
 * AC1: Weekly reviews visible in Reviews list (filtered/grouped)
 * AC4: Reviews page filters include weekly type
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeeklyReviewListItem } from '@/lib/types';

describe('ReviewsList Component - Weekly Reviews', () => {
  const mockWeeklyReviews: WeeklyReviewListItem[] = [
    {
      date: '2025-12-29',
      weekNumber: 1,
      movedNeedle: 'Closed the major partnership deal with Acme Corp',
      filePath: '/reviews/weekly/2025-12-29.md',
      type: 'weekly',
    },
    {
      date: '2025-12-22',
      weekNumber: 52,
      movedNeedle: 'Shipped the new product feature to production',
      filePath: '/reviews/weekly/2025-12-22.md',
      type: 'weekly',
    },
    {
      date: '2025-12-15',
      weekNumber: 51,
      movedNeedle: 'Finalized Q4 planning and budget allocation',
      filePath: '/reviews/weekly/2025-12-15.md',
      type: 'weekly',
    },
    {
      date: '2025-12-08',
      weekNumber: 50,
      movedNeedle: 'Hired two new senior engineers for the team',
      filePath: '/reviews/weekly/2025-12-08.md',
      type: 'weekly',
    },
    {
      date: '2025-12-01',
      weekNumber: 49,
      movedNeedle: 'Successfully completed annual performance reviews',
      filePath: '/reviews/weekly/2025-12-01.md',
      type: 'weekly',
    },
    {
      date: '2025-11-24',
      weekNumber: 48,
      movedNeedle: 'Launched customer feedback initiative',
      filePath: '/reviews/weekly/2025-11-24.md',
      type: 'weekly',
    },
  ];

  describe('Weekly Reviews Rendering', () => {
    it('should render weekly reviews in list', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 3)} type="weekly" />);

      // Should render review items
      expect(screen.getByText(/Dec 29/i)).toBeInTheDocument();
      expect(screen.getByText(/Dec 22/i)).toBeInTheDocument();
      expect(screen.getByText(/Dec 15/i)).toBeInTheDocument();
    });

    it('should display week number for each weekly review', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 3)} type="weekly" />);

      // Should show week numbers
      expect(screen.getByText(/Week 1|W1/i)).toBeInTheDocument();
      expect(screen.getByText(/Week 52|W52/i)).toBeInTheDocument();
      expect(screen.getByText(/Week 51|W51/i)).toBeInTheDocument();
    });

    it('should display week date range for each review', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 2)} type="weekly" />);

      // Should show date range like "Dec 29 - Jan 4" or similar format
      // The exact format may vary, but should indicate a week range
      const dateRangeElements = screen.getAllByText(/Dec.*-|Jan.*-/i);
      expect(dateRangeElements.length).toBeGreaterThan(0);
    });

    it('should display "moved needle" preview', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 2)} type="weekly" />);

      // Should show the movedNeedle text (possibly truncated)
      expect(screen.getByText(/partnership deal/i)).toBeInTheDocument();
      expect(screen.getByText(/product feature/i)).toBeInTheDocument();
    });

    it('should link each review to /weekly/[date]', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 2)} type="weekly" />);

      // Each review should be a link
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(2);

      // Links should point to /weekly/[date]
      expect(links[0]).toHaveAttribute('href', expect.stringContaining('/weekly/2025-12-29'));
    });
  });

  describe('Filtering by Type', () => {
    it('should filter by type when type="weekly" prop passed', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      // Mix of daily and weekly reviews
      const mixedReviews = [
        ...mockWeeklyReviews.slice(0, 2),
        {
          date: '2025-12-30',
          energyLevel: 7,
          tomorrowPriority: 'Daily priority',
          filePath: '/reviews/daily/2025-12-30.md',
          type: 'daily' as const,
        },
      ];

      render(<ReviewsList reviews={mixedReviews} type="weekly" />);

      // Should only show weekly reviews when type="weekly"
      expect(screen.getByText(/partnership deal/i)).toBeInTheDocument();
      expect(screen.queryByText(/Daily priority/i)).not.toBeInTheDocument();
    });

    it('should show all reviews when no type filter applied', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      // Mix of daily and weekly reviews
      const mixedReviews = [
        mockWeeklyReviews[0],
        {
          date: '2025-12-30',
          energyLevel: 7,
          tomorrowPriority: 'Daily priority',
          filePath: '/reviews/daily/2025-12-30.md',
          type: 'daily' as const,
        },
      ];

      render(<ReviewsList reviews={mixedReviews} />);

      // Should show both types
      expect(screen.getByText(/partnership deal/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily priority/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show weekly-specific empty state when no weekly reviews', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={[]} type="weekly" />);

      // Should show empty state with weekly-specific messaging
      expect(screen.getByText(/Begin Your Weekly Reviews|No weekly reviews yet/i)).toBeInTheDocument();
    });

    it('should show CTA to create first weekly review', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={[]} type="weekly" />);

      // Should have a link to create weekly review
      const ctaLink = screen.getByRole('link', { name: /Create.*Weekly|Start Weekly/i });
      expect(ctaLink).toHaveAttribute('href', '/weekly');
    });

    it('should display estimated time for weekly reviews', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={[]} type="weekly" />);

      // Should mention ~20 minutes for weekly reviews
      expect(screen.getByText(/20 minutes|20 min/i)).toBeInTheDocument();
    });
  });

  describe('List Limits', () => {
    it('should limit to 5 most recent weekly reviews by default', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews} type="weekly" limit={5} />);

      // Should only show 5 reviews even with 6 in data
      const reviewItems = screen.getAllByRole('listitem') ||
                          screen.getAllByTestId('review-item');
      expect(reviewItems.length).toBe(5);
    });

    it('should respect custom limit prop', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews} type="weekly" limit={3} />);

      const reviewItems = screen.getAllByRole('listitem') ||
                          screen.getAllByTestId('review-item');
      expect(reviewItems.length).toBe(3);
    });
  });

  describe('Week Indicator Badge', () => {
    it('should display week indicator with type badge', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 1)} type="weekly" />);

      // Should have a badge or indicator showing this is a weekly review
      const weeklyBadge = screen.getByTestId('review-type-badge') ||
                          screen.getByText(/weekly/i);
      expect(weeklyBadge).toBeInTheDocument();
    });

    it('should differentiate weekly from daily reviews visually', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      // Show a weekly review
      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 1)} />);

      // Weekly reviews should have distinct visual indicator
      // Could be a badge, icon, or different color scheme
      const weeklyIndicator = screen.getByTestId('weekly-indicator') ||
                              screen.getByLabelText(/weekly review/i);
      expect(weeklyIndicator).toBeInTheDocument();
    });
  });

  describe('Long Content Handling', () => {
    it('should truncate long "moved needle" text', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      const longContentReview: WeeklyReviewListItem[] = [
        {
          date: '2025-12-29',
          weekNumber: 1,
          movedNeedle: 'This is a very long description of what moved the needle this week that should definitely be truncated because it exceeds the maximum display length for the list preview and keeps going on and on',
          filePath: '/reviews/weekly/2025-12-29.md',
          type: 'weekly',
        },
      ];

      render(<ReviewsList reviews={longContentReview} type="weekly" />);

      // Should show truncated text
      const previewText = screen.getByText(/This is a very long/);
      expect(previewText.textContent?.length).toBeLessThan(
        longContentReview[0].movedNeedle.length
      );
    });
  });

  describe('Ordering', () => {
    it('should display reviews in reverse chronological order', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 3)} type="weekly" />);

      const links = screen.getAllByRole('link');

      // First should be most recent (Dec 29)
      expect(links[0]).toHaveAttribute('href', expect.stringContaining('2025-12-29'));
    });
  });

  describe('Accessibility', () => {
    it('should have accessible week labels', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 1)} type="weekly" />);

      // Week number should be accessible
      const weekLabel = screen.getByText(/Week 1|W1/i);
      expect(weekLabel).toBeInTheDocument();
    });

    it('should have proper list semantics', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      render(<ReviewsList reviews={mockWeeklyReviews.slice(0, 3)} type="weekly" />);

      // Should use proper list markup
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const items = screen.getAllByRole('listitem');
      expect(items.length).toBe(3);
    });
  });

  describe('Year Transition', () => {
    it('should handle week 52 to week 1 transition correctly', async () => {
      const { ReviewsList } = await import('@/components/ReviewsList');

      const yearTransitionReviews: WeeklyReviewListItem[] = [
        {
          date: '2026-01-05',
          weekNumber: 1,
          movedNeedle: 'New year first week win',
          filePath: '/reviews/weekly/2026-01-05.md',
          type: 'weekly',
        },
        {
          date: '2025-12-29',
          weekNumber: 52,
          movedNeedle: 'Last week of year win',
          filePath: '/reviews/weekly/2025-12-29.md',
          type: 'weekly',
        },
      ];

      render(<ReviewsList reviews={yearTransitionReviews} type="weekly" />);

      // Both should render correctly
      expect(screen.getByText(/Week 1|W1/i)).toBeInTheDocument();
      expect(screen.getByText(/Week 52|W52/i)).toBeInTheDocument();
    });
  });
});
