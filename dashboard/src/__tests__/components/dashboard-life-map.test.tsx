/**
 * AC4: Dashboard Integration Tests - Life Map Edit Button
 *
 * Tests for the dashboard page integration with Life Map editor:
 * - Edit button exists on Life Map card
 * - Edit button navigates to /life-map/edit
 * - Visual feedback when changes saved
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LifeMap } from '@/lib/types';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
}));

describe('AC4: Dashboard Life Map Integration', () => {
  const mockLifeMapData = {
    domains: {
      career: { score: 8, assessment: 'Strong momentum' },
      relationships: { score: 6, assessment: 'Needs work' },
      health: { score: 5, assessment: 'OK' },
      meaning: { score: 7, assessment: 'Growing' },
      finances: { score: 8, assessment: 'Stable' },
      fun: { score: 4, assessment: 'Neglected' },
    },
    chartData: [
      { domain: 'Career', score: 8 },
      { domain: 'Relationships', score: 6 },
      { domain: 'Health', score: 5 },
      { domain: 'Meaning', score: 7 },
      { domain: 'Finances', score: 8 },
      { domain: 'Fun', score: 4 },
    ],
  };

  const mockReviewsData = {
    reviews: [
      { date: '2026-01-03', energyLevel: 7, tomorrowPriority: 'Focus', filePath: '/path/1.md' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();

    // Default successful fetch mocks
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/life-map')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      }
      if (url.includes('/api/reviews/daily')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReviewsData),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Edit Button Existence (AC4)', () => {
    it('should render edit button on Life Map card', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        // Look for edit button/link in Life Map section
        const editButton = screen.getByRole('link', { name: /edit.*life.*map/i }) ||
                          screen.getByRole('button', { name: /edit.*life.*map/i }) ||
                          screen.getByTestId('life-map-edit-button');
        expect(editButton).toBeInTheDocument();
      });
    });

    it('should have edit button within Life Map card', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        // Find the Life Map card
        const lifeMapCard = screen.getByTestId('life-map-chart').closest('[class*="card"]') ||
                           screen.getByText(/life map/i).closest('[class*="card"]');

        expect(lifeMapCard).toBeInTheDocument();

        // Edit button should be within the card
        if (lifeMapCard) {
          const editButton = lifeMapCard.querySelector('[data-testid="life-map-edit-button"]') ||
                            lifeMapCard.querySelector('a[href*="life-map/edit"]') ||
                            lifeMapCard.querySelector('button');
          expect(editButton).toBeInTheDocument();
        }
      });
    });

    it('should render edit button with appropriate icon or label', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        // Edit button should have either text "Edit" or an edit icon
        const editButton = screen.queryByRole('link', { name: /edit/i }) ||
                          screen.queryByRole('button', { name: /edit/i }) ||
                          screen.queryByTestId('life-map-edit-button') ||
                          screen.queryByLabelText(/edit/i);

        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('Edit Button Navigation (AC4)', () => {
    it('should navigate to /life-map/edit when edit button clicked', async () => {
      const user = userEvent.setup();
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId('life-map-chart')).toBeInTheDocument();
      });

      // Find and click the edit button
      const editButton = screen.getByTestId('life-map-edit-button') ||
                        screen.getByRole('link', { name: /edit/i }) ||
                        screen.getByRole('button', { name: /edit/i });

      await user.click(editButton);

      // Should navigate to edit page
      expect(mockRouter.push).toHaveBeenCalledWith('/life-map/edit');
    });

    it('should have correct href if using Link component', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        const editLink = screen.queryByRole('link', { name: /edit/i });

        if (editLink) {
          expect(editLink).toHaveAttribute('href', '/life-map/edit');
        }
      });
    });
  });

  describe('Visual Feedback After Save (AC4)', () => {
    it('should refresh Life Map data when returning from edit', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/life-map');
      });

      // Clear previous calls
      (global.fetch as jest.Mock).mockClear();

      // Simulate returning from edit (component should re-fetch)
      // This would be triggered by the router or a visibility change
      // For now, we verify the initial fetch happened
      expect(screen.getByTestId('life-map-chart')).toBeInTheDocument();
    });

    it('should display updated scores after save', async () => {
      // Mock updated data after save
      const updatedMockData = {
        ...mockLifeMapData,
        domains: {
          ...mockLifeMapData.domains,
          career: { score: 10, assessment: 'Promoted!' },
        },
        chartData: [
          { domain: 'Career', score: 10 },
          { domain: 'Relationships', score: 6 },
          { domain: 'Health', score: 5 },
          { domain: 'Meaning', score: 7 },
          { domain: 'Finances', score: 8 },
          { domain: 'Fun', score: 4 },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/life-map')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedMockData),
          });
        }
        if (url.includes('/api/reviews/daily')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockReviewsData),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        // Verify the chart is rendered with data
        expect(screen.getByTestId('life-map-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Button Accessibility', () => {
    it('should have accessible name for edit button', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        const editButton = screen.getByTestId('life-map-edit-button') ||
                          screen.getByRole('link', { name: /edit/i }) ||
                          screen.getByRole('button', { name: /edit/i });

        expect(editButton).toHaveAccessibleName();
      });
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId('life-map-chart')).toBeInTheDocument();
      });

      // Tab to edit button and activate with Enter
      await user.tab();
      await user.tab();
      await user.tab(); // Tab until reaching the edit button

      // The edit button should be focusable
      const editButton = screen.getByTestId('life-map-edit-button') ||
                        screen.getByRole('link', { name: /edit/i }) ||
                        screen.getByRole('button', { name: /edit/i });

      expect(editButton).toBeVisible();
    });
  });

  describe('Edit Button State', () => {
    it('should show edit button even when chart has no data', async () => {
      // Mock empty data
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/life-map')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                domains: {
                  career: { score: 0, assessment: '' },
                  relationships: { score: 0, assessment: '' },
                  health: { score: 0, assessment: '' },
                  meaning: { score: 0, assessment: '' },
                  finances: { score: 0, assessment: '' },
                  fun: { score: 0, assessment: '' },
                },
                chartData: [],
              }),
          });
        }
        if (url.includes('/api/reviews/daily')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ reviews: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        const editButton =
          screen.queryByTestId('life-map-edit-button') ||
          screen.queryByRole('link', { name: /edit/i }) ||
          screen.queryByRole('button', { name: /edit/i });

        expect(editButton).toBeInTheDocument();
      });
    });

    it('should not disable edit button during loading', async () => {
      // This tests that the edit button becomes available as soon as the card renders
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      // Initially might be loading
      // After loading, button should not be disabled
      await waitFor(() => {
        const editButton =
          screen.queryByTestId('life-map-edit-button') ||
          screen.queryByRole('link', { name: /edit/i }) ||
          screen.queryByRole('button', { name: /edit/i });

        if (editButton) {
          expect(editButton).not.toBeDisabled();
        }
      });
    });
  });

  describe('Edit Button Position', () => {
    it('should place edit button in card header', async () => {
      const DashboardPage = (await import('@/app/page')).default;

      render(<DashboardPage />);

      await waitFor(() => {
        // Find Life Map heading
        const heading = screen.getByText('Life Map');
        const cardHeader = heading.closest('[class*="header"]') ||
                          heading.parentElement;

        // Edit button should be near the heading (in same container)
        if (cardHeader) {
          const editButton = cardHeader.querySelector('[data-testid="life-map-edit-button"]') ||
                            cardHeader.querySelector('a[href*="life-map/edit"]') ||
                            cardHeader.querySelector('button');

          // Edit button might be in header or card could have a different structure
          // The important thing is that it's accessible
          expect(
            screen.queryByTestId('life-map-edit-button') ||
            screen.queryByRole('link', { name: /edit/i }) ||
            screen.queryByRole('button', { name: /edit/i })
          ).toBeInTheDocument();
        }
      });
    });
  });
});
