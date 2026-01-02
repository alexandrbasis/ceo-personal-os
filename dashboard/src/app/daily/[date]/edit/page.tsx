'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { DailyForm } from '@/components/DailyForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DailyReview, DailyReviewFormData } from '@/lib/types';

/**
 * Edit Daily Review Page
 * Displays form pre-filled with existing review data
 */
export default function EditDailyReviewPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;

  const [review, setReview] = useState<DailyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/reviews/daily/${date}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('No review found for this date');
          } else {
            setError('Failed to load review');
          }
          return;
        }

        const data = await response.json();
        setReview(data);
      } catch (err) {
        setError('Failed to load review');
        console.error('Fetch review error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (date) {
      fetchReview();
    }
  }, [date]);

  const handleSubmit = async (data: DailyReviewFormData) => {
    try {
      const response = await fetch(`/api/reviews/daily/${date}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }

      toast.success('Review updated successfully!');

      // Redirect to view page after short delay for toast to show
      setTimeout(() => {
        router.push(`/daily/${date}`);
      }, 500);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update review';
      toast.error(message);
      return { success: false };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{error || 'Not found'}</p>
                <Button asChild variant="outline">
                  <Link href="/">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Convert review to form data format
  const initialData: Partial<DailyReviewFormData> = {
    date: review.date,
    energyLevel: review.energyLevel,
    energyFactors: review.energyFactors || '',
    meaningfulWin: review.meaningfulWin,
    frictionPoint: review.frictionPoint || '',
    frictionAction: review.frictionAction,
    thingToLetGo: review.thingToLetGo || '',
    tomorrowPriority: review.tomorrowPriority,
    notes: review.notes || '',
    completionTimeMinutes: review.completionTimeMinutes,
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Review - {date}</CardTitle>
              <Button asChild variant="outline">
                <Link href={`/daily/${date}`}>Cancel</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DailyForm onSubmit={handleSubmit} initialData={initialData} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
