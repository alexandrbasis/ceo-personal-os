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
 * @throws Not implemented - stub for TDD
 */
export function aggregateDomainScores(_reviews: ReviewWithDomains[]): DomainScores {
  throw new Error('Not implemented: aggregateDomainScores');
}

/**
 * Derive domain scores from energy level (health domain primarily)
 * @throws Not implemented - stub for TDD
 */
export function deriveDomainsFromEnergy(_reviews: ReviewWithDomains[]): DomainScores {
  throw new Error('Not implemented: deriveDomainsFromEnergy');
}

/**
 * Combine aggregated domain scores with energy-derived values
 * Aggregated values take priority, derived values fill gaps
 * @throws Not implemented - stub for TDD
 */
export function combineAggregatedWithDerived(
  _aggregated: DomainScores,
  _derived: DomainScores
): DomainScores {
  throw new Error('Not implemented: combineAggregatedWithDerived');
}

/**
 * Check if chart data is empty (all scores are 0 or null/undefined)
 * @throws Not implemented - stub for TDD
 */
export function isDataEmpty(_data: ChartDataItem[]): boolean {
  throw new Error('Not implemented: isDataEmpty');
}

/**
 * Determine if empty state should be shown
 * Returns true only when no reviews exist at all
 * @throws Not implemented - stub for TDD
 */
export function shouldShowEmptyState(_data: ChartDataItem[], _hasReviews: boolean): boolean {
  throw new Error('Not implemented: shouldShowEmptyState');
}

/**
 * Extract energy level data for trend chart
 * @throws Not implemented - stub for TDD
 */
export function getEnergyTrendData(_reviews: ReviewWithDomains[]): EnergyTrendItem[] {
  throw new Error('Not implemented: getEnergyTrendData');
}

/**
 * Convert domain scores object to chart-compatible array format
 * @throws Not implemented - stub for TDD
 */
export function convertToChartData(_scores: DomainScores): ChartDataItem[] {
  throw new Error('Not implemented: convertToChartData');
}
