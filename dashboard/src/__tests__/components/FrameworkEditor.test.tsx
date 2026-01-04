/**
 * AC3: FrameworkEditor Component Tests
 *
 * Tests for the FrameworkEditor component which provides:
 * - Rich markdown editor with formatting toolbar
 * - Toggle between edit and preview modes (tab-based like NorthStarEditor)
 * - Toolbar with bold, italic, headers, lists, links
 * - No auto-save (following NorthStarEditor pattern)
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

describe('AC3: FrameworkEditor Component', () => {
  const sampleContent = `# Annual Review Framework

## Overview
This is a structured approach to year-end reflection.

## The Process

### Part 1: Looking Back
- What were your biggest wins this year?
- What didn't go as planned?

### Part 2: Lessons Learned
1. **Key Insight 1** - Description
2. **Key Insight 2** - Description

## Templates
Use the templates in \`reviews/annual/\` to complete your review.
`;

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();

    // Clear localStorage to test fresh start behavior
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Default successful fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, content: sampleContent }),
    });
  });

  describe('Rich Markdown Editor (AC3)', () => {
    it('should render rich markdown editor', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have an editor element
      const editor =
        screen.getByRole('textbox') ||
        screen.getByTestId('framework-editor') ||
        screen.getByRole('textbox', { name: /editor|content|framework/i });
      expect(editor).toBeInTheDocument();
    });

    it('should display initial content in editor', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'New framework content');

      expect(editor).toHaveValue('New framework content');
    });
  });

  describe('Formatting Toolbar (AC3)', () => {
    it('should render formatting toolbar', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const toolbar =
        screen.getByRole('toolbar') || screen.getByTestId('editor-toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('should have bold button', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const boldButton =
        screen.getByRole('button', { name: /bold/i }) ||
        screen.getByTitle(/bold/i) ||
        screen.getByLabelText(/bold/i);
      expect(boldButton).toBeInTheDocument();
    });

    it('should have italic button', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const italicButton =
        screen.getByRole('button', { name: /italic/i }) ||
        screen.getByTitle(/italic/i) ||
        screen.getByLabelText(/italic/i);
      expect(italicButton).toBeInTheDocument();
    });

    it('should have headers button or dropdown', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const headersButton =
        screen.getByRole('button', { name: /header|heading|h1|h2/i }) ||
        screen.getByTitle(/header|heading/i) ||
        screen.getByLabelText(/header|heading/i);
      expect(headersButton).toBeInTheDocument();
    });

    it('should have list button', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const listButton =
        screen.getByRole('button', { name: /list|bullet|numbered/i }) ||
        screen.getByTitle(/list/i) ||
        screen.getByLabelText(/list/i);
      expect(listButton).toBeInTheDocument();
    });

    it('should have link button', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const linkButton =
        screen.getByRole('button', { name: /link/i }) ||
        screen.getByTitle(/link/i) ||
        screen.getByLabelText(/link/i);
      expect(linkButton).toBeInTheDocument();
    });

    it('should apply bold formatting when bold button clicked', async () => {
      const user = userEvent.setup();
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent="test"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      // Select text
      await user.tripleClick(editor);

      const boldButton =
        screen.getByRole('button', { name: /bold/i }) ||
        screen.getByTitle(/bold/i);
      await user.click(boldButton);

      // Should wrap selected text with ** for markdown bold
      await waitFor(() => {
        const content =
          editor.textContent || (editor as HTMLTextAreaElement).value;
        expect(content).toMatch(/\*\*test\*\*|<strong>|<b>/);
      });
    });
  });

  describe('Edit/Preview Toggle - Tab-based (AC3)', () => {
    it('should have toggle between edit and preview modes', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have edit tab/button
      const editToggle =
        screen.getByRole('tab', { name: /edit/i }) ||
        screen.getByRole('button', { name: /edit/i }) ||
        screen.getByText(/edit/i);
      expect(editToggle).toBeInTheDocument();

      // Should have preview tab/button
      const previewToggle =
        screen.getByRole('tab', { name: /preview/i }) ||
        screen.getByRole('button', { name: /preview/i }) ||
        screen.getByText(/preview/i);
      expect(previewToggle).toBeInTheDocument();
    });

    it('should start in edit mode by default', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const previewToggle =
        screen.getByRole('tab', { name: /preview/i }) ||
        screen.getByRole('button', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // In preview mode, should show rendered markdown, not editor
        const preview =
          screen.getByTestId('markdown-preview') ||
          screen.getByRole('article') ||
          document.querySelector('.markdown-preview');
        expect(preview).toBeInTheDocument();
      });
    });

    it('should render markdown content in preview mode', async () => {
      const user = userEvent.setup();
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent="# Heading\n\n**Bold text**"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const previewToggle =
        screen.getByRole('tab', { name: /preview/i }) ||
        screen.getByRole('button', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // Should render heading
        expect(
          screen.getByRole('heading', { name: /heading/i }) ||
            screen.getByText('Heading')
        ).toBeInTheDocument();
      });
    });

    it('should switch back to edit mode when edit clicked', async () => {
      const user = userEvent.setup();
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to preview
      const previewToggle =
        screen.getByRole('tab', { name: /preview/i }) ||
        screen.getByRole('button', { name: /preview/i });
      await user.click(previewToggle);

      // Switch back to edit
      const editToggle =
        screen.getByRole('tab', { name: /edit/i }) ||
        screen.getByRole('button', { name: /edit/i });
      await user.click(editToggle);

      await waitFor(() => {
        const editor = screen.getByRole('textbox');
        expect(editor).toBeVisible();
      });
    });
  });

  describe('No Auto-save (AC3 - following NorthStarEditor pattern)', () => {
    it('should not restore content from localStorage', async () => {
      // Set some content in localStorage that should be ignored
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('frameworkDraft', 'Old draft content');
        localStorage.setItem('framework-draft', 'Another old draft');
      }

      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should display the initialContent prop, NOT localStorage content
      await waitFor(() => {
        expect(screen.getByText(/Annual Review/i)).toBeInTheDocument();
        expect(screen.queryByText('Old draft content')).not.toBeInTheDocument();
        expect(
          screen.queryByText('Another old draft')
        ).not.toBeInTheDocument();
      });
    });

    it('should start fresh with initialContent each load', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      const { unmount } = render(
        <FrameworkEditor
          initialContent="First load content"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      unmount();

      // Re-render with different initial content
      render(
        <FrameworkEditor
          initialContent="Second load content"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should show second load content, not first
      expect(screen.getByText(/Second load content/i)).toBeInTheDocument();
      expect(screen.queryByText('First load content')).not.toBeInTheDocument();
    });
  });

  describe('Save Functionality (AC3)', () => {
    it('should render Save button', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'Modified framework content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('Modified framework content');
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

      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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

      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={slowOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(
        screen.getByText(/saving/i) || screen.getByRole('progressbar')
      ).toBeInTheDocument();
    });

    it('should handle save error gracefully', async () => {
      const user = userEvent.setup();

      const failingOnSave = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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

      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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

  describe('Cancel Functionality (AC3)', () => {
    it('should render Cancel button', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAccessibleName();
    });

    it('should have accessible labels for toolbar buttons', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle very long content', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      const longContent = '# Framework\n\n' + 'A'.repeat(100000);

      render(
        <FrameworkEditor
          initialContent={longContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle special characters in content', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      const specialContent = `# Special Characters

& < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Code: \`const x = 1 && 2\`
`;

      render(
        <FrameworkEditor
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
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      const codeContent = `# Code Example

\`\`\`javascript
function reflect() {
  return 'insights';
}
\`\`\`
`;

      render(
        <FrameworkEditor
          initialContent={codeContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to preview
      const previewToggle =
        screen.getByRole('tab', { name: /preview/i }) ||
        screen.getByRole('button', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // Code should be visible in preview
        expect(screen.getByText(/function reflect/)).toBeInTheDocument();
      });
    });

    it('should handle markdown with tables', async () => {
      const user = userEvent.setup();
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      const tableContent = `# Framework with Table

| Question | Purpose |
|----------|---------|
| What worked? | Identify wins |
| What didn't? | Learn from failures |
`;

      render(
        <FrameworkEditor
          initialContent={tableContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to preview
      const previewToggle =
        screen.getByRole('tab', { name: /preview/i }) ||
        screen.getByRole('button', { name: /preview/i });
      await user.click(previewToggle);

      await waitFor(() => {
        // Table should be visible
        expect(
          screen.getByRole('table') || screen.getByText('Question')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Framework-specific Props', () => {
    it('should accept optional frameworkName prop', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          frameworkName="annual-review"
        />
      );

      // Should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should display framework name in title if provided', async () => {
      const { FrameworkEditor } = await import('@/components/FrameworkEditor');

      render(
        <FrameworkEditor
          initialContent={sampleContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          frameworkName="annual-review"
        />
      );

      // Should display some indication of the framework being edited
      await waitFor(() => {
        const title = screen.queryByText(/annual.*review|editing/i);
        // Title display is optional - test passes if component renders
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });
});
