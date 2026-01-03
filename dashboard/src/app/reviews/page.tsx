'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FolderArchive } from 'lucide-react';
import { ReviewsList } from '@/components/ReviewsList';
import { ReviewsFilter, type ReviewFilterType } from '@/components/ReviewsFilter';
import { SortToggle, type SortDirection } from '@/components/SortToggle';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnyReviewListItem } from '@/lib/types';

/**
 * Inner component that uses useSearchParams
 * Wrapped in Suspense to avoid SSR hydration issues
 */
function AllReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState<AnyReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read initial filter and sort from URL params
  const typeParam = searchParams.get('type');
  const sortParam = searchParams.get('sort');

  const initialFilter: ReviewFilterType =
    typeParam === 'daily' || typeParam === 'weekly' ? typeParam : 'all';
  const initialSort: SortDirection = sortParam === 'asc' ? 'asc' : 'desc';

  // Use local state for filter/sort to enable immediate updates
  const [currentFilter, setCurrentFilter] = useState<ReviewFilterType>(initialFilter);
  const [currentSort, setCurrentSort] = useState<SortDirection>(initialSort);

  // Sync with URL params when they change (e.g., back button navigation)
  useEffect(() => {
    const urlType = searchParams.get('type');
    const urlSort = searchParams.get('sort');

    const newFilter: ReviewFilterType =
      urlType === 'daily' || urlType === 'weekly' ? urlType : 'all';
    const newSort: SortDirection = urlSort === 'asc' ? 'asc' : 'desc';

    setCurrentFilter(newFilter);
    setCurrentSort(newSort);
  }, [searchParams]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API URL with query params
      const params = new URLSearchParams();
      if (currentFilter !== 'all') {
        params.set('type', currentFilter);
      }
      if (currentSort !== 'desc') {
        params.set('sort', currentSort);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/reviews?${queryString}` : '/api/reviews';

      const response = await fetch(url);

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
  }, [currentFilter, currentSort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleFilterChange = (filter: ReviewFilterType) => {
    // Update local state immediately (triggers refetch)
    setCurrentFilter(filter);

    // Update URL for bookmarkability
    const params = new URLSearchParams(searchParams.toString());

    if (filter === 'all') {
      params.delete('type');
    } else {
      params.set('type', filter);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/reviews?${queryString}` : '/reviews';
    router.push(newUrl);
  };

  const handleSortChange = (sort: SortDirection) => {
    // Update local state immediately (triggers refetch)
    setCurrentSort(sort);

    // Update URL for bookmarkability
    const params = new URLSearchParams(searchParams.toString());

    if (sort === 'desc') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/reviews?${queryString}` : '/reviews';
    router.push(newUrl);
  };

  // Get display title and CTA based on filter
  const getEmptyStateContent = () => {
    if (currentFilter === 'weekly') {
      return {
        title: 'No weekly reviews',
        message: 'Weekly reviews help you identify what truly moves the needle. Start building strategic clarity.',
        ctaText: 'Create Weekly Review',
        ctaHref: '/weekly',
      };
    }
    if (currentFilter === 'daily') {
      return {
        title: 'No daily reviews',
        message: 'Daily reviews take just 2-3 minutes and help you reflect on what matters.',
        ctaText: 'Create Daily Review',
        ctaHref: '/daily',
      };
    }
    return {
      title: 'Your Review Archive',
      message: 'This is where all your daily and weekly reflections will be stored. Start your first review to begin building your personal insight library.',
      ctaText: 'Start First Review',
      ctaHref: '/daily',
    };
  };

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
          {/* Filter and Sort Controls visible during loading for URL state */}
          <div className="flex items-center justify-between mb-6">
            <ReviewsFilter
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
              updateUrl={true}
              readFromUrl={true}
            />
            <SortToggle
              currentSort={currentSort}
              onSortChange={handleSortChange}
              updateUrl={true}
              readFromUrl={true}
            />
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

  const emptyContent = getEmptyStateContent();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">All Reviews</h1>
          <div className="flex gap-2">
            {reviews.length > 0 && (
              <Button asChild>
                <Link href="/daily">New Review</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <ReviewsFilter
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
            updateUrl={true}
            readFromUrl={true}
          />
          <SortToggle
            currentSort={currentSort}
            onSortChange={handleSortChange}
            updateUrl={true}
            readFromUrl={true}
          />
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={FolderArchive}
                title={emptyContent.title}
                message={emptyContent.message}
                ctaText={emptyContent.ctaText}
                ctaHref={emptyContent.ctaHref}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="reviews-list">
                {/* Show all reviews with type badges */}
                <ReviewsList
                  reviews={reviews}
                  limit={999}
                  type="all"
                  showTypeBadge={true}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

/**
 * All Reviews Page
 * Displays combined list of all daily + weekly reviews with filtering and sorting
 */
export default function AllReviewsPage() {
  return (
    <Suspense fallback={
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
    }>
      <AllReviewsContent />
    </Suspense>
  );
}
