'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FrameworkEditor } from '@/components/FrameworkEditor';

/**
 * Framework display names for page titles
 */
const FRAMEWORK_NAMES: Record<string, string> = {
  'annual-review': 'Annual Review',
  'vivid-vision': 'Vivid Vision',
  'ideal-life-costing': 'Ideal Lifestyle Costing',
};

/**
 * Valid framework slugs
 */
const VALID_FRAMEWORKS = ['annual-review', 'vivid-vision', 'ideal-life-costing'];

type PageMode = 'view' | 'edit';

interface FrameworkDetailPageProps {
  params: Promise<{ name: string }> | { name: string };
}

/**
 * Framework Detail Page
 * Route: /frameworks/[name]
 *
 * Features:
 * - Displays framework content with markdown rendering
 * - Edit button to switch to edit mode
 * - Save functionality that commits changes via API
 * - Loading and error states with retry functionality
 * - Toast notifications for success/error
 * - 404 for invalid framework names
 */
export default function FrameworkDetailPage({ params }: FrameworkDetailPageProps) {
  // Handle both Promise (Next.js runtime) and plain object (tests)
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { name } = resolvedParams;

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<PageMode>('view');

  // Get display name for the framework
  const displayName = FRAMEWORK_NAMES[name] || name;

  const fetchContent = useCallback(async () => {
    // Validate framework name before fetching
    if (!VALID_FRAMEWORKS.includes(name)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await fetch(`/api/frameworks/${name}`);

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

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
  }, [name]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleEdit = () => {
    setMode('edit');
  };

  const handleSave = async (newContent: string) => {
    const response = await fetch(`/api/frameworks/${name}`, {
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
    toast.success('Framework saved successfully');
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

  // 404 state
  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Not Found</h1>
                <p className="text-muted-foreground mb-4">
                  The framework &quot;{name}&quot; was not found. It may not exist or is not available.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/frameworks" aria-label="Back to Frameworks">
                    Back to Frameworks
                  </Link>
                </Button>
              </div>
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
                    <Link href="/frameworks" aria-label="Back to Frameworks">
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
                  <h1>Edit {displayName}</h1>
                </CardTitle>
                <Button variant="outline" asChild aria-label="Back">
                  <Link href="/frameworks">Back</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FrameworkEditor
                initialContent={content}
                onSave={handleSave}
                onCancel={handleCancel}
                frameworkName={name}
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
                <h1>{displayName}</h1>
              </CardTitle>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild aria-label="Back">
                  <Link href="/frameworks">Back</Link>
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
                  No content yet. Click Edit to start writing.
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
