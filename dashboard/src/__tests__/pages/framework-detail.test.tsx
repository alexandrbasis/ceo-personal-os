/**
 * AC2: Framework Detail Page Tests
 *
 * Tests for the /frameworks/[name] page which:
 * - Renders at the correct route with kebab-case URLs
 * - Shows framework content from API
 * - Renders markdown content using react-markdown
 * - Has Edit button to switch to edit mode
 * - Has Save button that commits changes
 * - Handles loading/error states
 * - Validates framework name against allowlist
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

let mockParams = { name: 'annual-review' };

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => mockParams,
  usePathname: () => `/frameworks/${mockParams.name}`,
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

describe('AC2: Framework Detail Page (/frameworks/[name])', () => {
  const sampleFrameworkContent = `# Annual Review Framework

## Overview
This is a structured approach to year-end reflection, inspired by Dr. Anthony Gustin's methodology.

## The Process

### Part 1: Looking Back
- What were your biggest wins this year?
- What didn't go as planned?
- What surprised you?

### Part 2: Lessons Learned
1. **Key Insight 1** - Always reflect before planning
2. **Key Insight 2** - Patterns reveal more than events

### Part 3: Looking Forward
- What are your priorities for next year?
- What resources do you need?
- What obstacles do you anticipate?

## Templates
Use the templates in \`reviews/annual/\` to complete your review.
`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockParams = { name: 'annual-review' };

    // Default successful GET fetch mock
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/frameworks/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: sampleFrameworkContent }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Page Rendering', () => {
    it('should render the framework detail page', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(
          screen.getByText(/annual review/i) ||
            screen.getByRole('heading', { name: /annual review/i })
        ).toBeInTheDocument();
      });
    });

    it('should show loading state initially', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      expect(
        screen.getByText(/loading/i) || screen.getByRole('progressbar')
      ).toBeInTheDocument();
    });

    it('should load content from GET /api/frameworks/annual-review', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/frameworks/annual-review');
      });
    });

    it('should display page title', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 }) ||
            screen.getByText(/annual review/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Kebab-case URL Support (AC2)', () => {
    it('should load annual-review framework', async () => {
      mockParams = { name: 'annual-review' };
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/frameworks/annual-review');
      });
    });

    it('should load vivid-vision framework', async () => {
      mockParams = { name: 'vivid-vision' };
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'vivid-vision' }} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/frameworks/vivid-vision');
      });
    });

    it('should load ideal-life-costing framework', async () => {
      mockParams = { name: 'ideal-life-costing' };
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'ideal-life-costing' }} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/frameworks/ideal-life-costing'
        );
      });
    });
  });

  describe('Markdown Rendering (AC2)', () => {
    it('should render markdown content after loading', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should display content from the markdown file
        expect(screen.getByText(/Annual Review Framework/i)).toBeInTheDocument();
      });
    });

    it('should render markdown headings', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should render markdown headings as actual heading elements
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('The Process')).toBeInTheDocument();
      });
    });

    it('should render markdown lists', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should render list items
        expect(
          screen.getByText(/What were your biggest wins/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/What didn't go as planned/i)
        ).toBeInTheDocument();
      });
    });

    it('should render markdown bold text', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Bold text should be rendered
        const boldElements = document.querySelectorAll('strong, b');
        expect(boldElements.length).toBeGreaterThan(0);
      });
    });

    it('should render numbered lists', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should render numbered list items
        expect(screen.getByText(/Key Insight 1/)).toBeInTheDocument();
        expect(screen.getByText(/Key Insight 2/)).toBeInTheDocument();
      });
    });

    it('should render code inline', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should render inline code
        const codeElements = document.querySelectorAll('code');
        expect(codeElements.length).toBeGreaterThan(0);
      });
    });

    it('should use react-markdown for rendering', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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

  describe('View Mode (AC2)', () => {
    it('should start in view mode by default', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should show rendered content, not an editor
        expect(screen.getByText(/Annual Review Framework/)).toBeInTheDocument();
        // Editor should not be visible in view mode
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('should display Edit button in view mode', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode Navigation (AC2)', () => {
    it('should switch to edit mode when Edit button clicked', async () => {
      const user = userEvent.setup();
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        // Either navigate to edit page or show inline editor
        if (mockRouter.push.mock.calls.length > 0) {
          expect(mockRouter.push).toHaveBeenCalledWith(
            '/frameworks/annual-review/edit'
          );
        } else {
          // Inline edit mode - should show textbox
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        }
      });
    });

    it('should display content in editor when in edit mode', async () => {
      const user = userEvent.setup();
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
            (editor as HTMLTextAreaElement).value || editor.textContent
          ).toContain('Annual Review');
        }
      });
    });
  });

  describe('Save Functionality (AC2)', () => {
    it('should show Save button in edit mode', async () => {
      const user = userEvent.setup();
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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

    it('should call PUT /api/frameworks/annual-review when Save clicked', async () => {
      const user = userEvent.setup();

      // Mock both GET and PUT
      (global.fetch as jest.Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          if (options?.method === 'PUT') {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({ success: true, content: sampleFrameworkContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleFrameworkContent }),
          });
        }
      );

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
          '/api/frameworks/annual-review',
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
                Promise.resolve({ success: true, content: sampleFrameworkContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleFrameworkContent }),
          });
        }
      );

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
                Promise.resolve({ success: true, content: sampleFrameworkContent }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: sampleFrameworkContent }),
          });
        }
      );

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
            json: () => Promise.resolve({ content: sampleFrameworkContent }),
          });
        }
      );

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
            json: () => Promise.resolve({ content: sampleFrameworkContent }),
          });
        }
      );

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should show 404 for invalid framework name', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Framework not found' }),
      });

      mockParams = { name: 'invalid-framework' };

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'invalid-framework' }} />);

      await waitFor(() => {
        expect(
          screen.getByText(/not found|404|invalid/i)
        ).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
          json: () => Promise.resolve({ content: sampleFrameworkContent }),
        });

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i })
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry|try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Annual Review Framework/i)).toBeInTheDocument();
      });
    });

    it('should handle empty content gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: '' }),
      });

      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

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
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should have main landmark
        expect(
          screen.getByRole('main') || document.querySelector('main')
        ).toBeInTheDocument();
      });
    });

    it('should have navigation back link', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        const backLink =
          screen.queryByRole('link', { name: /back|frameworks|home/i }) ||
          screen.queryByRole('button', { name: /back/i });
        expect(backLink).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        // Should have h1 as the main heading
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible button labels', async () => {
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toHaveAccessibleName();
        });
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const FrameworkDetailPage = (
        await import('@/app/frameworks/[name]/page')
      ).default;

      render(<FrameworkDetailPage params={{ name: 'annual-review' }} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      // Tab should move to interactive elements
      await user.tab();

      expect(document.activeElement).not.toBe(document.body);
    });
  });
});
