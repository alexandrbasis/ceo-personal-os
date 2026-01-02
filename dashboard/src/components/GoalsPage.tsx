'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Timeframe = '1-year' | '3-year' | '10-year';
type GoalStatus = 'on-track' | 'needs-attention' | 'behind';

interface GoalMetadata {
  status?: GoalStatus;
  last_updated?: string;
}

interface GoalData {
  content: string;
  metadata: GoalMetadata;
}

interface GoalState {
  data: GoalData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Get badge styling class based on goal status
 */
function getStatusBadgeClass(status: GoalStatus | undefined): string {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-800';
    case 'needs-attention':
      return 'bg-yellow-100 text-yellow-800';
    case 'behind':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Format status for display
 */
function formatStatus(status: GoalStatus | undefined): string {
  switch (status) {
    case 'on-track':
      return 'On Track';
    case 'needs-attention':
      return 'Needs Attention';
    case 'behind':
      return 'Behind';
    default:
      return 'Unknown';
  }
}

/**
 * Strip YAML frontmatter from markdown content
 * Frontmatter is between --- markers at the start of the file
 */
function stripFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n?/;
  return content.replace(frontmatterRegex, '').trim();
}

/**
 * GoalsPage - Display goals with tabs for different timeframes
 *
 * Features:
 * - Tabs for 1-year, 3-year, 10-year goals
 * - Markdown rendering with remark-gfm
 * - Status badges (On Track / Needs Attention / Behind)
 * - Loading and error states
 * - Edit button navigation
 * - Link to quarterly reviews
 */
export function GoalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Timeframe>('1-year');
  const [goalState, setGoalState] = useState<GoalState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchGoal = useCallback(async (timeframe: Timeframe) => {
    setGoalState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/goals/${timeframe}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to load goals');
      }

      const data: GoalData = await response.json();
      setGoalState({ data, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load goals';
      setGoalState({ data: null, loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    fetchGoal(activeTab);
  }, [activeTab, fetchGoal]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as Timeframe);
  };

  const handleRetry = () => {
    fetchGoal(activeTab);
  };

  const handleEdit = () => {
    router.push(`/goals/edit?timeframe=${activeTab}`);
  };

  const { data, loading, error } = goalState;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Goals</CardTitle>
              <div className="flex items-center gap-4">
                <Link
                  href="/reviews/quarterly"
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Quarterly Reviews
                </Link>
                <Button onClick={handleEdit} aria-label="Edit">
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="1-year">1-Year</TabsTrigger>
                <TabsTrigger value="3-year">3-Year</TabsTrigger>
                <TabsTrigger value="10-year">10-Year</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <span className="text-destructive">Error: {error}</span>
                    <Button onClick={handleRetry} variant="outline">
                      Try Again
                    </Button>
                  </div>
                )}

                {!loading && !error && data && (
                  <div className="space-y-4">
                    {/* Status and Last Updated */}
                    {(data.metadata?.status || data.metadata?.last_updated) && (
                      <div className="flex items-center gap-4 mb-4">
                        {data.metadata?.status && (
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              getStatusBadgeClass(data.metadata.status)
                            )}
                          >
                            {formatStatus(data.metadata.status)}
                          </span>
                        )}
                        {data.metadata?.last_updated && (
                          <span className="text-sm text-muted-foreground">
                            Updated: {data.metadata.last_updated}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    {data.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {stripFrontmatter(data.content)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <span className="text-muted-foreground">
                          No goals set yet. Start by adding your goals.
                        </span>
                        <Button onClick={handleEdit}>Add Goals</Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
