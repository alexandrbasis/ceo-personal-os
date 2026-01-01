/**
 * Component Tests - QuickActions Weekly Support
 *
 * Tests for the quick actions component with weekly review support
 * AC1: User can create a new weekly review from dashboard
 * AC4: Quick Actions card shows option for weekly review
 *      Status indicator for weekly review (last completed date)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('QuickActions Component - Weekly Reviews', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  // Mock next/navigation
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Start Weekly Review Button', () => {
    it('should render "Start Weekly Review" button', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      const button = screen.getByRole('button', { name: /start weekly review/i }) ||
                     screen.getByRole('link', { name: /start weekly review/i }) ||
                     screen.getByText(/weekly review/i);
      expect(button).toBeInTheDocument();
    });

    it('should link to /weekly when clicked', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      const button = screen.getByRole('button', { name: /weekly review/i }) ||
                     screen.getByRole('link', { name: /weekly review/i });

      if (button.tagName === 'A') {
        expect(button).toHaveAttribute('href', '/weekly');
      } else {
        await user.click(button);
        expect(mockRouter.push).toHaveBeenCalledWith('/weekly');
      }
    });

    it('should display both daily and weekly review options', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      // Should show both options
      expect(screen.getByText(/daily review/i)).toBeInTheDocument();
      expect(screen.getByText(/weekly review/i)).toBeInTheDocument();
    });
  });

  describe('Weekly Status Indicator', () => {
    it('should show green status when weekly review was completed this week', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      const thisWeekStart = monday.toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={thisWeekStart} />);

      // Should have green indicator for weekly
      const weeklyStatusIndicator = screen.getByTestId('weekly-status-indicator') ||
                                    screen.getByLabelText(/weekly.*status/i);

      expect(weeklyStatusIndicator.className).toMatch(/green|success|complete/i);
    });

    it('should show "Last review: [date]" for weekly review', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate="2025-12-29" />);

      // Should show last weekly review date
      expect(screen.getByText(/last.*week|dec 29|12\/29/i)).toBeInTheDocument();
    });

    it('should show yellow status when weekly review is overdue (7+ days)', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      // 8 days ago
      const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={eightDaysAgo} />);

      const weeklyStatusIndicator = screen.getByTestId('weekly-status-indicator') ||
                                    screen.getByLabelText(/weekly.*status/i);

      // Should show yellow/warning status
      expect(weeklyStatusIndicator.className).toMatch(/yellow|warning|pending/i);
    });

    it('should show red status when weekly review is very overdue (14+ days)', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      // 15 days ago
      const fifteenDaysAgo = new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={fifteenDaysAgo} />);

      const weeklyStatusIndicator = screen.getByTestId('weekly-status-indicator') ||
                                    screen.getByLabelText(/weekly.*status/i);

      // Should show red/danger status
      expect(weeklyStatusIndicator.className).toMatch(/red|error|danger|destructive/i);
    });

    it('should show red status when no weekly reviews exist', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      const weeklyStatusIndicator = screen.getByTestId('weekly-status-indicator') ||
                                    screen.getByLabelText(/weekly.*status/i);

      expect(weeklyStatusIndicator.className).toMatch(/red|error|danger/i);
    });

    it('should show "No weekly reviews yet" when none exist', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      expect(screen.getByText(/no weekly.*yet|never.*weekly/i)).toBeInTheDocument();
    });
  });

  describe('Weekly Review Timing', () => {
    it('should indicate recommended time for weekly review (20 min)', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      // Should show 20 minute estimate for weekly
      expect(screen.getByText(/20 min|20 minutes/i)).toBeInTheDocument();
    });

    it('should show weekly review as distinct from daily review', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      // Both should have separate sections with test IDs
      const dailySection = screen.getByTestId('daily-section');
      const weeklySection = screen.getByTestId('weekly-section');

      expect(dailySection).toBeInTheDocument();
      expect(weeklySection).toBeInTheDocument();
      expect(dailySection).not.toBe(weeklySection);
    });
  });

  describe('Multiple Review Types Layout', () => {
    it('should display daily and weekly in organized layout', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date().toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={today} lastWeeklyReviewDate={thisWeek} />);

      // Should show organized structure with both types
      const container = screen.getByTestId('quick-actions') ||
                        screen.getByRole('region', { name: /quick actions/i });
      expect(container).toBeInTheDocument();

      // Both daily and weekly should be present
      expect(screen.getByText(/daily review/i)).toBeInTheDocument();
      expect(screen.getByText(/weekly review/i)).toBeInTheDocument();
    });

    it('should show independent status for daily and weekly', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const today = new Date().toISOString().split('T')[0];
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={today} lastWeeklyReviewDate={twoWeeksAgo} />);

      // Daily should be green (today) - uses data-testid="status-indicator"
      const dailyStatus = screen.getByTestId('status-indicator');
      expect(dailyStatus.className).toMatch(/green|success/i);

      // Weekly should be red (2 weeks overdue)
      const weeklyStatus = screen.getByTestId('weekly-status-indicator');
      expect(weeklyStatus.className).toMatch(/red|danger/i);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for weekly review button', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      // Button should be keyboard accessible
      const button = screen.getByRole('button', { name: /weekly review/i }) ||
                     screen.getByRole('link', { name: /weekly review/i });
      expect(button).toBeVisible();
    });

    it('should have weekly status indicator with accessible text', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const today = new Date().toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={today} />);

      // Status should be readable by screen readers
      const statusText = screen.getByText(/weekly/i);
      expect(statusText).toBeInTheDocument();
    });

    it('should announce overdue weekly reviews', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={twoWeeksAgo} />);

      // Should have accessible warning about overdue review
      const warning = screen.getByText(/overdue|2 weeks|14 days/i);
      expect(warning).toBeInTheDocument();
    });
  });

  describe('View All Reviews Link', () => {
    it('should have link to view all reviews including weekly filter', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      // Should have view all link
      const viewAllLink = screen.getByRole('link', { name: /view all|all reviews/i });
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink).toHaveAttribute('href', '/reviews');
    });
  });

  describe('Week Number Display', () => {
    it('should show current week number in weekly section', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate={null} lastWeeklyReviewDate={null} />);

      // Should indicate current week (e.g., "Week 1" or "W1")
      const weekIndicator = screen.getByText(/Week \d+|W\d+/i);
      expect(weekIndicator).toBeInTheDocument();
    });
  });
});
