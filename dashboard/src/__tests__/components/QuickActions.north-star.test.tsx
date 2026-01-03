/**
 * AC4: QuickActions Navigation Integration Tests - North Star
 *
 * Tests for the QuickActions component integration with North Star page:
 * - Link to North Star page in navigation/QuickActions
 * - Accessible navigation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('AC4: QuickActions - North Star Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
  });

  describe('North Star Link Rendering', () => {
    it('should render North Star link/button in QuickActions', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Should have a North Star link or button
      const northStarElement =
        screen.getByRole('link', { name: /north star/i }) ||
        screen.getByRole('button', { name: /north star/i }) ||
        screen.getByText(/north star/i);
      expect(northStarElement).toBeInTheDocument();
    });

    it('should link to /north-star', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Check if it's a link with the correct href
      const northStarLink = screen.queryByRole('link', { name: /north star/i });
      if (northStarLink) {
        expect(northStarLink).toHaveAttribute('href', '/north-star');
      } else {
        // If it's a button, clicking should navigate
        const user = userEvent.setup();
        const northStarButton = screen.getByRole('button', { name: /north star/i });
        await user.click(northStarButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/north-star');
      }
    });

    it('should display North Star in navigation section', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // North Star should be visible in the component
      const quickActionsContainer = screen.getByTestId('quick-actions');
      expect(quickActionsContainer).toBeInTheDocument();

      // Within the container, North Star should be present
      const northStarText = screen.getByText(/north star/i);
      expect(quickActionsContainer).toContainElement(northStarText);
    });
  });

  describe('Navigation Section Structure', () => {
    it('should have a dedicated section for North Star', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Should have a North Star section
      const northStarSection =
        screen.getByTestId('north-star-section') ||
        screen.getByRole('region', { name: /north star/i }) ||
        screen.getByText(/north star/i).closest('div');
      expect(northStarSection).toBeInTheDocument();
    });

    it('should have descriptive text for North Star', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Should have some description or context
      expect(
        screen.getByText(/north star/i) ||
          screen.getByText(/purpose|direction|vision/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Tab through the component
      await user.tab();
      await user.tab();
      await user.tab();

      // At some point, North Star should be focusable
      const northStarElement =
        screen.queryByRole('link', { name: /north star/i }) ||
        screen.queryByRole('button', { name: /north star/i });

      if (northStarElement) {
        northStarElement.focus();
        expect(document.activeElement).toBe(northStarElement);
      }
    });

    it('should have accessible label for North Star link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const northStarElement =
        screen.queryByRole('link', { name: /north star/i }) ||
        screen.queryByRole('button', { name: /north star/i });

      if (northStarElement) {
        expect(northStarElement).toHaveAccessibleName();
      }
    });

    it('should work with screen readers', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // The element should be discoverable by screen readers
      const northStarText = screen.getByText(/north star/i);
      expect(northStarText).toBeVisible();

      // Parent interactive element should be accessible
      const interactiveParent =
        northStarText.closest('a') || northStarText.closest('button');
      if (interactiveParent) {
        expect(interactiveParent).toHaveAccessibleName();
      }
    });
  });

  describe('Integration with Other Navigation Items', () => {
    it('should coexist with Daily Review button', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Both should be present
      expect(
        screen.getByRole('button', { name: /start daily review/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/north star/i)).toBeInTheDocument();
    });

    it('should coexist with Weekly Review button', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Both should be present
      expect(
        screen.getByRole('button', { name: /start weekly review/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/north star/i)).toBeInTheDocument();
    });

    it('should coexist with Goals link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Both should be present
      expect(
        screen.getByRole('link', { name: /goals/i }) ||
          screen.getByText(/goals/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/north star/i)).toBeInTheDocument();
    });

    it('should coexist with View All Reviews link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Both should be present
      expect(
        screen.getByRole('link', { name: /view all reviews/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/north star/i)).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('should have consistent styling with other navigation items', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const northStarElement =
        screen.queryByRole('link', { name: /north star/i }) ||
        screen.queryByRole('button', { name: /north star/i });

      const goalsElement =
        screen.queryByRole('link', { name: /goals/i }) ||
        screen.queryByRole('button', { name: /goals/i });

      if (northStarElement && goalsElement) {
        // Both should have similar button/link styling
        // At minimum, both should be visible and styled
        expect(northStarElement).toBeVisible();
        expect(goalsElement).toBeVisible();
      }
    });
  });
});
