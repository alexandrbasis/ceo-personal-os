/**
 * T5: Component Tests - QuickActions
 *
 * Tests for the quick actions component with review status indicator
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('T5: QuickActions Component', () => {
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

  describe('Start Daily Review Button', () => {
    it('should render "Start Daily Review" button', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const button = screen.getByRole('button', { name: /start daily review/i }) ||
                     screen.getByRole('link', { name: /start daily review/i });
      expect(button).toBeInTheDocument();
    });

    it('should link to /daily when clicked', async () => {
      const user = userEvent.setup();
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const button = screen.getByRole('button', { name: /start daily review/i }) ||
                     screen.getByRole('link', { name: /start daily review/i });

      if (button.tagName === 'A') {
        expect(button).toHaveAttribute('href', '/daily');
      } else {
        await user.click(button);
        expect(mockRouter.push).toHaveBeenCalledWith('/daily');
      }
    });
  });

  describe('Status Indicator', () => {
    it('should show green status when last review was today', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const today = new Date().toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={today} />);

      // Should have green indicator
      const statusIndicator = screen.getByTestId('status-indicator') ||
                              screen.getByLabelText(/status/i);

      // Check for green styling or class
      expect(statusIndicator.className).toMatch(/green|success|complete/i);
    });

    it('should show "Last review: Today" when reviewed today', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const today = new Date().toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={today} />);

      expect(screen.getByText(/last review.*today/i)).toBeInTheDocument();
    });

    it('should show yellow status when last review was yesterday', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={yesterday} />);

      const statusIndicator = screen.getByTestId('status-indicator') ||
                              screen.getByLabelText(/status/i);

      // Check for yellow/warning styling
      expect(statusIndicator.className).toMatch(/yellow|warning|pending/i);
    });

    it('should show "Last review: Yesterday" when reviewed yesterday', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={yesterday} />);

      expect(screen.getByText(/last review.*yesterday/i)).toBeInTheDocument();
    });

    it('should show red status when no review for 2+ days', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={threeDaysAgo} />);

      const statusIndicator = screen.getByTestId('status-indicator') ||
                              screen.getByLabelText(/status/i);

      // Check for red/error styling
      expect(statusIndicator.className).toMatch(/red|error|danger|destructive/i);
    });

    it('should show warning message for missed reviews', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={threeDaysAgo} />);

      // Should show warning about missed reviews
      expect(screen.getByText(/no review.*2\+ days|3 days ago/i)).toBeInTheDocument();
    });

    it('should show red status when no reviews exist', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const statusIndicator = screen.getByTestId('status-indicator') ||
                              screen.getByLabelText(/status/i);

      expect(statusIndicator.className).toMatch(/red|error|danger/i);
    });

    it('should show "No reviews yet" when no reviews exist', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      expect(screen.getByText(/no reviews yet|never reviewed/i)).toBeInTheDocument();
    });

    it('should show relative date for older reviews', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={fiveDaysAgo} />);

      expect(screen.getByText(/5 days|last week/i)).toBeInTheDocument();
    });
  });

  describe('Additional Actions', () => {
    it('should render "View All Reviews" link', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      const viewAllLink = screen.getByRole('link', { name: /view all|all reviews/i });
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink).toHaveAttribute('href', '/reviews');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      render(<QuickActions lastReviewDate={null} />);

      // Button should be keyboard accessible
      const button = screen.getByRole('button', { name: /start daily review/i }) ||
                     screen.getByRole('link', { name: /start daily review/i });
      expect(button).toBeVisible();
    });

    it('should have status indicator with accessible text', async () => {
      const { QuickActions } = await import('@/components/QuickActions');

      const today = new Date().toISOString().split('T')[0];

      render(<QuickActions lastReviewDate={today} />);

      // Status should be readable by screen readers
      const statusText = screen.getByText(/last review/i);
      expect(statusText).toBeInTheDocument();
    });
  });
});
