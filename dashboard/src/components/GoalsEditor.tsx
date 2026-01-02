'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Timeframe = '1-year' | '3-year' | '10-year';

type SaveStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'error'
  | 'draft-saving'
  | 'draft-saved'
  | 'draft-error';

export interface GoalsEditorProps {
  timeframe: Timeframe;
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  checkForDraft?: boolean;
}

/**
 * Format timeframe for display
 */
function formatTimeframe(timeframe: Timeframe): string {
  switch (timeframe) {
    case '1-year':
      return '1-Year';
    case '3-year':
      return '3-Year';
    case '10-year':
      return '10-Year';
    default:
      return timeframe;
  }
}

/**
 * GoalsEditor - Markdown editor with live preview for goals
 *
 * Features:
 * - Side-by-side markdown editor and preview
 * - Auto-save draft after 2 seconds of inactivity
 * - Draft restoration prompt
 * - Save and Cancel with unsaved changes warning
 * - Keyboard shortcuts (Ctrl+S)
 * - Formatting toolbar
 */
export function GoalsEditor({
  timeframe,
  initialContent,
  onSave,
  onCancel,
  checkForDraft = false,
}: GoalsEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftContent, setDraftContent] = useState<string | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef(initialContent);
  const cursorPosRef = useRef<{ start: number; end: number } | null>(null);

  const hasUnsavedChanges = content !== savedContent;

  // Restore cursor position after content changes (fixes controlled component cursor reset)
  // Using useLayoutEffect to run synchronously before browser paint
  useLayoutEffect(() => {
    if (cursorPosRef.current && textareaRef.current) {
      const { start, end } = cursorPosRef.current;
      textareaRef.current.setSelectionRange(start, end);
      cursorPosRef.current = null;
    }
  }, [content]);

  // Check for existing draft on mount
  useEffect(() => {
    if (checkForDraft) {
      const checkDraft = async () => {
        try {
          const response = await fetch(`/api/goals/${timeframe}/draft`);
          if (response.ok) {
            const data = await response.json();
            if (data.hasDraft && data.content) {
              setDraftContent(data.content);
              setShowDraftPrompt(true);
            }
          }
        } catch {
          // Ignore draft check errors
        }
      };
      checkDraft();
    }
  }, [checkForDraft, timeframe]);

  // Auto-save draft with debounce (2 seconds)
  useEffect(() => {
    // Only trigger auto-save if content has changed from initial/last saved
    if (content === lastSavedContentRef.current) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setStatus('draft-saving');
      try {
        const response = await fetch(`/api/goals/${timeframe}/draft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          setStatus('draft-saved');
          // Keep showing draft-saved for a moment
          setTimeout(() => {
            setStatus((prev) => (prev === 'draft-saved' ? 'idle' : prev));
          }, 2000);
        } else {
          throw new Error('Failed to save draft');
        }
      } catch {
        setStatus('draft-error');
      }
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content, timeframe]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setStatus('saving');

    try {
      const response = await fetch(`/api/goals/${timeframe}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      // Clear draft after successful save
      await fetch(`/api/goals/${timeframe}/draft`, {
        method: 'DELETE',
      });

      setStatus('saved');
      setSavedContent(content);
      lastSavedContentRef.current = content;
      onSave(content);
    } catch {
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [content, timeframe, onSave]);

  // Handle cancel with unsaved changes warning
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onCancel();
    }
  }, [hasUnsavedChanges, onCancel]);

  // Confirm cancel (discard changes)
  const confirmCancel = useCallback(() => {
    setShowUnsavedWarning(false);
    onCancel();
  }, [onCancel]);

  // Restore draft
  const handleRestoreDraft = useCallback(() => {
    if (draftContent) {
      setContent(draftContent);
      setShowDraftPrompt(false);
      setDraftContent(null);
    }
  }, [draftContent]);

  // Discard draft
  const handleDiscardDraft = useCallback(() => {
    setShowDraftPrompt(false);
    setDraftContent(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Insert text at cursor position
  const insertAtCursor = useCallback((before: string, after: string = '') => {
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

    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [content]);

  // Toolbar actions
  const handleHeading = () => insertAtCursor('# ');
  const handleBold = () => insertAtCursor('**', '**');

  // Get status message
  const getStatusMessage = (): string | null => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Failed to save';
      case 'draft-saving':
        return 'Saving...';
      case 'draft-saved':
        return 'Draft saved';
      case 'draft-error':
        return 'Could not save draft';
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="flex flex-col h-full">
      {/* Header with timeframe and actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Editing {formatTimeframe(timeframe)} Goals</h2>
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          {statusMessage && (
            <span
              role="status"
              aria-live="polite"
              className={`text-sm ${
                status === 'error' || status === 'draft-error'
                  ? 'text-destructive'
                  : status === 'saved' || status === 'draft-saved'
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }`}
            >
              {statusMessage}
            </span>
          )}
          <Button
            variant="outline"
            onClick={handleCancel}
            aria-label="Cancel"
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

      {/* Draft restoration prompt */}
      {showDraftPrompt && (
        <div
          role="alert"
          className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-between"
        >
          <span className="text-sm">
            A draft was found. Would you like to restore it?
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDiscardDraft}
              aria-label="Discard"
            >
              No
            </Button>
            <Button size="sm" onClick={handleRestoreDraft} aria-label="Restore">
              Yes
            </Button>
          </div>
        </div>
      )}

      {/* Unsaved changes warning */}
      {showUnsavedWarning && (
        <div
          role="alert"
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center justify-between"
        >
          <span className="text-sm">
            You have unsaved changes. Are you sure you want to leave?
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUnsavedWarning(false)}
            >
              Keep Editing
            </Button>
            <Button size="sm" variant="destructive" onClick={confirmCancel} aria-label="discard changes">
              Leave
            </Button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Formatting toolbar"
        data-testid="editor-toolbar"
        className="flex gap-2 mb-2 p-2 border rounded-md bg-muted/30"
      >
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleHeading}
          title="Heading"
          aria-label="Heading"
        >
          H
        </Button>
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
      </div>

      {/* Editor and Preview side-by-side */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Editor */}
        <div className="flex flex-col min-h-0">
          <Label htmlFor="goals-editor" className="mb-2">
            Editor
          </Label>
          <Textarea
            ref={textareaRef}
            id="goals-editor"
            aria-label="Goals content"
            value={content}
            onChange={(e) => {
              const target = e.target;
              // Save cursor position after the input event (this is where cursor naturally ends up)
              cursorPosRef.current = {
                start: target.selectionStart,
                end: target.selectionEnd,
              };
              setContent(target.value);
            }}
            className="flex-1 min-h-[400px] font-mono text-sm resize-none"
            placeholder="Enter your goals in markdown format..."
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col min-h-0">
          <Label className="mb-2">Preview</Label>
          <div
            data-testid="markdown-preview"
            role="region"
            aria-label="Preview"
            className="flex-1 min-h-[400px] p-4 border rounded-md overflow-auto prose prose-sm max-w-none dark:prose-invert bg-background"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
