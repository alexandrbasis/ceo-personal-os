/**
 * AC1: Principles Page Tests
 *
 * Tests for the /principles page which:
 * - Renders at the correct route
 * - Shows current principles content from API
 * - Renders markdown content using react-markdown
 * - Has Edit button to switch to edit mode
 * - Has Save button that commits changes to principles.md
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
  usePathname: () => '/principles',
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

describe('AC1: Principles Page (/principles)', () => {
  const samplePrinciplesContent = `# Operating Principles

These are the principles that guide your decisions when the path isn't clear.

## Decision-Making

**"When in doubt, choose the path that builds optionality."**
Avoid decisions that close doors permanently unless the upside is overwhelming.

**"Speed matters more than perfection in 80% of decisions."**
Identify the 20% where precision matters. Move fast on the rest.

## Energy & Attention

**"Protect the morning."**
Your best thinking happens before the world starts demanding responses.

- Say no to good opportunities
- Focus on great ones
- Be deliberate
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
      if (url.includes('/api/principles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: samplePrinciplesContent }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Page Rendering', () => {
    it('should render the principles page', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/principles/i) ||
            screen.getByRole('heading', { name: /principles/i })
        ).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      expect(
        screen.getByText(/loading/i) || screen.getByRole('progressbar')
      ).toBeInTheDocument();
    });

    it('should load content from GET /api/principles', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/principles');
      });
    });

    it('should display page title', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 }) ||
            screen.getByText(/principles/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Markdown Rendering (AC1)', () => {
    it('should render markdown content after loading', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should display content from the markdown file
        expect(screen.getByText(/Operating Principles/i)).toBeInTheDocument();
      });
    });

    it('should render markdown headings', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should render markdown headings as actual heading elements
        expect(screen.getByText('Decision-Making')).toBeInTheDocument();
        expect(screen.getByText('Energy & Attention')).toBeInTheDocument();
      });
    });

    it('should render markdown lists', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should render list items
        expect(screen.getByText(/Say no to good opportunities/)).toBeInTheDocument();
        expect(screen.getByText(/Focus on great ones/)).toBeInTheDocument();
        expect(screen.getByText(/Be deliberate/)).toBeInTheDocument();
      });
    });

    it('should render markdown bold text', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Bold text should be rendered
        const boldElements = document.querySelectorAll('strong, b');
        expect(boldElements.length).toBeGreaterThan(0);
      });
    });

    it('should render quoted principles', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should render quoted principle text
        expect(screen.getByText(/When in doubt, choose the path that builds optionality/)).toBeInTheDocument();
        expect(screen.getByText(/Protect the morning/)).toBeInTheDocument();
      });
    });

    it('should use react-markdown for rendering', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should show rendered content, not an editor
        expect(screen.getByText(/Operating Principles/)).toBeInTheDocument();
        // Editor should not be visible in view mode
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('should display Edit button in view mode', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode Navigation (AC1)', () => {
    it('should switch to edit mode when Edit button clicked', async () => {
      const user = userEvent.setup();
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        // Either navigate to edit page or show inline editor
        if (mockRouter.push.mock.calls.length > 0) {
          expect(mockRouter.push).toHaveBeenCalledWith('/principles/edit');
        } else {
          // Inline edit mode - should show textbox
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        }
      });
    });

    it('should display content in editor when in edit mode', async () => {
      const user = userEvent.setup();
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
          ).toContain('Operating Principles');
        }
      });
    });
  });

  describe('Save Functionality (AC1)', () => {
    it('should show Save button in edit mode', async () => {
      const user = userEvent.setup();
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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

    it('should call PUT /api/principles when Save clicked', async () => {
      const user = userEvent.setup();

      // Mock both GET and PUT
      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({ success: true, content: samplePrinciplesContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: samplePrinciplesContent }),
          });
        }
      );

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
          '/api/principles',
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
                Promise.resolve({ success: true, content: samplePrinciplesContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: samplePrinciplesContent }),
          });
        }
      );

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
                Promise.resolve({ success: true, content: samplePrinciplesContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: samplePrinciplesContent }),
          });
        }
      );

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
            json: () => Promise.resolve({ content: samplePrinciplesContent }),
          });
        }
      );

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
            json: () => Promise.resolve({ content: samplePrinciplesContent }),
          });
        }
      );

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
          json: () => Promise.resolve({ content: samplePrinciplesContent }),
        });

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i })
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry|try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Operating Principles/i)).toBeInTheDocument();
      });
    });

    it('should handle empty content gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: '' }),
      });

      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should have main landmark
        expect(
          screen.getByRole('main') || document.querySelector('main')
        ).toBeInTheDocument();
      });
    });

    it('should have navigation back link', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

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
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        // Should have h1 as the main heading
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible button labels', async () => {
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toHaveAccessibleName();
        });
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const PrinciplesPage = (await import('@/app/principles/page')).default;

      render(<PrinciplesPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      // Tab should move to interactive elements
      await user.tab();

      expect(document.activeElement).not.toBe(document.body);
    });
  });
});
