'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrinciplesEditor } from '@/components/PrinciplesEditor';

type PageMode = 'view' | 'edit';

/**
 * Principles Page
 * Route: /principles
 *
 * Features:
 * - Displays current principles content with markdown rendering
 * - Edit button to switch to edit mode
 * - Save functionality that commits changes to principles.md
 * - Loading and error states with retry functionality
 * - Toast notifications for success/error
 */
export default function PrinciplesPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<PageMode>('view');

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/principles');

      if (!response.ok) {
        throw new Error('Failed to load content');
      }

      const data = await response.json();
      setContent(data.content || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleEdit = () => {
    setMode('edit');
  };

  const handleSave = async (newContent: string) => {
    const response = await fetch('/api/principles', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newContent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || 'Failed to save';
      toast.error(message);
      throw new Error(message);
    }

    // Update local state and switch back to view mode
    setContent(newContent);
    setMode('view');
    toast.success('Principles saved successfully');
  };

  const handleCancel = () => {
    setMode('view');
  };

  const handleRetry = () => {
    fetchContent();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">Loading...</div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-destructive mb-4">Error: {error}</p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    aria-label="Try Again"
                  >
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/" aria-label="Back to Dashboard">
                      Back
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Edit mode
  if (mode === 'edit') {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <h1>Edit Principles</h1>
                </CardTitle>
                <Button variant="outline" asChild aria-label="Back">
                  <Link href="/">Back</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PrinciplesEditor
                initialContent={content}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // View mode (default)
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <h1>My Principles</h1>
              </CardTitle>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild aria-label="Back">
                  <Link href="/">Back</Link>
                </Button>
                <Button onClick={handleEdit} aria-label="Edit">
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {content ? (
              <div
                data-testid="markdown-content"
                className="prose prose-sm max-w-none dark:prose-invert"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Shift heading levels: h1 -> h2, h2 -> h3, etc.
                    // This prevents conflict with page-level h1
                    h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
                    h2: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
                    h3: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
                    h4: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
                    h5: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
                    h6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No content yet. Start writing your principles.
                </p>
                <Button onClick={handleEdit} aria-label="Edit">Edit</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
