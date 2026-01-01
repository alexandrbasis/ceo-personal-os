/**
 * Critical Bug Fix Tests - AC1: Life Map Aggregation Logic
 *
 * Tests for the domain score aggregation from daily reviews
 * Implements Option B: 6 domain ratings in daily review form
 */

describe('AC1: Life Map Domain Aggregation', () => {
  describe('aggregateDomainScores', () => {
    it('should calculate average scores from multiple daily reviews', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          domainRatings: {
            career: 8,
            relationships: 6,
            health: 7,
            meaning: 5,
            finances: 9,
            fun: 4,
          },
        },
        {
          date: '2025-12-31',
          domainRatings: {
            career: 6,
            relationships: 8,
            health: 5,
            meaning: 7,
            finances: 7,
            fun: 6,
          },
        },
      ];

      const result = aggregateDomainScores(reviews);

      expect(result.career).toBe(7); // (8+6)/2
      expect(result.relationships).toBe(7); // (6+8)/2
      expect(result.health).toBe(6); // (7+5)/2
      expect(result.meaning).toBe(6); // (5+7)/2
      expect(result.finances).toBe(8); // (9+7)/2
      expect(result.fun).toBe(5); // (4+6)/2
    });

    it('should handle reviews with partial domain data', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          domainRatings: {
            career: 8,
            health: 7,
            // Other domains not rated
          },
        },
        {
          date: '2025-12-31',
          domainRatings: {
            career: 6,
            relationships: 5,
            // Other domains not rated
          },
        },
      ];

      const result = aggregateDomainScores(reviews);

      expect(result.career).toBe(7); // (8+6)/2
      expect(result.health).toBe(7); // Only one data point
      expect(result.relationships).toBe(5); // Only one data point
      expect(result.meaning).toBe(0); // No data
      expect(result.finances).toBe(0); // No data
      expect(result.fun).toBe(0); // No data
    });

    it('should return zeros when no domain ratings exist', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          energyLevel: 7,
          // No domainRatings
        },
        {
          date: '2025-12-31',
          energyLevel: 6,
          // No domainRatings
        },
      ];

      const result = aggregateDomainScores(reviews);

      expect(result.career).toBe(0);
      expect(result.relationships).toBe(0);
      expect(result.health).toBe(0);
      expect(result.meaning).toBe(0);
      expect(result.finances).toBe(0);
      expect(result.fun).toBe(0);
    });

    it('should return empty result when no reviews exist', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const result = aggregateDomainScores([]);

      expect(result.career).toBe(0);
      expect(result.relationships).toBe(0);
      expect(result.health).toBe(0);
      expect(result.meaning).toBe(0);
      expect(result.finances).toBe(0);
      expect(result.fun).toBe(0);
    });

    it('should round average scores to nearest integer', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        { date: '2026-01-01', domainRatings: { career: 7 } },
        { date: '2025-12-31', domainRatings: { career: 8 } },
        { date: '2025-12-30', domainRatings: { career: 7 } },
      ];

      const result = aggregateDomainScores(reviews);

      // (7+8+7)/3 = 7.33... should round to 7
      expect(result.career).toBe(7);
    });

    it('should ignore null or undefined domain ratings', async () => {
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          domainRatings: {
            career: 8,
            health: null as unknown as number,
            relationships: undefined as unknown as number,
          },
        },
      ];

      const result = aggregateDomainScores(reviews);

      expect(result.career).toBe(8);
      expect(result.health).toBe(0);
      expect(result.relationships).toBe(0);
    });

    it('should treat 0 as "not rated" and skip zeros in aggregation', async () => {
      // This is critical: 0 means "not rated" in the UI, so zeros should NOT
      // drag down averages. If user rates career=8 on day 1 and doesn't rate
      // it (0) on day 2, the average should be 8, not 4.
      const { aggregateDomainScores } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        {
          date: '2026-01-01',
          domainRatings: {
            career: 8,
            health: 6,
          },
        },
        {
          date: '2025-12-31',
          domainRatings: {
            career: 0, // User didn't rate career this day (0 = not rated)
            health: 8,
          },
        },
      ];

      const result = aggregateDomainScores(reviews);

      // Career should be 8 (only one real rating), not 4 (8+0)/2
      expect(result.career).toBe(8);
      // Health should be 7 (6+8)/2 - both are real ratings
      expect(result.health).toBe(7);
    });
  });

  describe('deriveDomainsFromEnergy', () => {
    it('should derive health domain from energy level', async () => {
      const { deriveDomainsFromEnergy } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        { date: '2026-01-01', energyLevel: 8 },
        { date: '2025-12-31', energyLevel: 6 },
      ];

      const result = deriveDomainsFromEnergy(reviews);

      expect(result.health).toBe(7); // Average of 8 and 6
    });

    it('should return 0 for health when no energy data exists', async () => {
      const { deriveDomainsFromEnergy } = await import('@/lib/utils/life-map-aggregation');

      const result = deriveDomainsFromEnergy([]);

      expect(result.health).toBe(0);
    });

    it('should not affect other domains (only health is derived from energy)', async () => {
      const { deriveDomainsFromEnergy } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [{ date: '2026-01-01', energyLevel: 8 }];

      const result = deriveDomainsFromEnergy(reviews);

      expect(result.health).toBe(8);
      expect(result.career).toBe(0);
      expect(result.relationships).toBe(0);
      expect(result.meaning).toBe(0);
      expect(result.finances).toBe(0);
      expect(result.fun).toBe(0);
    });
  });

  describe('combineAggregatedWithDerived', () => {
    it('should use aggregated domain scores when available', async () => {
      const { combineAggregatedWithDerived } = await import('@/lib/utils/life-map-aggregation');

      const aggregated = {
        career: 8,
        relationships: 6,
        health: 7,
        meaning: 5,
        finances: 9,
        fun: 4,
      };

      const derived = {
        career: 0,
        relationships: 0,
        health: 5, // Derived from energy
        meaning: 0,
        finances: 0,
        fun: 0,
      };

      const result = combineAggregatedWithDerived(aggregated, derived);

      // Should use aggregated health (7), not derived (5)
      expect(result.health).toBe(7);
      expect(result.career).toBe(8);
    });

    it('should fall back to derived values when aggregated is 0', async () => {
      const { combineAggregatedWithDerived } = await import('@/lib/utils/life-map-aggregation');

      const aggregated = {
        career: 0,
        relationships: 0,
        health: 0, // No explicit health rating
        meaning: 0,
        finances: 0,
        fun: 0,
      };

      const derived = {
        career: 0,
        relationships: 0,
        health: 6, // Derived from energy
        meaning: 0,
        finances: 0,
        fun: 0,
      };

      const result = combineAggregatedWithDerived(aggregated, derived);

      // Should use derived health since aggregated is 0
      expect(result.health).toBe(6);
    });
  });

  describe('isDataEmpty', () => {
    it('should return true when all scores are 0', async () => {
      const { isDataEmpty } = await import('@/lib/utils/life-map-aggregation');

      const data = [
        { domain: 'Career', score: 0 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 0 },
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      expect(isDataEmpty(data)).toBe(true);
    });

    it('should return false when at least one score is non-zero', async () => {
      const { isDataEmpty } = await import('@/lib/utils/life-map-aggregation');

      const data = [
        { domain: 'Career', score: 0 },
        { domain: 'Relationships', score: 0 },
        { domain: 'Health', score: 1 }, // Has data!
        { domain: 'Meaning', score: 0 },
        { domain: 'Finances', score: 0 },
        { domain: 'Fun', score: 0 },
      ];

      expect(isDataEmpty(data)).toBe(false);
    });

    it('should treat null/undefined as 0 (empty)', async () => {
      const { isDataEmpty } = await import('@/lib/utils/life-map-aggregation');

      const data = [
        { domain: 'Career', score: null as unknown as number },
        { domain: 'Relationships', score: undefined as unknown as number },
        { domain: 'Health', score: 0 },
      ];

      expect(isDataEmpty(data)).toBe(true);
    });

    it('should return true for empty array', async () => {
      const { isDataEmpty } = await import('@/lib/utils/life-map-aggregation');

      expect(isDataEmpty([])).toBe(true);
    });
  });

  describe('shouldShowEmptyState', () => {
    it('should return true only when no reviews exist at all', async () => {
      const { shouldShowEmptyState } = await import('@/lib/utils/life-map-aggregation');

      const emptyData = [{ domain: 'Career', score: 0 }];

      expect(shouldShowEmptyState(emptyData, false)).toBe(true); // No reviews = empty state
      expect(shouldShowEmptyState(emptyData, true)).toBe(false); // Has reviews = no empty state
    });

    it('should return false when user has reviews even if domain data is empty', async () => {
      const { shouldShowEmptyState } = await import('@/lib/utils/life-map-aggregation');

      const emptyDomainData = [
        { domain: 'Career', score: 0 },
        { domain: 'Health', score: 0 },
      ];

      // User has reviews but didn't fill domain ratings
      expect(shouldShowEmptyState(emptyDomainData, true)).toBe(false);
    });

    it('should return false when domain data has non-zero values', async () => {
      const { shouldShowEmptyState } = await import('@/lib/utils/life-map-aggregation');

      const dataWithScores = [
        { domain: 'Career', score: 8 },
        { domain: 'Health', score: 0 },
      ];

      expect(shouldShowEmptyState(dataWithScores, true)).toBe(false);
      expect(shouldShowEmptyState(dataWithScores, false)).toBe(false); // Data exists regardless of reviews flag
    });
  });

  describe('getEnergyTrendData', () => {
    it('should extract energy levels with dates for trend chart', async () => {
      const { getEnergyTrendData } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        { date: '2026-01-01', energyLevel: 8 },
        { date: '2025-12-31', energyLevel: 6 },
        { date: '2025-12-30', energyLevel: 7 },
      ];

      const result = getEnergyTrendData(reviews);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ date: '2026-01-01', energy: 8 });
      expect(result[1]).toEqual({ date: '2025-12-31', energy: 6 });
      expect(result[2]).toEqual({ date: '2025-12-30', energy: 7 });
    });

    it('should return empty array when no reviews exist', async () => {
      const { getEnergyTrendData } = await import('@/lib/utils/life-map-aggregation');

      const result = getEnergyTrendData([]);

      expect(result).toHaveLength(0);
    });

    it('should handle reviews without energy level', async () => {
      const { getEnergyTrendData } = await import('@/lib/utils/life-map-aggregation');

      const reviews = [
        { date: '2026-01-01', energyLevel: 8 },
        { date: '2025-12-31' }, // No energy level
        { date: '2025-12-30', energyLevel: 7 },
      ];

      const result = getEnergyTrendData(reviews);

      // Should include only reviews with energy levels
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2026-01-01', energy: 8 });
      expect(result[1]).toEqual({ date: '2025-12-30', energy: 7 });
    });
  });

  describe('convertToChartData', () => {
    it('should convert domain scores object to chart array format', async () => {
      const { convertToChartData } = await import('@/lib/utils/life-map-aggregation');

      const scores = {
        career: 8,
        relationships: 6,
        health: 7,
        meaning: 5,
        finances: 9,
        fun: 4,
      };

      const result = convertToChartData(scores);

      expect(result).toHaveLength(6);
      expect(result).toContainEqual({ domain: 'Career', score: 8 });
      expect(result).toContainEqual({ domain: 'Relationships', score: 6 });
      expect(result).toContainEqual({ domain: 'Health', score: 7 });
      expect(result).toContainEqual({ domain: 'Meaning', score: 5 });
      expect(result).toContainEqual({ domain: 'Finances', score: 9 });
      expect(result).toContainEqual({ domain: 'Fun', score: 4 });
    });

    it('should capitalize domain names for display', async () => {
      const { convertToChartData } = await import('@/lib/utils/life-map-aggregation');

      const scores = {
        career: 8,
        relationships: 6,
        health: 7,
        meaning: 5,
        finances: 9,
        fun: 4,
      };

      const result = convertToChartData(scores);

      result.forEach((item: { domain: string }) => {
        expect(item.domain[0]).toBe(item.domain[0].toUpperCase());
      });
    });
  });
});
