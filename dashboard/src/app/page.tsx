'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { LifeMapChart, type LifeMapChartData, type EnergyTrendDataItem } from '@/components/LifeMapChart';
import { QuickActions } from '@/components/QuickActions';
import { ReviewsList } from '@/components/ReviewsList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { isDataEmpty } from '@/lib/utils/life-map-aggregation';
import type { ReviewListItem } from '@/lib/types';

interface LifeMapResponse {
  chartData?: LifeMapChartData[];
  error?: string;
}

interface ReviewsResponse {
  reviews: ReviewListItem[];
  error?: string;
}

/**
 * Dashboard Page - Main landing page
 * Displays Life Map radar chart, Quick Actions, and Recent Reviews
 */
export default function DashboardPage() {
  const [chartData, setChartData] = useState<LifeMapChartData[]>([]);
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch life map and reviews in parallel
        const [lifeMapRes, reviewsRes] = await Promise.all([
          fetch('/api/life-map'),
          fetch('/api/reviews/daily'),
        ]);

        // Process life map data
        if (lifeMapRes.ok) {
          const lifeMapData: LifeMapResponse = await lifeMapRes.json();
          if (lifeMapData.chartData) {
            setChartData(lifeMapData.chartData);
          }
        } else {
          // Use default empty data if life map not found
          setChartData([
            { domain: 'Career', score: 0 },
            { domain: 'Relationships', score: 0 },
            { domain: 'Health', score: 0 },
            { domain: 'Meaning', score: 0 },
            { domain: 'Finances', score: 0 },
            { domain: 'Fun', score: 0 },
          ]);
        }

        // Process reviews data
        if (reviewsRes.ok) {
          const reviewsData: ReviewsResponse = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get the last review date for status indicator
  const lastReviewDate = reviews.length > 0 ? reviews[0].date : null;

  // Compute energy trend data from reviews for fallback visualization
  const energyTrendData: EnergyTrendDataItem[] = useMemo(() => {
    return reviews
      .filter(r => r.energyLevel > 0)
      .map(r => ({ date: r.date, energy: r.energyLevel }))
      .reverse(); // Oldest first for trend line
  }, [reviews]);

  // Determine if we should show fallback visualization
  const hasReviews = reviews.length > 0;
  const showEnergyTrendFallback = hasReviews && isDataEmpty(chartData) && energyTrendData.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="text-red-500">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Life Map Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Life Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="life-map-chart">
                <LifeMapChart
                  data={chartData}
                  height={350}
                  hasReviews={hasReviews}
                  showEnergyTrendFallback={showEnergyTrendFallback}
                  energyTrendData={energyTrendData}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="quick-actions" role="region" aria-label="Quick Actions">
                <QuickActions lastReviewDate={lastReviewDate} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Reviews</span>
              <Link
                href="/reviews"
                className="text-sm font-normal text-primary hover:underline"
              >
                View All Reviews
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="reviews-list" role="region" aria-label="Recent Reviews">
              <ReviewsList reviews={reviews} limit={5} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
