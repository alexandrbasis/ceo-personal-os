/**
 * Life Map Markdown Parser
 *
 * Parses the life_map.md format into a LifeMap object.
 * Table format:
 * | Domain | Score (1-10) | Brief Assessment |
 * |--------|--------------|------------------|
 * | Career | 8 | Strong momentum, good team |
 * ...
 */

import type { LifeMap } from '@/lib/types';

/**
 * The six domains in the Life Map framework
 */
const DOMAIN_KEYS = [
  'career',
  'relationships',
  'health',
  'meaning',
  'finances',
  'fun',
] as const;

type DomainKey = (typeof DOMAIN_KEYS)[number];

/**
 * Create a default LifeMap with all domains set to 0
 */
function createDefaultLifeMap(): LifeMap {
  return {
    domains: {
      career: { score: 0, assessment: '' },
      relationships: { score: 0, assessment: '' },
      health: { score: 0, assessment: '' },
      meaning: { score: 0, assessment: '' },
      finances: { score: 0, assessment: '' },
      fun: { score: 0, assessment: '' },
    },
  };
}

/**
 * Parse a score value from a table cell
 * Returns 0 for empty, non-numeric, or invalid values
 * Truncates decimals to integers
 */
function parseScore(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) {
    return 0;
  }

  // Truncate to integer
  return Math.trunc(parsed);
}

/**
 * Parse the life_map.md content into a LifeMap object
 */
export function parseLifeMap(content: string): LifeMap {
  const lifeMap = createDefaultLifeMap();

  // Find the assessment table
  // Look for lines that start with | and contain domain names
  const lines = content.split('\n');

  for (const line of lines) {
    // Skip non-table lines
    if (!line.startsWith('|')) {
      continue;
    }

    // Skip header and separator lines
    if (line.includes('Domain') || line.includes('Score') || /^\|[-|]+\|$/.test(line.trim())) {
      continue;
    }

    // Parse table row: | Domain | Score | Assessment |
    // Split by | and keep empty cells to preserve position
    const cells = line.split('|').map((cell) => cell.trim());

    // cells[0] is empty (before first |), cells[1] is domain, cells[2] is score, cells[3] is assessment
    if (cells.length < 2 || !cells[1]) {
      continue;
    }

    const domainName = cells[1].toLowerCase() as DomainKey;

    // Check if this is a valid domain
    if (!DOMAIN_KEYS.includes(domainName)) {
      continue;
    }

    const score = cells.length > 2 ? parseScore(cells[2]) : 0;
    const assessment = cells.length > 3 ? cells[3].trim() : '';

    lifeMap.domains[domainName] = {
      score,
      assessment,
    };
  }

  return lifeMap;
}

/**
 * Convert a LifeMap to chart-compatible data format
 * Returns an array of { domain: string, score: number } objects
 */
export function getLifeMapChartData(
  lifeMap: LifeMap
): { domain: string; score: number }[] {
  // Capitalize first letter for display
  const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

  return DOMAIN_KEYS.map((key) => ({
    domain: capitalize(key),
    score: lifeMap.domains[key].score,
  }));
}
