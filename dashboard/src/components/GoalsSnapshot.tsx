'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Goal {
  title: string;
  description: string;
  status: 'On Track' | 'Needs Attention' | 'Behind';
}

interface GoalsData {
  goals: Goal[];
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get status badge class based on goal status
 * - Green: On Track
 * - Yellow/Amber: Needs Attention
 * - Red: Behind
 */
function getStatusBadgeClass(status: Goal['status']): string {
  switch (status) {
    case 'On Track':
      return 'bg-green-100 text-green-800';
    case 'Needs Attention':
      return 'bg-yellow-100 text-yellow-800';
    case 'Behind':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * GoalsSnapshot - Dashboard card showing first 3-5 goals with status
 * Features:
 * - Displays goals from /api/goals/snapshot
 * - Status indicators (On Track / Needs Attention / Behind)
 * - Truncated descriptions (>100 chars)
 * - Loading and error states with retry
 * - Navigation to /goals page
 */
export function GoalsSnapshot() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/goals/snapshot');
      if (!response.ok) {
        throw new Error('Failed to load goals');
      }
      const data: GoalsData = await response.json();
      // Limit to max 5 goals
      setGoals(data.goals.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleRetry = () => {
    fetchGoals();
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        data-testid="goals-snapshot-card"
        role="region"
        aria-label="Goals Snapshot"
        className="rounded-xl border shadow"
      >
        <CardHeader>
          <CardTitle>
            <h2>Goals Snapshot</h2>
          </CardTitle>
          <CardAction>
            <Link href="/goals" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div data-testid="loading-spinner" className="text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        data-testid="goals-snapshot-card"
        role="region"
        aria-label="Goals Snapshot"
        className="rounded-xl border shadow"
      >
        <CardHeader>
          <CardTitle>
            <h2>Goals Snapshot</h2>
          </CardTitle>
          <CardAction>
            <Link href="/goals" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
          <Button
            variant="outline"
            onClick={handleRetry}
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (goals.length === 0) {
    return (
      <Card
        data-testid="goals-snapshot-card"
        role="region"
        aria-label="Goals Snapshot"
        className="rounded-xl border shadow"
      >
        <CardHeader>
          <CardTitle>
            <h2>Goals Snapshot</h2>
          </CardTitle>
          <CardAction>
            <Link href="/goals" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No goals set yet. Start adding your goals!</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      data-testid="goals-snapshot-card"
      role="region"
      aria-label="Goals Snapshot"
      className="rounded-xl border shadow"
    >
      <CardHeader className="card-header">
        <CardTitle>
          <h2>Goals Snapshot</h2>
        </CardTitle>
        <CardAction>
          <Link href="/goals" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {goals.map((goal, index) => (
            <li key={index} data-testid={`goal-item-${index}`}>
              <Link
                href="/goals"
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{goal.title}</span>
                  <span
                    aria-label={goal.status}
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                      getStatusBadgeClass(goal.status)
                    )}
                  >
                    {goal.status}
                  </span>
                </div>
                {goal.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {truncateText(goal.description)}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
