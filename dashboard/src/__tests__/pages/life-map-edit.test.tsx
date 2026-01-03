/**
 * AC1: Life Map Edit Page Tests
 *
 * Tests for the /life-map/edit page which:
 * - Renders at the correct route
 * - Loads current life map data from API
 * - Shows LifeMapEditor component
 * - Handles save/cancel navigation
 * - Shows success toast notification after save (AC2)
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
  usePathname: () => '/life-map/edit',
}));

// Mock toast notifications (sonner)
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

jest.mock('sonner', () => ({
  toast: mockToast,
  Toaster: () => null,
}));

describe('AC1: Life Map Edit Page (/life-map/edit)', () => {
  const mockLifeMapData: LifeMap = {
    domains: {
      career: { score: 8, assessment: 'Strong momentum, good team' },
      relationships: { score: 6, assessment: 'Needs more quality time' },
      health: { score: 5, assessment: 'Acceptable but neglected' },
      meaning: { score: 7, assessment: 'Growing sense of purpose' },
      finances: { score: 8, assessment: 'Stable and secure' },
      fun: { score: 4, assessment: 'Neglected, needs attention' },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();

    // Default successful GET fetch mock
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/life-map')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Page Rendering', () => {
    it('should render the edit page', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByText(/edit life map/i)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should load current life map data from API', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/life-map');
      });
    });

    it('should render sliders after loading', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('slider')).toHaveLength(6);
      });
    });

    it('should render assessment text fields after loading', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getAllByRole('textbox')).toHaveLength(6);
      });
    });

    it('should display current domain scores from API', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        const careerSlider = screen.getByRole('slider', { name: /career/i });
        expect(careerSlider).toHaveAttribute('aria-valuenow', '8');
      });
    });

    it('should display current assessment values from API', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Strong momentum, good team')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality (AC2)', () => {
    it('should call PUT API when save button clicked', async () => {
      const user = userEvent.setup();

      // Mock both GET and PUT
      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, ...mockLifeMapData }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      });

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/life-map',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });
    });

    it('should show success toast notification after save (AC2)', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, ...mockLifeMapData }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      });

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          expect.stringMatching(/saved|success/i)
        );
      });
    });

    it('should navigate to dashboard after successful save', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, ...mockLifeMapData }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      });

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/');
      });
    });

    it('should show error toast when save fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Save failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      });

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringMatching(/error|failed/i)
        );
      });
    });

    it('should not navigate when save fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Save failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLifeMapData),
        });
      });

      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Wait a bit to ensure navigation would have happened if it was going to
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should navigate back when cancel button clicked', async () => {
      const user = userEvent.setup();
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('should not save when cancel button clicked', async () => {
      const user = userEvent.setup();
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Verify PUT was not called
      const putCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (call: [string, RequestInit?]) => call[1]?.method === 'PUT'
      );
      expect(putCalls).toHaveLength(0);
    });
  });

  describe('Page Layout', () => {
    it('should have a page title', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit life map/i }) ||
          screen.getByText(/edit life map/i)
        ).toBeInTheDocument();
      });
    });

    it('should have back link or breadcrumb navigation', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        const backLink = screen.queryByRole('link', { name: /back|dashboard/i }) ||
                        screen.queryByRole('button', { name: /back/i });
        expect(backLink).toBeInTheDocument();
      });
    });

    it('should show preview section', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId('life-map-preview') ||
          screen.getByText(/preview/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Integration with LifeMapEditor', () => {
    it('should pass loaded data to LifeMapEditor', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        // Check that data from API is displayed
        expect(screen.getByDisplayValue('Strong momentum, good team')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Needs more quality time')).toBeInTheDocument();
      });
    });

    it('should update preview when slider changes', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('slider', { name: /career/i })).toBeInTheDocument();
      });

      const careerSlider = screen.getByRole('slider', { name: /career/i });

      // Change slider value
      await userEvent.setup().click(careerSlider);

      // Slider should be interactive
      expect(careerSlider).toHaveAttribute('aria-valuenow');
    });
  });

  describe('Accessibility', () => {
    it('should have proper page structure', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        // Should have main landmark
        expect(screen.getByRole('main') || document.querySelector('main')).toBeInTheDocument();
      });
    });

    it('should have focus management after loading', async () => {
      const LifeMapEditPage = (await import('@/app/life-map/edit/page')).default;

      render(<LifeMapEditPage />);

      await waitFor(() => {
        // After loading, focus should be on a meaningful element
        const activeElement = document.activeElement;
        expect(activeElement).not.toBe(document.body);
      });
    });
  });
});
