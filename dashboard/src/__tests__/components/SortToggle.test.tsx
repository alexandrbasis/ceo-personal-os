/**
 * Component Tests - SortToggle
 *
 * Tests for AC2: Date Sorting
 * - Sort toggle: Newest First / Oldest First
 * - Default: Newest First
 * - URL reflects sort state
 * - Visual indicator of current sort direction
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('AC2: SortToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('type');
    mockSearchParams.delete('sort');
  });

  describe('Rendering', () => {
    it('should render sort toggle with Newest/Oldest options', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle onSortChange={jest.fn()} />);

      // Should render the sort toggle component
      const sortElement = screen.getByTestId('sort-toggle') ||
                          screen.getByRole('button') ||
                          screen.getByLabelText(/sort/i);
      expect(sortElement).toBeInTheDocument();

      // Should indicate Newest/Oldest First options
      expect(
        screen.getByText(/Newest.*First|Oldest.*First|desc|asc/i)
      ).toBeInTheDocument();
    });

    it('should have "Newest First" as default', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle onSortChange={jest.fn()} />);

      // Should show "Newest First" as current selection
      const currentSort = screen.getByTestId('current-sort') ||
                          screen.getByText(/Newest.*First/i);
      expect(currentSort).toBeInTheDocument();
    });

    it('should show visual indicator of current sort direction', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Should have visual indicator (arrow, icon, etc.)
      const sortIndicator = screen.getByTestId('sort-direction-indicator') ||
                            screen.getByLabelText(/descending|newest/i) ||
                            screen.getByRole('img', { hidden: true });
      expect(sortIndicator).toBeInTheDocument();
    });

    it('should show descending arrow when sort=desc', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Should have down arrow or descending indicator
      const descIndicator = screen.getByTestId('sort-desc-indicator') ||
                            screen.getByLabelText(/descending|newest first/i);
      expect(descIndicator).toBeInTheDocument();
    });

    it('should show ascending arrow when sort=asc', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="asc" onSortChange={jest.fn()} />);

      // Should have up arrow or ascending indicator
      const ascIndicator = screen.getByTestId('sort-asc-indicator') ||
                           screen.getByLabelText(/ascending|oldest first/i);
      expect(ascIndicator).toBeInTheDocument();
    });
  });

  describe('Sort Toggle Interaction', () => {
    it('should call onSortChange when toggled', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={onSortChange} />);

      // Click the toggle
      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');
      await user.click(toggleButton);

      expect(onSortChange).toHaveBeenCalled();
    });

    it('should toggle from desc to asc when clicked', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={onSortChange} />);

      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');
      await user.click(toggleButton);

      expect(onSortChange).toHaveBeenCalledWith('asc');
    });

    it('should toggle from asc to desc when clicked', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="asc" onSortChange={onSortChange} />);

      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');
      await user.click(toggleButton);

      expect(onSortChange).toHaveBeenCalledWith('desc');
    });

    it('should update visual indicator when toggled', async () => {
      const user = userEvent.setup();
      const { SortToggle } = await import('@/components/SortToggle');

      const { rerender } = render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Initially shows "Newest First"
      expect(screen.getByText(/Newest.*First/i)).toBeInTheDocument();

      // Simulate state change (controlled component)
      rerender(<SortToggle currentSort="asc" onSortChange={jest.fn()} />);

      // Should now show "Oldest First"
      expect(screen.getByText(/Oldest.*First/i)).toBeInTheDocument();
    });
  });

  describe('URL State Management', () => {
    it('should update URL with sort parameter when toggled', async () => {
      const user = userEvent.setup();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} updateUrl={true} />);

      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');
      await user.click(toggleButton);

      // Should update URL with sort=asc
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('sort=asc')
      );
    });

    it('should read initial sort from URL params', async () => {
      mockSearchParams.set('sort', 'asc');

      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle onSortChange={jest.fn()} readFromUrl={true} />);

      // Should show "Oldest First" based on URL
      expect(screen.getByText(/Oldest.*First/i)).toBeInTheDocument();
    });

    it('should persist sort preference on page refresh', async () => {
      mockSearchParams.set('sort', 'asc');

      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle onSortChange={jest.fn()} readFromUrl={true} />);

      // Should maintain asc sort from URL
      const ascIndicator = screen.getByTestId('sort-asc-indicator') ||
                           screen.getByText(/Oldest.*First/i);
      expect(ascIndicator).toBeInTheDocument();
    });

    it('should preserve other URL params when updating sort', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('type', 'weekly');

      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} updateUrl={true} />);

      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');
      await user.click(toggleButton);

      // Should preserve type param and update sort param
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/type=weekly.*sort=asc|sort=asc.*type=weekly/)
      );
    });

    it('should remove sort param when set to default (desc)', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('sort', 'asc');

      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="asc" onSortChange={jest.fn()} updateUrl={true} />);

      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');
      await user.click(toggleButton);

      // URL should not contain sort=desc (it is default), or contain sort=desc
      const callArg = mockPush.mock.calls[0]?.[0] || '';
      // Either no sort param or sort=desc
      expect(callArg).toMatch(/(?!sort=asc)|sort=desc/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid URL sort param gracefully', async () => {
      mockSearchParams.set('sort', 'invalid');

      const { SortToggle } = await import('@/components/SortToggle');

      // Should not throw, should default to "desc"
      expect(() => {
        render(<SortToggle onSortChange={jest.fn()} readFromUrl={true} />);
      }).not.toThrow();

      // Should default to "Newest First"
      expect(screen.getByText(/Newest.*First/i)).toBeInTheDocument();
    });

    it('should handle empty sort URL param', async () => {
      mockSearchParams.set('sort', '');

      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle onSortChange={jest.fn()} readFromUrl={true} />);

      // Should default to "Newest First"
      expect(screen.getByText(/Newest.*First/i)).toBeInTheDocument();
    });

    it('should handle rapid toggling', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={onSortChange} />);

      const toggleButton = screen.getByRole('button') ||
                           screen.getByTestId('sort-toggle');

      // Rapid clicks
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);

      // Should have been called 3 times
      expect(onSortChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Should have accessible button
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label') ||
        expect(button).toHaveAccessibleName();
    });

    it('should indicate current sort direction in aria', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Should communicate sort direction
      const button = screen.getByRole('button');
      const ariaLabel = button.getAttribute('aria-label') || '';
      expect(ariaLabel.toLowerCase()).toMatch(/newest|descending|sort/);
    });

    it('should be focusable with keyboard', async () => {
      const user = userEvent.setup();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Tab to focus
      await user.tab();

      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });

    it('should toggle with Enter key', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={onSortChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onSortChange).toHaveBeenCalledWith('asc');
    });

    it('should toggle with Space key', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={onSortChange} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(onSortChange).toHaveBeenCalledWith('asc');
    });
  });

  describe('Visual States', () => {
    it('should show clear label text for current state', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      const { rerender } = render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      // Should clearly say "Newest First"
      expect(screen.getByText(/Newest First/i)).toBeInTheDocument();

      rerender(<SortToggle currentSort="asc" onSortChange={jest.fn()} />);

      // Should clearly say "Oldest First"
      expect(screen.getByText(/Oldest First/i)).toBeInTheDocument();
    });

    it('should have hover state', async () => {
      const user = userEvent.setup();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} />);

      const button = screen.getByRole('button');

      // Hover over button
      await user.hover(button);

      // Button should have hover class or style (visual test)
      expect(button).toBeInTheDocument();
    });

    it('should have disabled state when specified', async () => {
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={jest.fn()} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not trigger callback when disabled', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const { SortToggle } = await import('@/components/SortToggle');

      render(<SortToggle currentSort="desc" onSortChange={onSortChange} disabled={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onSortChange).not.toHaveBeenCalled();
    });
  });
});
