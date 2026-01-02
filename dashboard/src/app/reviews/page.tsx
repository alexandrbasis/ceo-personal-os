'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderArchive } from 'lucide-react';
import { ReviewsList } from '@/components/ReviewsList';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReviewListItem } from '@/lib/types';

/**
 * All Reviews Page
 * Displays full list of all daily reviews
 */
export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/reviews/daily');

        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }

        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Fetch reviews error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">All Reviews</h1>
            <Button asChild variant="outline">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">All Reviews</h1>
            <Button asChild variant="outline">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
          <div className="text-red-500">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">All Reviews</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/daily">New Review</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={FolderArchive}
                title="Your Review Archive"
                message="This is where all your daily reflections will be stored. Start your first review to begin building your personal insight library."
                ctaText="Start First Review"
                ctaHref="/daily"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Daily Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="reviews-list">
                {/* Show all reviews without limit */}
                <ReviewsList reviews={reviews} limit={999} />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
