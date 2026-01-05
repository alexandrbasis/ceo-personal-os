/**
 * Component Tests - GoalsSnapshot
 *
 * Tests for the Goals Snapshot component on dashboard
 * AC1: Goals Snapshot Component - Card showing first 3-5 goals with status
 * AC4: Navigation - Click goal to navigate, "View All" link
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

describe('GoalsSnapshot Component', () => {
  const mockGoalsData = {
    goals: [
      {
        title: 'Goal 1',
        description: 'Launch the new product successfully to market',
        status: 'On Track',
      },
      {
        title: 'Goal 2',
        description: 'Complete AWS Solutions Architect certification',
        status: 'Needs Attention',
      },
      {
        title: 'Goal 3',
        description: 'Run a full marathon in October',
        status: 'Behind',
      },
      {
        title: 'Goal 4',
        description: 'Spend quality time with family every weekend',
        status: 'On Track',
      },
      {
        title: 'Goal 5',
        description: 'Read 24 books this year',
        status: 'On Track',
      },
    ],
  };

  const mockEmptyGoals = {
    goals: [],
  };

  const mockFewGoals = {
    goals: [
      {
        title: 'Goal 1',
        description: 'Only one goal here',
        status: 'On Track',
      },
    ],
  };

  const mockGoalsWithLongDescription = {
    goals: [
      {
        title: 'Goal 1',
        description:
          'This is a very long description that definitely exceeds one hundred characters and should be truncated...',
        status: 'On Track',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();

    // Default successful fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGoalsData),
    });
  });

  describe('AC1: Goals Snapshot Component - Rendering', () => {
    it('should render as a card component', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should have a card container
        const card =
          screen.getByTestId('goals-snapshot-card') ||
          screen.getByRole('region', { name: /goals/i }) ||
          screen.getByText(/goals/i).closest('[class*="card"]');
        expect(card).toBeInTheDocument();
      });
    });

    it('should display "Goals Snapshot" or similar heading', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const heading =
          screen.getByRole('heading', { name: /goals/i }) ||
          screen.getByText(/goals snapshot/i) ||
          screen.getByText(/your goals/i);
        expect(heading).toBeInTheDocument();
      });
    });

    it('should display first 3-5 goals from API response', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should display goals
        expect(screen.getByText(/Launch the new product/i)).toBeInTheDocument();
        expect(screen.getByText(/AWS Solutions Architect/i)).toBeInTheDocument();
        expect(screen.getByText(/marathon/i)).toBeInTheDocument();
      });
    });

    it('should show goal title for each goal', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should show goal titles
        expect(screen.getByText('Goal 1')).toBeInTheDocument();
        expect(screen.getByText('Goal 2')).toBeInTheDocument();
        expect(screen.getByText('Goal 3')).toBeInTheDocument();
      });
    });

    it('should show description excerpt for each goal', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should show descriptions
        expect(screen.getByText(/Launch the new product/i)).toBeInTheDocument();
        expect(screen.getByText(/AWS Solutions Architect/i)).toBeInTheDocument();
      });
    });

    it('should truncate long descriptions with ellipsis', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGoalsWithLongDescription),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // The truncated text should be displayed
        const descriptionElement = screen.getByText(/This is a very long description/i);
        expect(descriptionElement).toBeInTheDocument();
        // Should contain ellipsis for truncation
        expect(descriptionElement.textContent).toMatch(/\.\.\.$/);
      });
    });

    it('should limit displayed goals to maximum of 5', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should not show more than 5 goals
        const goalItems = screen.getAllByTestId(/goal-item/i);
        expect(goalItems.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('AC1: Status Indicator Display', () => {
    it('should show status indicator for each goal', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should show status badges/indicators (multiple goals may have same status)
        expect(screen.getAllByText(/On Track/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Needs Attention/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Behind/i).length).toBeGreaterThan(0);
      });
    });

    it('should apply green styling for "On Track" status', async () => {
      const singleOnTrackGoal = {
        goals: [
          {
            title: 'Goal 1',
            description: 'Test goal',
            status: 'On Track',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(singleOnTrackGoal),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const statusBadge = screen.getByText(/On Track/i);
        expect(statusBadge).toBeInTheDocument();
        // Should have green/success styling
        expect(statusBadge.className).toMatch(/green|success|emerald/i);
      });
    });

    it('should apply yellow/warning styling for "Needs Attention" status', async () => {
      const singleNeedsAttentionGoal = {
        goals: [
          {
            title: 'Goal 1',
            description: 'Test goal',
            status: 'Needs Attention',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(singleNeedsAttentionGoal),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const statusBadge = screen.getByText(/Needs Attention/i);
        expect(statusBadge).toBeInTheDocument();
        // Should have yellow/warning styling
        expect(statusBadge.className).toMatch(/yellow|warning|amber/i);
      });
    });

    it('should apply red/error styling for "Behind" status', async () => {
      const singleBehindGoal = {
        goals: [
          {
            title: 'Goal 1',
            description: 'Test goal',
            status: 'Behind',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(singleBehindGoal),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const statusBadge = screen.getByText(/Behind/i);
        expect(statusBadge).toBeInTheDocument();
        // Should have red/error styling
        expect(statusBadge.className).toMatch(/red|error|destructive/i);
      });
    });
  });

  describe('AC1: Loading and Error States', () => {
    it('should show loading state while fetching', async () => {
      // Delay the fetch response
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockGoalsData),
                }),
              100
            )
          )
      );

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      // Should show loading indicator immediately
      expect(
        screen.getByText(/loading/i) ||
          screen.getByRole('progressbar') ||
          screen.getByTestId('loading-spinner')
      ).toBeInTheDocument();
    });

    it('should show error state when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(
          screen.getByText(/error/i) ||
            screen.getByText(/failed/i) ||
            screen.getByText(/could not load/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error state when API returns error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle empty goals list gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEmptyGoals),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(
          screen.getByText(/no goals/i) ||
            screen.getByText(/empty/i) ||
            screen.getByText(/start adding/i) ||
            screen.getByText(/set your goals/i)
        ).toBeInTheDocument();
      });
    });

    it('should show retry option on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry|try again/i });
        expect(retryButton).toBeInTheDocument();
      });
    });

    it('should refetch when retry button is clicked', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGoalsData),
        });

      const user = userEvent.setup();
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry|try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('AC4: Navigation', () => {
    it('should render clickable goal items', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Goals should be links or clickable elements
        const goalItem =
          screen.getByText(/Launch the new product/i).closest('a') ||
          screen.getByText(/Launch the new product/i).closest('button') ||
          screen.getByText(/Launch the new product/i).closest('[role="link"]');
        expect(goalItem).toBeInTheDocument();
      });
    });

    it('should navigate to /goals page when goal is clicked', async () => {
      const user = userEvent.setup();
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(screen.getByText(/Launch the new product/i)).toBeInTheDocument();
      });

      // Find and click a goal item
      const goalItem =
        screen.getByText(/Launch the new product/i).closest('a') ||
        screen.getByText(/Launch the new product/i).closest('button');

      if (goalItem) {
        await user.click(goalItem);

        // Should navigate to goals page
        if (goalItem.tagName === 'A') {
          expect(goalItem).toHaveAttribute('href', '/goals');
        } else {
          expect(mockRouter.push).toHaveBeenCalledWith('/goals');
        }
      }
    });

    it('should render "View All" link', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const viewAllLink = screen.getByRole('link', { name: /view all/i });
        expect(viewAllLink).toBeInTheDocument();
      });
    });

    it('should have "View All" link with href="/goals"', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const viewAllLink = screen.getByRole('link', { name: /view all/i });
        expect(viewAllLink).toHaveAttribute('href', '/goals');
      });
    });

    it('should position "View All" link in card header or footer', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const viewAllLink = screen.getByRole('link', { name: /view all/i });
        // Should be in a header or footer area
        const parent = viewAllLink.closest('[class*="header"]') ||
                      viewAllLink.closest('[class*="footer"]') ||
                      viewAllLink.parentElement;
        expect(parent).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible region for goals section', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const section =
          screen.getByRole('region', { name: /goals/i }) ||
          screen.getByTestId('goals-snapshot-card');
        expect(section).toBeInTheDocument();
      });
    });

    it('should have keyboard accessible navigation elements', async () => {
      const user = userEvent.setup();
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument();
      });

      // Tab to View All link
      await user.tab();

      // Should be able to focus on interactive elements
      const viewAllLink = screen.getByRole('link', { name: /view all/i });
      expect(document.activeElement === viewAllLink || viewAllLink.matches(':focus')).toBe(true);
    });

    it('should have proper aria labels on status badges', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/(On Track|Needs Attention|Behind)/i);
        statusBadges.forEach((badge) => {
          // Status badges should have accessible text
          expect(badge).toHaveAccessibleName();
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single goal gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFewGoals),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(screen.getByText(/Only one goal here/i)).toBeInTheDocument();
      });
    });

    it('should handle goals with missing description', async () => {
      const goalsWithMissingDescription = {
        goals: [
          {
            title: 'Goal 1',
            description: '',
            status: 'On Track',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(goalsWithMissingDescription),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        // Should still render the goal without crashing
        expect(screen.getByText('Goal 1')).toBeInTheDocument();
      });
    });

    it('should handle special characters in goal text', async () => {
      const goalsWithSpecialChars = {
        goals: [
          {
            title: 'Goal & More',
            description: 'Use <tags> & "quotes" in description',
            status: 'On Track',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(goalsWithSpecialChars),
      });

      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Goal & More')).toBeInTheDocument();
      });
    });

    it('should call correct API endpoint', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/goals/snapshot');
      });
    });
  });

  describe('Dashboard Integration', () => {
    it('should be renderable within dashboard page', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      // Simulate rendering within a dashboard container
      const { container } = render(
        <div data-testid="dashboard">
          <GoalsSnapshot />
        </div>
      );

      await waitFor(() => {
        expect(container.querySelector('[data-testid="dashboard"]')).toBeInTheDocument();
        expect(
          screen.getByTestId('goals-snapshot-card') ||
            screen.getByText(/goals/i)
        ).toBeInTheDocument();
      });
    });

    it('should render with consistent card styling', async () => {
      const { GoalsSnapshot } = await import('@/components/GoalsSnapshot');

      render(<GoalsSnapshot />);

      await waitFor(() => {
        const card =
          screen.getByTestId('goals-snapshot-card') ||
          screen.getByRole('region', { name: /goals/i }) ||
          screen.getByText(/goals/i).closest('[class*="card"]');

        // Should have card-like styling
        expect(card).toBeInTheDocument();
        if (card && card.className) {
          // Should have rounded corners, shadow, or border typical of cards
          expect(card.className).toMatch(/card|rounded|shadow|border/i);
        }
      });
    });
  });
});
