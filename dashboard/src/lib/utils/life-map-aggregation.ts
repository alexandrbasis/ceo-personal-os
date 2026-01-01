/**
 * Life Map Aggregation Utilities (Stub)
 *
 * This module is a placeholder for TDD. All functions throw "Not implemented"
 * to ensure tests fail for the right reason (missing implementation, not missing module).
 *
 * Implementation will calculate domain scores from daily review data.
 */

export interface DomainRatings {
  career?: number;
  relationships?: number;
  health?: number;
  meaning?: number;
  finances?: number;
  fun?: number;
}

export interface ReviewWithDomains {
  date: string;
  energyLevel?: number;
  domainRatings?: DomainRatings;
}

export interface DomainScores {
  career: number;
  relationships: number;
  health: number;
  meaning: number;
  finances: number;
  fun: number;
}

export interface ChartDataItem {
  domain: string;
  score: number | null | undefined;
}

export interface EnergyTrendItem {
  date: string;
  energy: number;
}

/**
 * Calculate average domain scores from multiple daily reviews
 */
export function aggregateDomainScores(reviews: ReviewWithDomains[]): DomainScores {
  const domains: (keyof DomainRatings)[] = [
    'career',
    'relationships',
    'health',
    'meaning',
    'finances',
    'fun',
  ];

  const result: DomainScores = {
    career: 0,
    relationships: 0,
    health: 0,
    meaning: 0,
    finances: 0,
    fun: 0,
  };

  for (const domain of domains) {
    const values: number[] = [];

    for (const review of reviews) {
      const rating = review.domainRatings?.[domain];
      if (rating != null) {
        values.push(rating);
      }
    }

    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      result[domain] = Math.round(sum / values.length);
    }
  }

  return result;
}

/**
 * Derive domain scores from energy level (health domain primarily)
 */
export function deriveDomainsFromEnergy(reviews: ReviewWithDomains[]): DomainScores {
  const result: DomainScores = {
    career: 0,
    relationships: 0,
    health: 0,
    meaning: 0,
    finances: 0,
    fun: 0,
  };

  const energyValues: number[] = [];

  for (const review of reviews) {
    if (review.energyLevel != null) {
      energyValues.push(review.energyLevel);
    }
  }

  if (energyValues.length > 0) {
    const sum = energyValues.reduce((acc, val) => acc + val, 0);
    result.health = Math.round(sum / energyValues.length);
  }

  return result;
}

/**
 * Combine aggregated domain scores with energy-derived values
 * Aggregated values take priority, derived values fill gaps
 */
export function combineAggregatedWithDerived(
  aggregated: DomainScores,
  derived: DomainScores
): DomainScores {
  const domains: (keyof DomainScores)[] = [
    'career',
    'relationships',
    'health',
    'meaning',
    'finances',
    'fun',
  ];

  const result: DomainScores = {
    career: 0,
    relationships: 0,
    health: 0,
    meaning: 0,
    finances: 0,
    fun: 0,
  };

  for (const domain of domains) {
    result[domain] = aggregated[domain] !== 0 ? aggregated[domain] : derived[domain];
  }

  return result;
}

/**
 * Check if chart data is empty (all scores are 0 or null/undefined)
 */
export function isDataEmpty(data: ChartDataItem[]): boolean {
  if (data.length === 0) {
    return true;
  }

  return data.every((item) => item.score == null || item.score === 0);
}

/**
 * Determine if empty state should be shown
 * Returns true only when no reviews exist at all
 */
export function shouldShowEmptyState(data: ChartDataItem[], hasReviews: boolean): boolean {
  // If data has non-zero values, never show empty state
  if (!isDataEmpty(data)) {
    return false;
  }

  // Show empty state only when no reviews exist
  return !hasReviews;
}

/**
 * Extract energy level data for trend chart
 */
export function getEnergyTrendData(reviews: ReviewWithDomains[]): EnergyTrendItem[] {
  return reviews
    .filter((review) => review.energyLevel != null)
    .map((review) => ({
      date: review.date,
      energy: review.energyLevel as number,
    }));
}

/**
 * Convert domain scores object to chart-compatible array format
 */
export function convertToChartData(scores: DomainScores): ChartDataItem[] {
  const domainNames: { key: keyof DomainScores; label: string }[] = [
    { key: 'career', label: 'Career' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'health', label: 'Health' },
    { key: 'meaning', label: 'Meaning' },
    { key: 'finances', label: 'Finances' },
    { key: 'fun', label: 'Fun' },
  ];

  return domainNames.map(({ key, label }) => ({
    domain: label,
    score: scores[key],
  }));
}
