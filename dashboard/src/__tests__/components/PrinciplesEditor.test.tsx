/**
 * AC2: PrinciplesEditor Component Tests
 *
 * Tests for the PrinciplesEditor component which provides:
 * - Rich markdown editor with formatting toolbar
 * - Toggle between edit and preview modes
 * - Toolbar with bold, italic, headers, lists, links
 * - Auto-save draft to localStorage
 * - Save and cancel functionality
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
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
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

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => mockLocalStorage[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  }),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AC2: PrinciplesEditor Component', () => {
  const sampleContent = `# Operating Principles

## Decision-Making

**"When in doubt, choose the path that builds optionality."**
Avoid decisions that close doors permanently unless the upside is overwhelming.

**"Speed matters more than perfection in 80% of decisions."**
Identify the 20% where precision matters. Move fast on the rest.

## Energy & Attention

**"Protect the morning."**
Your best thinking happens before the world starts demanding responses.
`;

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    localStorageMock.clear();

    // Default successful fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, content: sampleContent }),
    });
  });

  describe('Rich Markdown Editor (AC2)', () => {
    it('should render rich markdown editor', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have an editor element
      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
    });

    it('should display initial content in editor', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Content should be displayed in the textbox
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveValue(sampleContent);
    });

    it('should update content when typing', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'New principle content');

      expect(editor).toHaveValue('New principle content');
    });
  });

  describe('Formatting Toolbar (AC2)', () => {
    it('should render formatting toolbar', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('should have bold button', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const boldButton = screen.getByRole('button', { name: /bold/i });
      expect(boldButton).toBeInTheDocument();
    });

    it('should have italic button', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const italicButton = screen.getByRole('button', { name: /italic/i });
      expect(italicButton).toBeInTheDocument();
    });

    it('should have headers button or dropdown', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const headersButton = screen.getByRole('button', { name: /header|heading|h1|h2/i });
      expect(headersButton).toBeInTheDocument();
    });

    it('should have list button', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const listButton = screen.getByRole('button', { name: /list|bullet|numbered/i });
      expect(listButton).toBeInTheDocument();
    });

    it('should have link button', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const linkButton = screen.getByRole('button', { name: /link/i });
      expect(linkButton).toBeInTheDocument();
    });

    it('should apply bold formatting when bold button clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent="test"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      // Select all text using keyboard shortcut
      await user.click(editor);
      await user.keyboard('{Control>}a{/Control}');

      const boldButton = screen.getByRole('button', { name: /bold/i });
      await user.click(boldButton);

      // Should wrap selected text with ** for markdown bold
      await waitFor(() => {
        const content = editor.textContent || (editor as HTMLTextAreaElement).value;
        expect(content).toMatch(/\*\*test\*\*|<strong>|<b>/);
      });
    });
  });

  describe('Edit/Preview Toggle (AC2)', () => {
    it('should have toggle between edit and preview modes', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have edit tab/button
      const editToggle = screen.getByRole('tab', { name: /edit/i });
      expect(editToggle).toBeInTheDocument();

      // Should have preview tab/button
      const previewToggle = screen.getByRole('tab', { name: /preview/i });
      expect(previewToggle).toBeInTheDocument();
    });

    it('should start in edit mode by default', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Editor should be visible in edit mode
      const editor = screen.getByRole('textbox');
      expect(editor).toBeVisible();
    });

    it('should switch to preview mode when preview clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const previewToggle = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // In preview mode, should show rendered markdown, not editor
        const preview = screen.getByTestId('markdown-preview');
        expect(preview).toBeInTheDocument();
      });
    });

    it('should render markdown content in preview mode', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent="# Heading\n\n**Bold text**"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const previewToggle = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // Should render heading
        expect(screen.getByRole('heading', { name: /heading/i })).toBeInTheDocument();
      });
    });

    it('should switch back to edit mode when edit clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to preview
      const previewToggle = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewToggle);

      // Switch back to edit
      const editToggle = screen.getByRole('tab', { name: /edit/i });
      await user.click(editToggle);

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeVisible();
      });
    });
  });

  describe('Auto-save Draft to localStorage (AC2)', () => {
    it('should auto-save draft to localStorage when typing', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'Draft content');

      // Should save to localStorage
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          expect.stringMatching(/principles.*draft|draft.*principles/i),
          expect.stringContaining('Draft content')
        );
      });
    });

    it('should restore draft from localStorage on mount', async () => {
      // Pre-populate localStorage with a draft
      mockLocalStorage['principlesDraft'] = 'Restored draft content';
      mockLocalStorage['principles-draft'] = 'Restored draft content';

      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        // Should restore draft content from localStorage
        expect(localStorageMock.getItem).toHaveBeenCalledWith(
          expect.stringMatching(/principles.*draft|draft.*principles/i)
        );
      });
    });

    it('should clear draft from localStorage after successful save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          expect.stringMatching(/principles.*draft|draft.*principles/i)
        );
      });
    });

    it('should debounce auto-save to avoid excessive writes', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');

      // Type rapidly
      await user.type(editor, 'abc');

      // Should not call setItem for every keystroke (debounced)
      // Allow some time for debounce
      await waitFor(
        () => {
          // The setItem calls should be less than total keystrokes
          const setItemCalls = localStorageMock.setItem.mock.calls.filter(
            (call: string[]) => call[0].toLowerCase().includes('principles')
          );
          expect(setItemCalls.length).toBeLessThan(3);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Save Functionality (AC2)', () => {
    it('should render Save button', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should call onSave with content when Save clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(sampleContent);
      });
    });

    it('should call onSave with modified content', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'Modified principles content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('Modified principles content');
      });
    });

    it('should disable Save button while saving', async () => {
      const user = userEvent.setup();

      // Make onSave take some time
      const slowOnSave = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={slowOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('should show loading indicator while saving', async () => {
      const user = userEvent.setup();

      const slowOnSave = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={slowOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('should handle save error gracefully', async () => {
      const user = userEvent.setup();

      const failingOnSave = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={failingOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should re-enable Save button after save error', async () => {
      const user = userEvent.setup();

      const failingOnSave = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={failingOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Cancel Functionality (AC2)', () => {
    it('should render Cancel button', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should call onCancel when Cancel button clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not call onSave when Cancel clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should not save unsaved changes when Cancel clicked', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Make some changes
      const editor = screen.getByRole('textbox');
      await user.type(editor, 'Unsaved changes');

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // onSave should NOT have been called with the new content
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for editor', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAccessibleName();
    });

    it('should have accessible labels for toolbar buttons', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Each button should have an accessible name (either aria-label, title, or text content)
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Tab should move through interactive elements
      await user.tab();

      // Some element should be focused
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initial content', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      render(
        <PrinciplesEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle very long content', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      const longContent = '# Principles\n\n' + 'A'.repeat(100000);

      render(
        <PrinciplesEditor
          initialContent={longContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle special characters in content', async () => {
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      const specialContent = `# Special Characters

& < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Code: \`const x = 1 && 2\`
`;

      render(
        <PrinciplesEditor
          initialContent={specialContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle markdown with code blocks', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      const codeContent = `# Code Example

\`\`\`javascript
function decide() {
  return 'option A';
}
\`\`\`
`;

      render(
        <PrinciplesEditor
          initialContent={codeContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to preview
      const previewToggle = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // Code should be visible in preview
        expect(screen.getByText(/function decide/)).toBeInTheDocument();
      });
    });

    it('should handle markdown with tables', async () => {
      const user = userEvent.setup();
      const { PrinciplesEditor } = await import('@/components/PrinciplesEditor');

      const tableContent = `# Retired Principles

| Principle | Why It Was Retired | Date |
|-----------|-------------------|------|
| Old Rule   | No longer relevant | 2024 |
`;

      render(
        <PrinciplesEditor
          initialContent={tableContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to preview
      const previewToggle = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // Table should be visible
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });
});
