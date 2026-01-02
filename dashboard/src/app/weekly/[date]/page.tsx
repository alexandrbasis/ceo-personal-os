'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WeeklyReview } from '@/lib/types';

/**
 * View Weekly Review Page
 * Displays a read-only view of a weekly review with navigation
 */
export default function ViewWeeklyReviewPage() {
  const params = useParams();
  const date = params.date as string;

  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevDate, setPrevDate] = useState<string | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/reviews/weekly/${date}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('No review found for this week');
          } else {
            setError('Failed to load review');
          }
          return;
        }

        const data = await response.json();
        setReview(data);

        // Fetch all reviews to determine prev/next
        const reviewsRes = await fetch('/api/reviews/weekly');
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

  // Format week range for display (e.g., "Dec 30 - Jan 5")
  const formatWeekRange = (dateStr: string): string => {
    try {
      const weekStart = parseISO(dateStr);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startMonth = format(weekStart, 'MMM');
      const startDay = format(weekStart, 'd');
      const endMonth = format(weekEnd, 'MMM');
      const endDay = format(weekEnd, 'd');

      if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}`;
      }
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    } catch {
      return dateStr;
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Week {review.weekNumber}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatWeekRange(date)} ({formatDisplayDate(date)})
                </p>
              </div>
              <Button asChild>
                <Link href={`/weekly/${date}/edit`}>Edit</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <article data-testid="review-content" className="space-y-6">
              {/* What Moved the Needle */}
              <section>
                <h3 className="font-semibold text-lg mb-2">What Moved the Needle</h3>
                <p className="whitespace-pre-wrap">{review.movedNeedle}</p>
              </section>

              {/* Noise Disguised as Work */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Noise Disguised as Work</h3>
                <p className="whitespace-pre-wrap">{review.noiseDisguisedAsWork}</p>
              </section>

              {/* Time Leaks */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Where Time Leaked</h3>
                <p className="whitespace-pre-wrap">{review.timeLeaks}</p>
              </section>

              {/* Strategic Insight */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Strategic Insight</h3>
                <p className="whitespace-pre-wrap">{review.strategicInsight}</p>
              </section>

              {/* Adjustment for Next Week */}
              <section>
                <h3 className="font-semibold text-lg mb-2">Adjustment for Next Week</h3>
                <p className="whitespace-pre-wrap">{review.adjustmentForNextWeek}</p>
              </section>

              {/* Notes */}
              {review.notes && (
                <section>
                  <h3 className="font-semibold text-lg mb-2">Notes</h3>
                  <p className="whitespace-pre-wrap">{review.notes}</p>
                </section>
              )}

              {/* Duration */}
              {review.duration && (
                <section className="text-sm text-muted-foreground">
                  Completed in {review.duration} minutes
                </section>
              )}
            </article>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {prevDate ? (
                <Button asChild variant="outline" data-testid="prev-review">
                  <Link href={`/weekly/${prevDate}`}>Previous</Link>
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
                  <Link href={`/weekly/${nextDate}`}>Next</Link>
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
