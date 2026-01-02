'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { GoalsEditor } from '@/components/GoalsEditor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Timeframe = '1-year' | '3-year' | '10-year';

const VALID_TIMEFRAMES: Timeframe[] = ['1-year', '3-year', '10-year'];

function isValidTimeframe(value: string): value is Timeframe {
  return VALID_TIMEFRAMES.includes(value as Timeframe);
}

function formatTimeframe(timeframe: Timeframe): string {
  switch (timeframe) {
    case '1-year':
      return '1-Year Goals';
    case '3-year':
      return '3-Year Goals';
    case '10-year':
      return '10-Year Goals';
    default:
      return timeframe;
  }
}

/**
 * Edit Goals Page
 * Displays the GoalsEditor for a specific timeframe
 */
export default function EditGoalsPage() {
  const params = useParams();
  const router = useRouter();
  const timeframe = params.timeframe as string;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      if (!isValidTimeframe(timeframe)) {
        setError('Invalid timeframe');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/goals/${timeframe}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Goals file not found');
          } else {
            const data = await response.json();
            setError(data.error || 'Failed to load goals');
          }
          return;
        }

        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        setError('Failed to load goals');
        console.error('Fetch goals error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (timeframe) {
      fetchGoals();
    }
  }, [timeframe]);

  const handleSave = async (newContent: string) => {
    if (!isValidTimeframe(timeframe)) return;

    try {
      const response = await fetch(`/api/goals/${timeframe}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save goals');
      }

      toast.success('Goals saved successfully!');

      // Redirect to goals page after short delay for toast to show
      setTimeout(() => {
        router.push('/goals');
      }, 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save goals';
      toast.error(message);
    }
  };

  const handleCancel = () => {
    router.push('/goals');
  };

  if (!isValidTimeframe(timeframe)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Invalid timeframe: {timeframe}</p>
                <Button asChild variant="outline">
                  <Link href="/goals">Back to Goals</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (error || content === null) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{error || 'Not found'}</p>
                <Button asChild variant="outline">
                  <Link href="/goals">Back to Goals</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit {formatTimeframe(timeframe)}</CardTitle>
              <Button asChild variant="outline">
                <Link href="/goals">Back to Goals</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <GoalsEditor
              timeframe={timeframe}
              initialContent={content}
              onSave={handleSave}
              onCancel={handleCancel}
              checkForDraft={true}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
