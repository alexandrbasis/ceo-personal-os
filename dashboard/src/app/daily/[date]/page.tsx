'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DailyReview } from '@/lib/types';

/**
 * View Daily Review Page
 * Displays a read-only view of a daily review with navigation
 */
export default function ViewDailyReviewPage() {
  const params = useParams();
  const date = params.date as string;

  const [review, setReview] = useState<DailyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevDate, setPrevDate] = useState<string | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);

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

        // Fetch all reviews to determine prev/next
        const reviewsRes = await fetch('/api/reviews/daily');
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          const dates = reviewsData.reviews.map((r: { date: string }) => r.date);
          const currentIndex = dates.indexOf(date);

          if (currentIndex > 0) {
            setNextDate(dates[currentIndex - 1]); // Newer review
          }
          if (currentIndex < dates.length - 1) {
            setPrevDate(dates[currentIndex + 1]); // Older review
          }
        }
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

  // Format date for display
  const formatDisplayDate = (dateStr: string): string => {
    try {
      const parsed = parseISO(dateStr);
      return format(parsed, 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Get friction action label
  const getFrictionActionLabel = (action?: string): string => {
    if (action === 'address') return 'Needs Action';
    if (action === 'letting_go') return 'Acknowledgment Only';
    return 'Not specified';
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{formatDisplayDate(date)}</CardTitle>
              <Button asChild>
                <Link href={`/daily/${date}/edit`}>Edit</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <article data-testid="review-content" className="space-y-6">
              {/* Energy Level */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Energy Level</h3>
                <p className="text-2xl font-bold text-primary">{review.energyLevel}/10</p>
                {review.energyFactors && (
                  <p className="mt-2 text-muted-foreground">{review.energyFactors}</p>
                )}
              </section>

              {/* Meaningful Win */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Meaningful Win</h3>
                <p>{review.meaningfulWin}</p>
              </section>

              {/* Friction Point */}
              {review.frictionPoint && (
                <section>
                  <h3 className="font-semibold text-lg mb-2">Friction Point</h3>
                  <p>{review.frictionPoint}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Action: {getFrictionActionLabel(review.frictionAction)}
                  </p>
                </section>
              )}

              {/* Thing to Let Go */}
              {review.thingToLetGo && (
                <section>
                  <h3 className="font-semibold text-lg mb-2">Thing to Let Go</h3>
                  <p>{review.thingToLetGo}</p>
                </section>
              )}

              {/* Tomorrow's Priority */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Priority for Tomorrow</h3>
                <p>{review.tomorrowPriority}</p>
              </section>

              {/* Notes */}
              {review.notes && (
                <section>
                  <h3 className="font-semibold text-lg mb-2">Notes</h3>
                  <p className="whitespace-pre-wrap">{review.notes}</p>
                </section>
              )}

              {/* Completion Time */}
              {review.completionTimeMinutes && (
                <section className="text-sm text-muted-foreground">
                  Completed in {review.completionTimeMinutes} minutes
                </section>
              )}
            </article>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {prevDate ? (
                <Button asChild variant="outline" data-testid="prev-review">
                  <Link href={`/daily/${prevDate}`}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled data-testid="prev-review">
                  Previous
                </Button>
              )}

              <Button asChild variant="ghost">
                <Link href="/">Back to Dashboard</Link>
              </Button>

              {nextDate ? (
                <Button asChild variant="outline" data-testid="next-review">
                  <Link href={`/daily/${nextDate}`}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" disabled data-testid="next-review">
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
