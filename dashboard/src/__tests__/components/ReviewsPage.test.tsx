/**
 * Component Tests - ReviewsPage Integration
 *
 * Tests for AC3: Combined View
 * - "All" filter shows all review types together in flat chronological list
 * - Clear type indicator badge per review item (Daily/Weekly)
 * - Flat list only (no grouped view)
 *
 * Also tests integration of AC1 (filter) and AC2 (sort) with the page
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
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

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AC3: ReviewsPage - Combined View', () => {
  const mockDailyReviews = [
    {
      date: '2025-01-03',
      type: 'daily',
      energyLevel: 8,
      tomorrowPriority: 'Complete quarterly planning',
      filePath: '/reviews/daily/2025-01-03.md',
    },
    {
      date: '2025-01-01',
      type: 'daily',
      energyLevel: 7,
      tomorrowPriority: 'Start new project',
      filePath: '/reviews/daily/2025-01-01.md',
    },
  ];

  const mockWeeklyReviews = [
    {
      date: '2025-01-02',
      type: 'weekly',
      weekNumber: 1,
      movedNeedle: 'Closed major partnership deal',
      filePath: '/reviews/weekly/2025-01-02.md',
    },
    {
      date: '2024-12-26',
      type: 'weekly',
      weekNumber: 52,
      movedNeedle: 'Finalized year-end reports',
      filePath: '/reviews/weekly/2024-12-26.md',
    },
  ];

  const mockAllReviews = [
    mockDailyReviews[0], // 2025-01-03
    mockWeeklyReviews[0], // 2025-01-02
    mockDailyReviews[1], // 2025-01-01
    mockWeeklyReviews[1], // 2024-12-26
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('type');
    mockSearchParams.delete('sort');
    mockFetch.mockReset();
  });

  describe('Combined View Rendering', () => {
    it('should display all reviews (daily + weekly) in flat list when type=all', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should show all 4 reviews
        const reviewItems = screen.getAllByTestId('review-item') ||
                            screen.getAllByRole('listitem');
        expect(reviewItems.length).toBe(4);
      });
    });

    it('should show type badge (Daily/Weekly) for each review item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should show Daily badges
        const dailyBadges = screen.getAllByText(/Daily/i);
        expect(dailyBadges.length).toBeGreaterThan(0);

        // Should show Weekly badges
        const weeklyBadges = screen.getAllByText(/Weekly/i);
        expect(weeklyBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display type badge with clear visual distinction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Daily and Weekly badges should be distinguishable
        const dailyBadge = screen.getByTestId('type-badge-daily') ||
                           screen.getAllByText(/Daily/i)[0];
        const weeklyBadge = screen.getByTestId('type-badge-weekly') ||
                            screen.getAllByText(/Weekly/i)[0];

        expect(dailyBadge).toBeInTheDocument();
        expect(weeklyBadge).toBeInTheDocument();
      });
    });

    it('should sort combined list chronologically', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        const reviewItems = screen.getAllByTestId('review-item') ||
                            screen.getAllByRole('listitem');

        // Should be sorted by date descending (newest first)
        // 2025-01-03, 2025-01-02, 2025-01-01, 2024-12-26
        expect(reviewItems[0]).toHaveTextContent(/Jan 3|2025-01-03/);
        expect(reviewItems[1]).toHaveTextContent(/Jan 2|2025-01-02/);
        expect(reviewItems[2]).toHaveTextContent(/Jan 1|2025-01-01/);
        expect(reviewItems[3]).toHaveTextContent(/Dec 26|2024-12-26/);
      });
    });

    it('should display flat list only (no grouped view)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should NOT have group headers like "Daily Reviews" / "Weekly Reviews"
        expect(screen.queryByText(/Daily Reviews/)).not.toBeInTheDocument() ||
          expect(screen.queryByRole('heading', { name: /Daily Reviews/ })).not.toBeInTheDocument();

        // Should be a flat list
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
      });
    });
  });

  describe('Filter Integration (AC1 + AC3)', () => {
    it('should filter to only daily reviews when type=daily', async () => {
      mockSearchParams.set('type', 'daily');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockDailyReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should only show daily reviews
        const reviewItems = screen.getAllByTestId('review-item') ||
                            screen.getAllByRole('listitem');
        expect(reviewItems.length).toBe(2);

        // All should have Daily badge
        reviewItems.forEach(item => {
          expect(within(item).queryByText(/Weekly/i)).not.toBeInTheDocument() ||
            expect(item).toHaveTextContent(/Daily/);
        });
      });

      // Verify API was called with correct params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=daily')
      );
    });

    it('should filter to only weekly reviews when type=weekly', async () => {
      mockSearchParams.set('type', 'weekly');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockWeeklyReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should only show weekly reviews
        const reviewItems = screen.getAllByTestId('review-item') ||
                            screen.getAllByRole('listitem');
        expect(reviewItems.length).toBe(2);

        // All should have Weekly badge
        reviewItems.forEach(item => {
          expect(item).toHaveTextContent(/Weekly|Week/);
        });
      });

      // Verify API was called with correct params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=weekly')
      );
    });

    it('should update view when filter is changed', async () => {
      const user = userEvent.setup();

      // Initial load with all reviews
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(4);
      });

      // Mock the second fetch for weekly only
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockWeeklyReviews }),
      });

      // Click Weekly filter
      const weeklyFilter = screen.getByTestId('filter-weekly') ||
                           screen.getByRole('tab', { name: /weekly/i }) ||
                           screen.getByText(/Weekly/i);
      await user.click(weeklyFilter);

      await waitFor(() => {
        // Should now show only weekly reviews
        const reviewItems = screen.getAllByRole('listitem');
        expect(reviewItems.length).toBe(2);
      });
    });
  });

  describe('Sort Integration (AC2 + AC3)', () => {
    it('should sort combined list ascending when sort=asc', async () => {
      mockSearchParams.set('sort', 'asc');

      const sortedAsc = [...mockAllReviews].sort((a, b) => a.date.localeCompare(b.date));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: sortedAsc }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        const reviewItems = screen.getAllByTestId('review-item') ||
                            screen.getAllByRole('listitem');

        // Should be sorted oldest first
        // 2024-12-26, 2025-01-01, 2025-01-02, 2025-01-03
        expect(reviewItems[0]).toHaveTextContent(/Dec 26|2024-12-26/);
        expect(reviewItems[3]).toHaveTextContent(/Jan 3|2025-01-03/);
      });

      // Verify API was called with sort param
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=asc')
      );
    });

    it('should update order when sort is toggled', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Initially sorted desc
        const first = screen.getAllByRole('listitem')[0];
        expect(first).toHaveTextContent(/Jan 3|2025-01-03/);
      });

      // Mock second fetch with ascending order
      const sortedAsc = [...mockAllReviews].sort((a, b) => a.date.localeCompare(b.date));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: sortedAsc }),
      });

      // Toggle sort
      const sortToggle = screen.getByTestId('sort-toggle') ||
                         screen.getByRole('button', { name: /sort/i });
      await user.click(sortToggle);

      await waitFor(() => {
        // Should now be sorted asc
        const first = screen.getAllByRole('listitem')[0];
        expect(first).toHaveTextContent(/Dec 26|2024-12-26/);
      });
    });
  });

  describe('Combined Filter + Sort', () => {
    it('should integrate filter and sort URL params', async () => {
      mockSearchParams.set('type', 'daily');
      mockSearchParams.set('sort', 'asc');

      const sortedDailyAsc = [...mockDailyReviews].sort((a, b) => a.date.localeCompare(b.date));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: sortedDailyAsc }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        const reviewItems = screen.getAllByRole('listitem');

        // Only daily reviews
        expect(reviewItems.length).toBe(2);

        // Sorted ascending (oldest first)
        expect(reviewItems[0]).toHaveTextContent(/Jan 1|2025-01-01/);
        expect(reviewItems[1]).toHaveTextContent(/Jan 3|2025-01-03/);
      });

      // Verify API called with both params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/type=daily.*sort=asc|sort=asc.*type=daily/)
      );
    });

    it('should update URL when both filter and sort change', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(4);
      });

      // Mock subsequent fetches
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reviews: mockWeeklyReviews }),
      });

      // Change filter
      const weeklyFilter = screen.getByTestId('filter-weekly') ||
                           screen.getByRole('tab', { name: /weekly/i });
      await user.click(weeklyFilter);

      // Change sort
      const sortToggle = screen.getByTestId('sort-toggle') ||
                         screen.getByRole('button', { name: /sort/i });
      await user.click(sortToggle);

      // URL should contain both params
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/type=weekly|sort=asc/)
      );
    });
  });

  describe('Empty States', () => {
    it('should handle empty state for each filter type', async () => {
      mockSearchParams.set('type', 'weekly');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should show empty state specific to weekly
        expect(screen.getByText(/No weekly reviews|Begin Your Weekly/i)).toBeInTheDocument();
      });
    });

    it('should show general empty state when no reviews at all', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should show general empty state
        expect(screen.getByText(/No reviews|Begin Your Journey|Your Review Archive/i)).toBeInTheDocument();
      });
    });

    it('should show CTA to create review in empty state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should have call-to-action link
        const ctaLink = screen.getByRole('link', { name: /Create|Start|New/i });
        expect(ctaLink).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state while fetching', async () => {
      // Never resolve the fetch
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      // Should show loading indicator
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('should show error state on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed|Error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Review Item Content', () => {
    it('should show energy level for daily reviews', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Daily reviews should show energy badge
        expect(screen.getByTestId('energy-badge-8')).toBeInTheDocument();
      });
    });

    it('should show week number for weekly reviews', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Weekly reviews should show week number
        expect(screen.getByText(/W1|Week 1/i)).toBeInTheDocument();
      });
    });

    it('should link daily reviews to /daily/[date]', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [mockDailyReviews[0]] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /Jan 3|2025-01-03/i });
        expect(link).toHaveAttribute('href', '/daily/2025-01-03');
      });
    });

    it('should link weekly reviews to /weekly/[date]', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [mockWeeklyReviews[0]] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/weekly/2025-01-02');
      });
    });
  });

  describe('URL State Persistence', () => {
    it('should load with filter from URL on initial render', async () => {
      mockSearchParams.set('type', 'weekly');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockWeeklyReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should have called API with type=weekly
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('type=weekly')
        );
      });

      // Filter should be set to Weekly
      const weeklyFilter = screen.getByTestId('filter-weekly') ||
                           screen.getByRole('tab', { name: /weekly/i });
      expect(weeklyFilter).toHaveAttribute('aria-selected', 'true') ||
        expect(weeklyFilter).toHaveAttribute('data-state', 'active');
    });

    it('should load with sort from URL on initial render', async () => {
      mockSearchParams.set('sort', 'asc');

      const sortedAsc = [...mockAllReviews].sort((a, b) => a.date.localeCompare(b.date));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: sortedAsc }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should have called API with sort=asc
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('sort=asc')
        );
      });

      // Sort toggle should show "Oldest First"
      expect(screen.getByText(/Oldest.*First/i)).toBeInTheDocument();
    });
  });

  describe('Page Header', () => {
    it('should show page title', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      expect(screen.getByRole('heading', { name: /Reviews|All Reviews/i })).toBeInTheDocument();
    });

    it('should show total count of reviews', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: mockAllReviews }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      await waitFor(() => {
        // Should show count like "(4)" or "4 reviews"
        expect(screen.getByText(/4|four/i)).toBeInTheDocument();
      });
    });

    it('should have back to dashboard link', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reviews: [] }),
      });

      const ReviewsPage = (await import('@/app/reviews/page')).default;
      render(<ReviewsPage />);

      const backLink = screen.getByRole('link', { name: /Back.*Dashboard|Dashboard/i });
      expect(backLink).toHaveAttribute('href', '/');
    });
  });
});
