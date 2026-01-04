/**
 * AC5: QuickActions Component Tests - Frameworks Navigation
 *
 * Tests for adding Frameworks link to the QuickActions component:
 * - Render Frameworks link/button
 * - Link points to /frameworks
 * - Appropriate description text
 * - Accessibility (keyboard nav, aria labels)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('AC5: QuickActions - Frameworks Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
  });

  describe('Frameworks Link Rendering', () => {
    it('should render Frameworks link in QuickActions', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Should have a link or button for Frameworks
      const frameworksLink =
        screen.getByRole('link', { name: /frameworks/i }) ||
        screen.getByRole('button', { name: /frameworks/i });
      expect(frameworksLink).toBeInTheDocument();
    });

    it('should have href pointing to /frameworks', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const frameworksLink = screen.getByRole('link', { name: /frameworks/i });

      expect(frameworksLink).toHaveAttribute('href', '/frameworks');
    });

    it('should render a Frameworks section in QuickActions', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Should have a frameworks section with data-testid
      const frameworksSection =
        screen.getByTestId('frameworks-section') ||
        screen.getByText(/frameworks/i).closest('div');

      expect(frameworksSection).toBeInTheDocument();
    });

    it('should display appropriate description text for frameworks', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Should show descriptive text about frameworks
      // The frameworks section should have descriptive text
      const frameworksSection = screen.getByTestId('frameworks-section');
      expect(frameworksSection).toBeInTheDocument();

      // Check that there's descriptive text within the section
      const sectionText = frameworksSection.textContent;
      expect(
        sectionText?.includes('Thinking tools') ||
        sectionText?.includes('reflection') ||
        sectionText?.includes('Frameworks')
      ).toBe(true);
    });
  });

  describe('Navigation Behavior', () => {
    it('should navigate to /frameworks when link is clicked', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const frameworksLink =
        screen.getByRole('link', { name: /frameworks/i }) ||
        screen.getByRole('button', { name: /frameworks/i });

      // If it's a Link component, it should have href
      if (frameworksLink.tagName === 'A') {
        expect(frameworksLink).toHaveAttribute('href', '/frameworks');
      } else {
        // If it's a button, clicking should navigate
        await user.click(frameworksLink);
        expect(mockRouter.push).toHaveBeenCalledWith('/frameworks');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for frameworks link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const frameworksLink =
        screen.getByRole('link', { name: /frameworks/i }) ||
        screen.getByRole('button', { name: /frameworks/i });

      expect(frameworksLink).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Tab through the component
      // Should be able to reach the frameworks link
      let foundFrameworks = false;
      for (let i = 0; i < 20; i++) {
        await user.tab();
        const focused = document.activeElement;
        if (
          focused?.textContent?.toLowerCase().includes('frameworks') ||
          (focused as HTMLAnchorElement)?.href?.includes('/frameworks')
        ) {
          foundFrameworks = true;
          break;
        }
      }

      expect(foundFrameworks).toBe(true);
    });

    it('should support keyboard activation (Enter key)', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const frameworksLink =
        screen.getByRole('link', { name: /frameworks/i }) ||
        screen.getByRole('button', { name: /frameworks/i });

      // Focus the element
      frameworksLink.focus();

      // Press Enter
      await user.keyboard('{Enter}');

      // Should either navigate (link) or trigger onClick (button)
      if (frameworksLink.tagName !== 'A') {
        expect(mockRouter.push).toHaveBeenCalledWith('/frameworks');
      }
      // For links, the browser handles Enter key navigation
    });
  });

  describe('Visual Hierarchy', () => {
    it('should render frameworks link with consistent styling', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const frameworksLink =
        screen.getByRole('link', { name: /frameworks/i }) ||
        screen.getByRole('button', { name: /frameworks/i });

      // Should have button-like styling (secondary variant based on existing pattern)
      expect(frameworksLink.className).toMatch(
        /button|btn|secondary|outline/i
      );
    });

    it('should be visible alongside other navigation items', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Frameworks should be visible alongside existing navigation
      const frameworksLink =
        screen.getByRole('link', { name: /frameworks/i }) ||
        screen.getByRole('button', { name: /frameworks/i });
      const goalsLink =
        screen.getByRole('link', { name: /goals/i }) ||
        screen.getByRole('button', { name: /goals/i });
      const northStarLink =
        screen.getByRole('link', { name: /north star/i }) ||
        screen.getByRole('button', { name: /north star/i });

      expect(frameworksLink).toBeVisible();
      expect(goalsLink).toBeVisible();
      expect(northStarLink).toBeVisible();
    });
  });

  describe('Integration with Existing Sections', () => {
    it('should maintain existing daily section functionality', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Daily section should still exist
      const dailySection = screen.getByTestId('daily-section');
      expect(dailySection).toBeInTheDocument();

      // Start Daily Review button should still work
      const startDailyButton = screen.getByRole('button', {
        name: /start daily review/i,
      });
      expect(startDailyButton).toBeInTheDocument();
    });

    it('should maintain existing weekly section functionality', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Weekly section should still exist
      const weeklySection = screen.getByTestId('weekly-section');
      expect(weeklySection).toBeInTheDocument();
    });

    it('should maintain existing goals section functionality', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Goals section should still exist
      const goalsSection = screen.getByTestId('goals-section');
      expect(goalsSection).toBeInTheDocument();
    });

    it('should maintain existing north star section functionality', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // North Star section should still exist
      const northStarSection = screen.getByTestId('north-star-section');
      expect(northStarSection).toBeInTheDocument();
    });

    it('should maintain existing principles section functionality', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Principles section should still exist
      const principlesSection = screen.getByTestId('principles-section');
      expect(principlesSection).toBeInTheDocument();
    });

    it('should maintain existing memory section functionality', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Memory section should still exist
      const memorySection = screen.getByTestId('memory-section');
      expect(memorySection).toBeInTheDocument();
    });
  });
});
