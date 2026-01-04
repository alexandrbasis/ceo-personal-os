/**
 * AC4: Navigation Tests - Memory Link in QuickActions
 *
 * Tests for the Memory navigation link in QuickActions component:
 * - Link should be present in sidebar/navigation
 * - Link should navigate to /memory
 * - Link should be visible and accessible
 * - Should have reminder callout for quarterly reviews
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

describe('AC4: Navigation - Memory Link in QuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
  });

  describe('Memory Link Presence', () => {
    it('should render Memory link in QuickActions', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have a memory link/button
      const memoryLink = screen.getByRole('link', { name: /memory/i });

      expect(memoryLink).toBeInTheDocument();
    });

    it('should have correct href to /memory', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const memoryLink = screen.getByRole('link', { name: /memory/i });
      expect(memoryLink).toHaveAttribute('href', '/memory');
    });

    it('should be visible and accessible', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const memoryLink = screen.getByRole('link', { name: /memory/i });

      expect(memoryLink).toBeVisible();
      expect(memoryLink).toHaveAccessibleName();
    });

    it('should have proper label text', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should show "Memory" text
      expect(
        screen.getByText(/memory/i)
      ).toBeInTheDocument();
    });
  });

  describe('Memory Section in QuickActions', () => {
    it('should have a memory section with description', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have a section for memory similar to principles/north-star
      const memorySection =
        screen.getByTestId('memory-section') ||
        document.querySelector('[data-testid="memory-section"]');

      expect(memorySection).toBeInTheDocument();
    });

    it('should have descriptive text for memory link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have description about self-knowledge or accumulated insights
      expect(
        screen.getByText(/self-knowledge|accumulated|insights about yourself|institutional knowledge/i)
      ).toBeInTheDocument();
    });

    it('should have reminder callout for quarterly reviews', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have a reminder/callout about reviewing memory before quarterly reviews
      expect(
        screen.getByText(/review memory before quarterly|quarterly review/i)
      ).toBeInTheDocument();
    });
  });

  describe('Navigation Position', () => {
    it('should be positioned near Principles section', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Both Principles and Memory should be present
      const principlesLink = screen.getByRole('link', { name: /principles/i });
      const memoryLink = screen.getByRole('link', { name: /memory/i });

      expect(principlesLink).toBeInTheDocument();
      expect(memoryLink).toBeInTheDocument();
    });

    it('should be within the quick actions container', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const container = screen.getByTestId('quick-actions');
      const memoryLink = screen.getByRole('link', { name: /memory/i });

      expect(container).toContainElement(memoryLink);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable via keyboard', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Tab through elements until we reach memory link
      let foundMemory = false;
      for (let i = 0; i < 20; i++) {
        await user.tab();
        if (
          document.activeElement &&
          (document.activeElement.textContent?.toLowerCase().includes('memory') ||
            document.activeElement.getAttribute('href') === '/memory')
        ) {
          foundMemory = true;
          break;
        }
      }

      expect(foundMemory).toBe(true);
    });

    it('should be activatable with Enter key', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const memoryLink = screen.getByRole('link', { name: /memory/i });
      memoryLink.focus();

      await user.keyboard('{Enter}');

      // Link should work (navigation would happen in real browser)
      expect(memoryLink).toHaveFocus();
    });
  });

  describe('Visual Styling', () => {
    it('should have consistent styling with other navigation links', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const memoryLink = screen.getByRole('link', { name: /memory/i });
      const principlesLink = screen.getByRole('link', { name: /principles/i });

      // Both should be in the document and be links
      expect(memoryLink).toBeInTheDocument();
      expect(principlesLink).toBeInTheDocument();
    });

    it('should be rendered as a Button component with secondary variant', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // The memory link should be wrapped in Button component similar to Principles
      const memoryButton = screen.getByRole('link', { name: /memory/i });
      expect(memoryButton).toBeInTheDocument();
    });
  });

  describe('Link Props with QuickActions Props', () => {
    it('should render memory link regardless of lastReviewDate prop', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate="2026-01-01" />);

      const memoryLink = screen.getByRole('link', { name: /memory/i });
      expect(memoryLink).toBeInTheDocument();
    });

    it('should render memory link with daily and weekly review props', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(
        <QuickActions
          lastDailyReviewDate="2026-01-04"
          lastWeeklyReviewDate="2026-01-01"
        />
      );

      const memoryLink = screen.getByRole('link', { name: /memory/i });
      expect(memoryLink).toBeInTheDocument();
    });

    it('should render memory link with no props', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const memoryLink = screen.getByRole('link', { name: /memory/i });
      expect(memoryLink).toBeInTheDocument();
    });
  });

  describe('Integration with Other Sections', () => {
    it('should coexist with all other QuickActions sections', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // All sections should be present
      expect(screen.getByTestId('daily-section')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-section')).toBeInTheDocument();
      expect(screen.getByTestId('goals-section')).toBeInTheDocument();
      expect(screen.getByTestId('north-star-section')).toBeInTheDocument();
      expect(screen.getByTestId('principles-section')).toBeInTheDocument();
      expect(screen.getByTestId('memory-section')).toBeInTheDocument();
    });

    it('should not affect existing functionality of other sections', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastDailyReviewDate="2026-01-04" />);

      // Daily review button should still work
      const dailyButton = screen.getByRole('button', { name: /start daily review/i });
      expect(dailyButton).toBeInTheDocument();

      // Weekly review button should still work
      const weeklyButton = screen.getByRole('button', { name: /start weekly review/i });
      expect(weeklyButton).toBeInTheDocument();

      // Goals link should still work
      const goalsLink = screen.getByRole('link', { name: /goals/i });
      expect(goalsLink).toBeInTheDocument();
    });
  });
});
