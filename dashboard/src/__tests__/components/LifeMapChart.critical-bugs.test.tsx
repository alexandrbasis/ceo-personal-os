/**
 * Critical Bug Fix Tests - AC1: Life Map Displays Data When Reviews Exist
 *
 * Tests for Option B implementation: 6 domain ratings in daily review form
 * These tests verify that:
 * - Life Map shows radar chart when daily reviews exist with domain data
 * - Energy Level is used when domain data is unavailable
 * - Empty state only shows when truly no review data exists
 */

import { render, screen } from '@testing-library/react';
import * as React from 'react';

// Mock Recharts to avoid canvas issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 400, height: 400 }}>
        {children}
      </div>
    ),
    RadarChart: ({ children, data }: { children: React.ReactNode; data: Array<{ score?: number }> }) => (
      <div data-testid="radar-chart" data-domain-count={data?.length} data-has-data={data?.some((d) => d.score && d.score > 0)}>
        {children}
      </div>
    ),
    Radar: ({ dataKey, name }: { dataKey: string; name: string }) => (
      <div data-testid="radar" data-key={dataKey} data-name={name} />
    ),
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: ({ dataKey }: { dataKey: string }) => (
      <div data-testid="polar-angle-axis" data-key={dataKey} />
    ),
    PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
    LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
      <div data-testid="line-chart" data-point-count={data?.length}>
        {children}
      </div>
    ),
    Line: ({ dataKey }: { dataKey: string }) => (
      <div data-testid="line" data-key={dataKey} />
    ),
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('AC1: Life Map Displays Data When Reviews Exist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC1.1: When user has completed daily reviews, Life Map shows radar chart', () => {
    it('should show radar chart when daily reviews have domain ratings', async () => {
      const { LifeMapChart } = await import('@/components/LifeMapChart');

      // Data from daily reviews with domain ratings (Option B)
      const dataFromReviews = [
        { domain: 'Career', score: 8 },
        { domain: 'Relationships', score: 6 },
        { domain: 'Health', score: 7 },
        { domain: 'Meaning', score: 5 },
        { domain: 'Finances', score: 8 },
        { domain: 'Fun', score: 4 },
      ];

      render(<LifeMapChart data={dataFromReviews} />);

      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      // Should show chart with data, not empty state
      expect(screen.queryByText(/no data/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/complete.*review/i)).not.toBeInTheDocument();
    });

    it('should NOT show empty state when at least one review has domain scores', async () => {
      const { LifeMapChart } = await import('@/components/LifeMapChart');

      // Partial data - only some domains rated
      const partialData = [
        { domain: 'Career', score: 7 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 5 },
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      render(<LifeMapChart data={partialData} />);

      // Should still show the chart, not empty state
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should aggregate domain scores from multiple daily reviews', async () => {
      // This tests the aggregation logic that should be in life-map API
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          domainRatings: { career: 8, health: 6, relationships: 7 },
        },
        {
          date: '2025-12-31',
          domainRatings: { career: 6, health: 8, relationships: 5 },
        },
      ];

      const aggregated = aggregateDomainScores(reviews);

      // Should average the scores
      expect(aggregated.career).toBe(7); // (8+6)/2
      expect(aggregated.health).toBe(7); // (6+8)/2
      expect(aggregated.relationships).toBe(6); // (7+5)/2
    });
  });

  describe('AC1.2: Energy Level populates at least one meaningful metric', () => {
    it('should use energy level to derive health domain score when no domain data exists', async () => {
      const { deriveDomainsFromEnergy } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        { date: '2026-01-01', energyLevel: 8 },
        { date: '2025-12-31', energyLevel: 6 },
      ];

      const derived = deriveDomainsFromEnergy(reviews);

      // Energy should map to Health domain (most logical connection)
      expect(derived.health).toBe(7); // Average of 8 and 6
    });

    it('should prioritize domain ratings over energy-derived values', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          energyLevel: 5,
          domainRatings: { health: 8 }, // Explicit rating should win
        },
      ];

      const aggregated = aggregateDomainScores(reviews);

      expect(aggregated.health).toBe(8); // Domain rating, not energy level
    });
  });

  describe('AC1.3: Alternative visualization when 6-domain data unavailable', () => {
    it('should show energy trend chart when only energy data is available', async () => {
      const { LifeMapChart } = await import('@/components/LifeMapChart');

      // All domains at 0, but we have energy data
      const emptyDomainData = [
        { domain: 'Career', score: 0 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 0 },
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      const energyTrendData = [
        { date: '2026-01-01', energy: 7 },
        { date: '2025-12-31', energy: 6 },
        { date: '2025-12-30', energy: 8 },
      ];

      render(
        <LifeMapChart
          data={emptyDomainData}
          energyTrendData={energyTrendData}
          showEnergyTrendFallback={true}
        />
      );

      // Should show energy trend chart instead of empty radar
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByText(/energy trend/i)).toBeInTheDocument();
    });

    it('should show message about adding domain ratings to unlock full life map', async () => {
      const { LifeMapChart } = await import('@/components/LifeMapChart');

      const emptyDomainData = [
        { domain: 'Career', score: 0 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 0 },
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      render(
        <LifeMapChart
          data={emptyDomainData}
          showEnergyTrendFallback={true}
          energyTrendData={[{ date: '2026-01-01', energy: 7 }]}
        />
      );

      // Should show hint about adding domain ratings
      expect(screen.getByText(/add domain ratings/i)).toBeInTheDocument();
    });
  });

  describe('AC1.4: Empty state only shows when truly no review data exists', () => {
    it('should show empty state only when no reviews exist at all', async () => {
      const { LifeMapChart } = await import('@/components/LifeMapChart');

      const emptyData = [
        { domain: 'Career', score: 0 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 0 },
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      render(
        <LifeMapChart
          data={emptyData}
          hasReviews={false}
          showEnergyTrendFallback={false}
        />
      );

      // Should show proper empty state with call to action
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/complete your first review/i)).toBeInTheDocument();
    });

    it('should NOT show empty state when user has energy data from reviews', async () => {
      const { LifeMapChart } = await import('@/components/LifeMapChart');

      const emptyDomainData = [
        { domain: 'Career', score: 0 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 0 },
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      render(
        <LifeMapChart
          data={emptyDomainData}
          hasReviews={true}
          energyTrendData={[{ date: '2026-01-01', energy: 7 }]}
        />
      );

      // Should NOT show empty state - user has data!
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
      expect(screen.queryByText(/complete your first review/i)).not.toBeInTheDocument();
    });

    it('should properly check if data is empty (all zeros)', async () => {
      const { isDataEmpty } = await import('@/lib/utils/life-map-aggregation');

      // All zeros = empty
      expect(
        isDataEmpty([
          { domain: 'Career', score: 0 },
          { domain: 'Health', score: 0 },
        ])
      ).toBe(true);

      // At least one non-zero = not empty
      expect(
        isDataEmpty([
          { domain: 'Career', score: 1 },
          { domain: 'Health', score: 0 },
        ])
      ).toBe(false);

      // Null/undefined treated as 0
      expect(
        isDataEmpty([
          { domain: 'Career', score: null },
          { domain: 'Health', score: undefined },
        ])
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with only 1 review (minimal data)', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const singleReview = [
        {
          date: '2026-01-01',
          domainRatings: { career: 8, health: 7 },
        },
      ];

      const aggregated = aggregateDomainScores(singleReview);

      expect(aggregated.career).toBe(8);
      expect(aggregated.health).toBe(7);
      expect(aggregated.relationships).toBe(0); // Not rated
    });

    it('should handle reviews with mixed domain data (some days full, some partial)', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const mixedReviews = [
        {
          date: '2026-01-01',
          domainRatings: { career: 8, health: 7, relationships: 6, meaning: 5, finances: 8, fun: 4 },
        },
        {
          date: '2025-12-31',
          domainRatings: { career: 6, health: 5 }, // Only partial
        },
        {
          date: '2025-12-30',
          // No domain ratings at all, but has energy
          energyLevel: 7,
        },
      ];

      const aggregated = aggregateDomainScores(mixedReviews);

      // Career: (8+6)/2 = 7
      expect(aggregated.career).toBe(7);
      // Health: (7+5)/2 = 6
      expect(aggregated.health).toBe(6);
      // Relationships: only 1 data point = 6
      expect(aggregated.relationships).toBe(6);
    });

    it('should handle all domain scores being 0 (form submitted but not filled)', async () => {
      const { isDataEmpty, shouldShowEmptyState } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          energyLevel: 5,
          domainRatings: { career: 0, health: 0, relationships: 0, meaning: 0, finances: 0, fun: 0 },
        },
      ];

      // Data is empty but reviews exist
      const domainData = [
        { domain: 'Career', score: 0 },
        { domain: 'Health', score: 0 },
      ];

      expect(isDataEmpty(domainData)).toBe(true);
      // But should NOT show empty state because reviews exist
      expect(shouldShowEmptyState(domainData, reviews.length > 0)).toBe(false);
    });
  });
});
