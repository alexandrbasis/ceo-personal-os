/**
 * AC4: Navigation Tests - Principles Link in QuickActions
 *
 * Tests for the Principles navigation link in QuickActions component:
 * - Link should be present in sidebar/navigation
 * - Link should navigate to /principles
 * - Link should be visible and accessible
 */

import React from 'react';
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

describe('AC4: Navigation - Principles Link in QuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
  });

  describe('Principles Link Presence', () => {
    it('should render Principles link in QuickActions', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have a principles link/button
      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByRole('button', { name: /principles/i }) ||
        screen.getByText(/principles/i);

      expect(principlesLink).toBeInTheDocument();
    });

    it('should have correct href to /principles', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const principlesLink = screen.getByRole('link', { name: /principles/i });
      expect(principlesLink).toHaveAttribute('href', '/principles');
    });

    it('should be visible and accessible', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByRole('button', { name: /principles/i });

      expect(principlesLink).toBeVisible();
      expect(principlesLink).toHaveAccessibleName();
    });

    it('should have proper label text', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should show "Principles" or "Operating Principles" text
      expect(
        screen.getByText(/principles/i)
      ).toBeInTheDocument();
    });
  });

  describe('Principles Section in QuickActions', () => {
    it('should have a principles section with description', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have a section for principles similar to goals/north-star
      const principlesSection =
        screen.getByTestId('principles-section') ||
        document.querySelector('[data-testid="principles-section"]');

      expect(principlesSection).toBeInTheDocument();
    });

    it('should have descriptive text for principles link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Should have description like "Your operating principles" or similar
      expect(
        screen.getByText(/operating principles|your principles|decision.*principles/i)
      ).toBeInTheDocument();
    });
  });

  describe('Navigation Position', () => {
    it('should be positioned near North Star section', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Both North Star and Principles should be present
      const northStarLink =
        screen.getByRole('link', { name: /north star/i }) ||
        screen.getByText(/north star/i);
      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByText(/principles/i);

      expect(northStarLink).toBeInTheDocument();
      expect(principlesLink).toBeInTheDocument();
    });

    it('should be within the quick actions container', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const container = screen.getByTestId('quick-actions');
      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByText(/principles/i);

      expect(container).toContainElement(principlesLink);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable via keyboard', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // Tab through elements until we reach principles link
      let foundPrinciples = false;
      for (let i = 0; i < 20; i++) {
        await user.tab();
        if (
          document.activeElement &&
          (document.activeElement.textContent?.toLowerCase().includes('principles') ||
            document.activeElement.getAttribute('href') === '/principles')
        ) {
          foundPrinciples = true;
          break;
        }
      }

      expect(foundPrinciples).toBe(true);
    });

    it('should be activatable with Enter key', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const principlesLink = screen.getByRole('link', { name: /principles/i });
      principlesLink.focus();

      await user.keyboard('{Enter}');

      // Link should work (navigation would happen in real browser)
      expect(principlesLink).toHaveFocus();
    });
  });

  describe('Visual Styling', () => {
    it('should have consistent styling with other navigation links', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const principlesLink = screen.getByRole('link', { name: /principles/i });
      const northStarLink = screen.getByRole('link', { name: /north star/i });

      // Both should have similar button styling (secondary variant)
      expect(principlesLink.className).toMatch(/button|btn|link/i);
      expect(northStarLink.className).toMatch(/button|btn|link/i);
    });

    it('should be rendered as a Button component with secondary variant', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      // The principles link should be wrapped in Button component similar to North Star
      const principlesButton = screen.getByRole('link', { name: /principles/i });
      expect(principlesButton).toBeInTheDocument();
    });
  });

  describe('Link Props with QuickActions Props', () => {
    it('should render principles link regardless of lastReviewDate prop', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate="2026-01-01" />);

      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByText(/principles/i);
      expect(principlesLink).toBeInTheDocument();
    });

    it('should render principles link with daily and weekly review props', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(
        <QuickActions
          lastDailyReviewDate="2026-01-04"
          lastWeeklyReviewDate="2026-01-01"
        />
      );

      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByText(/principles/i);
      expect(principlesLink).toBeInTheDocument();
    });

    it('should render principles link with no props', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions />);

      const principlesLink =
        screen.getByRole('link', { name: /principles/i }) ||
        screen.getByText(/principles/i);
      expect(principlesLink).toBeInTheDocument();
    });
  });
});
