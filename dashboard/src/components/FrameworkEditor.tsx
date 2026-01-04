'use client';

import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface FrameworkEditorProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
  frameworkName?: string;
}

type EditorMode = 'edit' | 'preview';

/**
 * FrameworkEditor - Rich markdown editor for framework files
 *
 * Features:
 * - Rich markdown editor with formatting toolbar
 * - Toggle between edit and preview modes (tab-based)
 * - Toolbar with bold, italic, headers, lists, links
 * - No auto-save (following NorthStarEditor pattern)
 * - Save and cancel functionality
 */
export function FrameworkEditor({
  initialContent,
  onSave,
  onCancel,
  frameworkName,
}: FrameworkEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<EditorMode>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Insert markdown formatting at cursor position
   */
  const insertFormatting = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end);

      setContent(newText);

      // Restore cursor position after state update
      requestAnimationFrame(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [content]
  );

  // Toolbar formatting handlers
  const handleBold = () => insertFormatting('**', '**');
  const handleItalic = () => insertFormatting('*', '*');
  const handleHeader = () => insertFormatting('## ');
  const handleList = () => insertFormatting('- ');
  const handleLink = () => insertFormatting('[', '](url)');

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave(content);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  // Generate aria label based on framework name or default
  const editorLabel = frameworkName
    ? `${frameworkName} content`
    : 'Framework content';

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Error display */}
      {error && (
        <div
          role="alert"
          className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
        >
          Error: {error}
        </div>
      )}

      {/* Mode toggle buttons (tabs) */}
      <div role="tablist" className="flex items-center gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'edit'}
          aria-label="Edit"
          onClick={() => setMode('edit')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'edit'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'preview'}
          aria-label="Preview"
          onClick={() => setMode('preview')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Edit mode: Toolbar and Textarea */}
      {mode === 'edit' && (
        <>
          {/* Formatting toolbar */}
          <div
            role="toolbar"
            aria-label="Formatting toolbar"
            data-testid="editor-toolbar"
            className="flex gap-2 p-2 border rounded-md bg-muted/30"
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleBold}
              title="Bold"
              aria-label="Bold"
            >
              B
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleItalic}
              title="Italic"
              aria-label="Italic"
              className="italic"
            >
              I
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleHeader}
              title="Header"
              aria-label="Header"
            >
              H
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleList}
              title="List"
              aria-label="List"
            >
              List
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleLink}
              title="Link"
              aria-label="Link"
            >
              Link
            </Button>
          </div>

          {/* Editor textarea */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label={editorLabel}
            data-testid="framework-editor"
            className="flex-1 min-h-[400px] font-mono text-sm resize-none"
            placeholder="Write your framework content..."
          />
        </>
      )}

      {/* Preview mode: Rendered markdown */}
      {mode === 'preview' && (
        <div
          data-testid="markdown-preview"
          role="article"
          className="markdown-preview flex-1 min-h-[400px] p-4 border rounded-md overflow-auto prose prose-sm max-w-none dark:prose-invert bg-background"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          aria-label="Cancel"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          aria-label="Save"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
