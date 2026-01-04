/**
 * AC2: MemoryEditor Component Tests
 *
 * Tests for the MemoryEditor component which provides:
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

describe('AC2: MemoryEditor Component', () => {
  const sampleContent = `# Memory

This is your accumulated self-knowledge.

## Energy Patterns

**Best work hours**: 6am-11am (deep work), afternoon for meetings
**Energy drains**: Back-to-back meetings, context switching

## Decision-Making Patterns

**Tendency to overthink**: Yes, especially on reversible decisions
**Risk tolerance**: Medium-high for career, low for health
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'New memory content');

      expect(editor).toHaveValue('New memory content');
    });
  });

  describe('Formatting Toolbar (AC2)', () => {
    it('should render formatting toolbar', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('should have bold button', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const boldButton = screen.getByRole('button', { name: /bold/i });
      expect(boldButton).toBeInTheDocument();
    });

    it('should have italic button', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const italicButton = screen.getByRole('button', { name: /italic/i });
      expect(italicButton).toBeInTheDocument();
    });

    it('should have headers button or dropdown', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const headersButton = screen.getByRole('button', { name: /header|heading|h1|h2/i });
      expect(headersButton).toBeInTheDocument();
    });

    it('should have list button', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const listButton = screen.getByRole('button', { name: /list|bullet|numbered/i });
      expect(listButton).toBeInTheDocument();
    });

    it('should have link button', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
          expect.stringMatching(/memory.*draft|draft.*memory/i),
          expect.stringContaining('Draft content')
        );
      });
    });

    it('should restore draft from localStorage on mount', async () => {
      // Pre-populate localStorage with a draft
      mockLocalStorage['memoryDraft'] = 'Restored draft content';
      mockLocalStorage['memory-draft'] = 'Restored draft content';

      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        // Should restore draft content from localStorage
        expect(localStorageMock.getItem).toHaveBeenCalledWith(
          expect.stringMatching(/memory.*draft|draft.*memory/i)
        );
      });
    });

    it('should clear draft from localStorage after successful save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          expect.stringMatching(/memory.*draft|draft.*memory/i)
        );
      });
    });

    it('should debounce auto-save to avoid excessive writes', async () => {
      const user = userEvent.setup();
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
            (call: string[]) => call[0].toLowerCase().includes('memory')
          );
          expect(setItemCalls.length).toBeLessThan(3);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Save Functionality (AC2)', () => {
    it('should render Save button', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'Modified memory content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('Modified memory content');
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

      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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

      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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

      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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

      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAccessibleName();
    });

    it('should have accessible labels for toolbar buttons', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle very long content', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      const longContent = '# Memory\n\n' + 'A'.repeat(100000);

      render(
        <MemoryEditor
          initialContent={longContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle special characters in content', async () => {
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      const specialContent = `# Special Characters

& < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Code: \`const x = 1 && 2\`
`;

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      const codeContent = `# Code Example

\`\`\`javascript
function decide() {
  return 'option A';
}
\`\`\`
`;

      render(
        <MemoryEditor
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
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      const tableContent = `# Energy Patterns Table

| Time | Energy Level | Best For |
|------|--------------|----------|
| 6-11am | High | Deep work |
| 2-4pm | Low | Meetings |
`;

      render(
        <MemoryEditor
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

    it('should not recreate draft after save even with pending debounce timer', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockOnSave.mockResolvedValue(undefined);
      const { MemoryEditor } = await import('@/components/MemoryEditor');

      render(
        <MemoryEditor
          initialContent="initial"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');

      // Type something to trigger debounced auto-save
      await user.type(editor, ' updated');

      // Clear mock to track only post-save calls
      localStorageMock.removeItem.mockClear();
      localStorageMock.setItem.mockClear();

      // Save immediately (before debounce fires)
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Wait for save to complete
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      // Verify draft was removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        expect.stringMatching(/memory.*draft|draft.*memory/i)
      );

      // Advance timers past the debounce period
      jest.advanceTimersByTime(1000);

      // Draft should NOT have been recreated by the debounce timer
      // setItem should not have been called after removeItem
      const setItemCalls = localStorageMock.setItem.mock.calls.filter(
        (call: string[]) => call[0].toLowerCase().includes('memory')
      );
      expect(setItemCalls.length).toBe(0);

      jest.useRealTimers();
    });
  });
});
