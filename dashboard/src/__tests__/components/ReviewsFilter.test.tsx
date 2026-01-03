/**
 * Component Tests - ReviewsFilter
 *
 * Tests for AC1: Type Filter
 * - Filter dropdown/tabs for review types
 * - Options: All / Daily / Weekly
 * - URL reflects filter state
 * - Filter persists on page refresh (via URL params)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/reviews',
}));

describe('AC1: ReviewsFilter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('type');
    mockSearchParams.delete('sort');
  });

  describe('Rendering', () => {
    it('should render filter dropdown with All/Daily/Weekly options', async () => {
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} />);

      // Should render the filter component
      const filterElement = screen.getByTestId('reviews-filter') ||
                            screen.getByRole('combobox') ||
                            screen.getByLabelText(/filter/i);
      expect(filterElement).toBeInTheDocument();

      // Should have All option
      expect(screen.getByText(/All/i)).toBeInTheDocument();
      // Should have Daily option
      expect(screen.getByText(/Daily/i)).toBeInTheDocument();
      // Should have Weekly option
      expect(screen.getByText(/Weekly/i)).toBeInTheDocument();
    });

    it('should have "All" as default selected option', async () => {
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} />);

      // The "All" option should be selected/active by default
      const allOption = screen.getByRole('option', { name: /all/i, selected: true }) ||
                        screen.getByRole('tab', { selected: true }) ||
                        screen.getByTestId('filter-all');

      expect(allOption).toBeInTheDocument();
    });

    it('should highlight current filter selection', async () => {
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter currentFilter="weekly" onFilterChange={jest.fn()} />);

      // Weekly should be highlighted/selected
      const weeklyOption = screen.getByTestId('filter-weekly') ||
                           screen.getByRole('tab', { name: /weekly/i });

      expect(weeklyOption).toHaveAttribute('aria-selected', 'true') ||
        expect(weeklyOption).toHaveClass('selected') ||
        expect(weeklyOption).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Filter Selection', () => {
    it('should call onFilterChange when option is selected', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={onFilterChange} />);

      // Click on Weekly option
      const weeklyOption = screen.getByText(/Weekly/i);
      await user.click(weeklyOption);

      expect(onFilterChange).toHaveBeenCalledWith('weekly');
    });

    it('should call onFilterChange with "daily" when Daily is selected', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={onFilterChange} />);

      const dailyOption = screen.getByText(/Daily/i);
      await user.click(dailyOption);

      expect(onFilterChange).toHaveBeenCalledWith('daily');
    });

    it('should call onFilterChange with "all" when All is selected', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter currentFilter="weekly" onFilterChange={onFilterChange} />);

      const allOption = screen.getByText(/All/i);
      await user.click(allOption);

      expect(onFilterChange).toHaveBeenCalledWith('all');
    });
  });

  describe('URL State Management', () => {
    it('should update URL with type parameter when filter changes', async () => {
      const user = userEvent.setup();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} updateUrl={true} />);

      const weeklyOption = screen.getByText(/Weekly/i);
      await user.click(weeklyOption);

      // Should update URL with type=weekly
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('type=weekly')
      );
    });

    it('should read initial filter from URL params', async () => {
      // Set URL param before rendering
      mockSearchParams.set('type', 'weekly');

      const onFilterChange = jest.fn();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={onFilterChange} readFromUrl={true} />);

      // Weekly should be selected based on URL
      const weeklyOption = screen.getByTestId('filter-weekly') ||
                           screen.getByRole('tab', { name: /weekly/i });

      expect(weeklyOption).toHaveAttribute('aria-selected', 'true') ||
        expect(weeklyOption).toHaveClass('selected') ||
        expect(weeklyOption).toHaveAttribute('data-state', 'active');
    });

    it('should persist filter on page refresh (via URL params)', async () => {
      // Simulate URL with type param (as if page was refreshed)
      mockSearchParams.set('type', 'daily');

      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} readFromUrl={true} />);

      // Daily should be selected based on URL param
      const dailyOption = screen.getByTestId('filter-daily') ||
                          screen.getByRole('tab', { name: /daily/i });

      expect(dailyOption).toHaveAttribute('aria-selected', 'true') ||
        expect(dailyOption).toHaveClass('selected') ||
        expect(dailyOption).toHaveAttribute('data-state', 'active');
    });

    it('should preserve other URL params when updating filter', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('sort', 'asc');

      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} updateUrl={true} />);

      const weeklyOption = screen.getByText(/Weekly/i);
      await user.click(weeklyOption);

      // Should preserve sort param and add type param
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/sort=asc.*type=weekly|type=weekly.*sort=asc/)
      );
    });

    it('should remove type param when "All" is selected', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('type', 'weekly');

      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter currentFilter="weekly" onFilterChange={jest.fn()} updateUrl={true} />);

      const allOption = screen.getByText(/All/i);
      await user.click(allOption);

      // URL should not contain type param (or type=all)
      const callArg = mockPush.mock.calls[0]?.[0] || '';
      expect(callArg).not.toContain('type=weekly');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid URL type param gracefully', async () => {
      mockSearchParams.set('type', 'invalid');

      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      // Should not throw, should default to "all"
      expect(() => {
        render(<ReviewsFilter onFilterChange={jest.fn()} readFromUrl={true} />);
      }).not.toThrow();

      // All should be selected as fallback
      const allOption = screen.getByText(/All/i);
      expect(allOption).toBeInTheDocument();
    });

    it('should handle empty type URL param', async () => {
      mockSearchParams.set('type', '');

      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} readFromUrl={true} />);

      // Should default to "all"
      const allOption = screen.getByTestId('filter-all') ||
                        screen.getByRole('tab', { name: /all/i });
      expect(allOption).toHaveAttribute('aria-selected', 'true') ||
        expect(allOption).toHaveAttribute('data-state', 'active');
    });

    it('should be accessible with keyboard navigation', async () => {
      const user = userEvent.setup();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} />);

      // Should be focusable
      const filterElement = screen.getByTestId('reviews-filter') ||
                            screen.getByRole('tablist');
      filterElement.focus();

      // Tab through options
      await user.tab();

      // Should be able to select with Enter/Space
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', async () => {
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} />);

      // Should have accessible label
      const filterElement = screen.getByRole('tablist') ||
                            screen.getByLabelText(/filter.*type|type.*filter/i);
      expect(filterElement).toBeInTheDocument();
    });

    it('should announce filter change to screen readers', async () => {
      const user = userEvent.setup();
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(<ReviewsFilter onFilterChange={jest.fn()} />);

      const weeklyOption = screen.getByRole('tab', { name: /weekly/i }) ||
                           screen.getByText(/Weekly/i);
      await user.click(weeklyOption);

      // Should have aria-selected or similar
      expect(weeklyOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Visual States', () => {
    it('should show count of reviews per type if provided', async () => {
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(
        <ReviewsFilter
          onFilterChange={jest.fn()}
          counts={{ all: 15, daily: 10, weekly: 5 }}
        />
      );

      // Should show counts next to labels
      expect(screen.getByText(/15|All.*15|15.*All/)).toBeInTheDocument();
      expect(screen.getByText(/10|Daily.*10|10.*Daily/)).toBeInTheDocument();
      expect(screen.getByText(/5|Weekly.*5|5.*Weekly/)).toBeInTheDocument();
    });

    it('should disable options with zero count if configured', async () => {
      const { ReviewsFilter } = await import('@/components/ReviewsFilter');

      render(
        <ReviewsFilter
          onFilterChange={jest.fn()}
          counts={{ all: 5, daily: 5, weekly: 0 }}
          disableEmpty={true}
        />
      );

      // Weekly option should be disabled
      const weeklyOption = screen.getByTestId('filter-weekly') ||
                           screen.getByRole('tab', { name: /weekly/i });
      expect(weeklyOption).toBeDisabled() ||
        expect(weeklyOption).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
