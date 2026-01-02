/**
 * Component Tests - GoalsPage
 *
 * Tests for the goals page component with tabs
 * AC1: Goals Page - Page at /goals with tabs for 1-year, 3-year, 10-year
 * AC4: Goal Tracking - Status badges and links to quarterly reviews
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('GoalsPage Component', () => {
  const mockGoalContent = `---
status: on-track
last_updated: 2026-01-02
---

# One-Year Goals

**Year:** 2026
**Created:** 2026-01-01
**Last Updated:** 2026-01-02

---

## This Year's Goals

### Career / Professional

**Goal 1:**

*What:*
Launch the new product

*Success criteria:*
100 paying customers

---

### Health

**Goal 2:**

*What:*
Run a marathon

*Success criteria:*
Complete a full marathon
`;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: mockGoalContent,
        metadata: {
          status: 'on-track',
          last_updated: '2026-01-02',
        },
      }),
    });
  });

  describe('Tab Rendering (AC1)', () => {
    it('should render page with 3 tabs (1-year, 3-year, 10-year)', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      expect(screen.getByRole('tab', { name: /1.year/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /3.year/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /10.year/i })).toBeInTheDocument();
    });

    it('should show 1-year tab as active by default', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      const oneYearTab = screen.getByRole('tab', { name: /1.year/i });
      expect(oneYearTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to 3-year tab when clicked', async () => {
      const user = userEvent.setup();
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      const threeYearTab = screen.getByRole('tab', { name: /3.year/i });
      await user.click(threeYearTab);

      expect(threeYearTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to 10-year tab when clicked', async () => {
      const user = userEvent.setup();
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      const tenYearTab = screen.getByRole('tab', { name: /10.year/i });
      await user.click(tenYearTab);

      expect(tenYearTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should fetch correct goal file when tab changes', async () => {
      const user = userEvent.setup();
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      // Initial fetch for 1-year
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/goals/1-year'),
          expect.any(Object)
        );
      });

      // Click 3-year tab
      const threeYearTab = screen.getByRole('tab', { name: /3.year/i });
      await user.click(threeYearTab);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/goals/3-year'),
          expect.any(Object)
        );
      });
    });

    it('should display tab panel content for active tab', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const tabPanel = screen.getByRole('tabpanel');
        expect(tabPanel).toBeInTheDocument();
      });
    });
  });

  describe('Content Display (AC1)', () => {
    it('should display markdown content from goal file', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByText(/One-Year Goals/i)).toBeInTheDocument();
      });
    });

    it('should render markdown headings correctly', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        // Should render as heading elements
        const heading = screen.getByRole('heading', { name: /One-Year Goals/i });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should render markdown lists correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

- Item 1
- Item 2
- Item 3`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
      });
    });

    it('should render markdown links correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

Check [this link](https://example.com) for more info.`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /this link/i });
        expect(link).toHaveAttribute('href', 'https://example.com');
      });
    });

    it('should render markdown tables correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

| Goal | Status |
|------|--------|
| Goal 1 | Done |
| Goal 2 | In Progress |`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('Goal 1')).toBeInTheDocument();
        expect(screen.getByText('Done')).toBeInTheDocument();
      });
    });

    it('should render markdown emphasis correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

*This is italic* and **this is bold**`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByText('This is italic')).toBeInTheDocument();
        expect(screen.getByText('this is bold')).toBeInTheDocument();
      });
    });

    it('should render blockquotes correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

> This is a quote about goals`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const blockquote = screen.getByText(/This is a quote about goals/i);
        expect(blockquote).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States (AC1)', () => {
    it('should show loading state while fetching', async () => {
      // Delay the fetch response
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ content: '# Goals', metadata: {} }),
        }), 100))
      );

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      // Should show loading indicator
      expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error state when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    it('should show error state when API returns error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should show empty state for empty goal file', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: '', metadata: {} }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/no goals/i) ||
          screen.getByText(/empty/i) ||
          screen.getByText(/start/i)
        ).toBeInTheDocument();
      });
    });

    it('should provide retry option on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry|try again/i });
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('Goal Status Tracking (AC4)', () => {
    it('should parse goal status from frontmatter', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: mockGoalContent,
          metadata: {
            status: 'on-track',
            last_updated: '2026-01-02',
          },
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        // Status should be displayed somewhere on the page
        expect(screen.getByText(/on.track/i)).toBeInTheDocument();
      });
    });

    it('should display "On Track" badge with appropriate styling', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: '# Goals',
          metadata: {
            status: 'on-track',
            last_updated: '2026-01-02',
          },
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const badge = screen.getByText(/on.track/i);
        expect(badge).toBeInTheDocument();
        // Should have success/green styling
        expect(badge.className).toMatch(/green/i);
      });
    });

    it('should display "Needs Attention" badge with appropriate styling', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: '# Goals',
          metadata: {
            status: 'needs-attention',
            last_updated: '2026-01-02',
          },
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const badge = screen.getByText(/needs.attention/i);
        expect(badge).toBeInTheDocument();
        // Should have warning/yellow styling
        expect(badge.className).toMatch(/yellow/i);
      });
    });

    it('should display "Behind" badge with appropriate styling', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: '# Goals',
          metadata: {
            status: 'behind',
            last_updated: '2026-01-02',
          },
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const badge = screen.getByText(/behind/i);
        expect(badge).toBeInTheDocument();
        // Should have error/red styling
        expect(badge.className).toMatch(/red/i);
      });
    });

    it('should display last_updated date from frontmatter', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: '# Goals',
          metadata: {
            status: 'on-track',
            last_updated: '2026-01-02',
          },
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        // Should display the date in some format
        expect(
          screen.getByText(/2026-01-02/i) ||
          screen.getByText(/jan.*2.*2026/i) ||
          screen.getByText(/updated/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle goals without status frontmatter', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: '# Goals\n\nNo frontmatter here',
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        // Should render content without crashing
        expect(screen.getByText(/Goals/i)).toBeInTheDocument();
        // Should not show status badge or show "Unknown" status
      });
    });

    it('should render link to quarterly reviews page', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const reviewsLink = screen.getByRole('link', { name: /quarterly|reviews/i });
        expect(reviewsLink).toBeInTheDocument();
        expect(reviewsLink).toHaveAttribute('href', expect.stringContaining('/reviews'));
      });
    });
  });

  describe('Edit Mode Navigation', () => {
    it('should render edit button for each tab', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i }) ||
                          screen.getByRole('link', { name: /edit/i });
        expect(editButton).toBeInTheDocument();
      });
    });

    it('should navigate to editor when edit button clicked', async () => {
      const user = userEvent.setup();
      const { GoalsPage } = await import('@/components/GoalsPage');
      const mockRouter = jest.requireMock('next/navigation').useRouter();

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i }) ||
               screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i }) ||
                        screen.getByRole('link', { name: /edit/i });
      await user.click(editButton);

      // Should navigate to edit page or show editor component
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringMatching(/goals.*edit|edit.*goals/i)
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on tabs', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3);
    });

    it('should support keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      const oneYearTab = screen.getByRole('tab', { name: /1.year/i });
      oneYearTab.focus();

      // Press right arrow to move to next tab
      await user.keyboard('{ArrowRight}');

      const threeYearTab = screen.getByRole('tab', { name: /3.year/i });
      expect(document.activeElement).toBe(threeYearTab);
    });

    it('should have proper heading hierarchy in rendered content', async () => {
      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed markdown gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

This has [broken link(

And *** broken emphasis

| broken | table
|---
`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      // Should not throw
      expect(() => render(<GoalsPage />)).not.toThrow();

      await waitFor(() => {
        // Should still render some content
        expect(screen.getByText(/Goals/i)).toBeInTheDocument();
      });
    });

    it('should handle special characters in content', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: `# Goals

Special chars: < > & " ' \` $100 10% @mention #hashtag

Unicode: Hello World`,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      render(<GoalsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Special chars/i)).toBeInTheDocument();
      });
    });

    it('should handle very long content without freezing', async () => {
      const longContent = '# Goals\n\n' + 'Lorem ipsum dolor sit amet. '.repeat(1000);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: longContent,
          metadata: {},
        }),
      });

      const { GoalsPage } = await import('@/components/GoalsPage');

      const startTime = performance.now();
      render(<GoalsPage />);
      const renderTime = performance.now() - startTime;

      // Should render in reasonable time (under 1 second)
      expect(renderTime).toBeLessThan(1000);

      await waitFor(() => {
        expect(screen.getByText(/Goals/i)).toBeInTheDocument();
      });
    });
  });
});
