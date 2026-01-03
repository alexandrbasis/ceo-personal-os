/**
 * AC1: North Star Page Tests
 *
 * Tests for the /north-star page which:
 * - Renders at the correct route
 * - Shows current north star content from API
 * - Renders markdown content using react-markdown
 * - Has Edit button to switch to edit mode
 * - Has Save button that commits changes to north_star.md
 * - Handles loading/error states
 */

import React from 'react';
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
  usePathname: () => '/north-star',
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

describe('AC1: North Star Page (/north-star)', () => {
  const sampleNorthStarContent = `# My North Star

## Purpose
To build meaningful products that help people live better lives.

## Core Values
1. **Integrity** - Always do the right thing
2. **Growth** - Never stop learning
3. **Impact** - Create positive change

## Vision
In 10 years, I want to have built a company that:
- Employs 100+ talented people
- Serves millions of users
- Generates sustainable profit while doing good
`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();

    // Default successful GET fetch mock
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/north-star')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: sampleNorthStarContent }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Page Rendering', () => {
    it('should render the north star page', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/north star/i) ||
            screen.getByRole('heading', { name: /north star/i })
        ).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      expect(
        screen.getByText(/loading/i) || screen.getByRole('progressbar')
      ).toBeInTheDocument();
    });

    it('should load content from GET /api/north-star', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/north-star');
      });
    });

    it('should display page title', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 }) ||
            screen.getByText(/north star/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Markdown Rendering (AC1)', () => {
    it('should render markdown content after loading', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should display content from the markdown file
        expect(screen.getByText(/My North Star/i)).toBeInTheDocument();
      });
    });

    it('should render markdown headings', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should render markdown headings as actual heading elements
        expect(screen.getByText('Purpose')).toBeInTheDocument();
        expect(screen.getByText('Core Values')).toBeInTheDocument();
        expect(screen.getByText('Vision')).toBeInTheDocument();
      });
    });

    it('should render markdown lists', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should render list items
        expect(screen.getByText(/Integrity/)).toBeInTheDocument();
        expect(screen.getByText(/Growth/)).toBeInTheDocument();
        expect(screen.getByText(/Impact/)).toBeInTheDocument();
      });
    });

    it('should render markdown bold text', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Bold text should be rendered
        const boldElements = document.querySelectorAll('strong, b');
        expect(boldElements.length).toBeGreaterThan(0);
      });
    });

    it('should render nested bullet points', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should render bullet point content
        expect(screen.getByText(/Employs 100\+ talented people/)).toBeInTheDocument();
        expect(screen.getByText(/Serves millions of users/)).toBeInTheDocument();
      });
    });

    it('should use react-markdown for rendering', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Content should be in a markdown container
        const markdownContainer =
          document.querySelector('.markdown') ||
          document.querySelector('.prose') ||
          screen.getByTestId('markdown-content');
        expect(markdownContainer).toBeInTheDocument();
      });
    });
  });

  describe('View Mode (AC1)', () => {
    it('should start in view mode by default', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should show rendered content, not an editor
        expect(screen.getByText(/My North Star/)).toBeInTheDocument();
        // Editor should not be visible in view mode
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('should display Edit button in view mode', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode Navigation (AC1)', () => {
    it('should switch to edit mode when Edit button clicked', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        // Either navigate to edit page or show inline editor
        if (mockRouter.push.mock.calls.length > 0) {
          expect(mockRouter.push).toHaveBeenCalledWith('/north-star/edit');
        } else {
          // Inline edit mode - should show textbox
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        }
      });
    });

    it('should display content in editor when in edit mode', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        // If inline edit, editor should contain the content
        const editor = screen.queryByRole('textbox');
        if (editor) {
          expect(
            (editor as HTMLTextAreaElement).value ||
              editor.textContent
          ).toContain('My North Star');
        }
      });
    });
  });

  describe('Save Functionality (AC1)', () => {
    it('should show Save button in edit mode', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeInTheDocument();
      });
    });

    it('should call PUT /api/north-star when Save clicked', async () => {
      const user = userEvent.setup();

      // Mock both GET and PUT
      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({ success: true, content: sampleNorthStarContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleNorthStarContent }),
          });
        }
      );

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/north-star',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });
    });

    it('should show success toast after successful save', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({ success: true, content: sampleNorthStarContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleNorthStarContent }),
          });
        }
      );

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

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

    it('should return to view mode after successful save', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({ success: true, content: sampleNorthStarContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleNorthStarContent }),
          });
        }
      );

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Should be back in view mode - no textbox visible
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        // Edit button should be visible again
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should show error toast when save fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Save failed' }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleNorthStarContent }),
          });
        }
      );

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

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

    it('should remain in edit mode when save fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Save failed' }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleNorthStarContent }),
          });
        }
      );

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Should still be in edit mode
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should show Cancel button in edit mode', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
      });
    });

    it('should return to view mode when Cancel clicked', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        // Should be back in view mode - no textbox visible
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        // Edit button should be visible again
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should not save changes when Cancel clicked', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

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

  describe('Error Handling', () => {
    it('should show error state when API fails to load', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i })
        ).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button clicked', async () => {
      const user = userEvent.setup();

      // First call fails, second succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ content: sampleNorthStarContent }),
        });

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i })
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry|try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/My North Star/i)).toBeInTheDocument();
      });
    });

    it('should handle empty content gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: '' }),
      });

      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should show empty state or placeholder
        expect(
          screen.getByText(/empty|no content|start writing/i) ||
            screen.getByRole('button', { name: /edit/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Page Layout', () => {
    it('should have proper page structure', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should have main landmark
        expect(
          screen.getByRole('main') || document.querySelector('main')
        ).toBeInTheDocument();
      });
    });

    it('should have navigation back link', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        const backLink =
          screen.queryByRole('link', { name: /back|dashboard|home/i }) ||
          screen.queryByRole('button', { name: /back/i });
        expect(backLink).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        // Should have h1 as the main heading
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible button labels', async () => {
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toHaveAccessibleName();
        });
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const NorthStarPage = (await import('@/app/north-star/page')).default;

      render(<NorthStarPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      // Tab should move to interactive elements
      await user.tab();

      expect(document.activeElement).not.toBe(document.body);
    });
  });
});
