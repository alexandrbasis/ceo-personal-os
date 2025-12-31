/**
 * T3: Life Map Markdown Parser Tests
 *
 * Tests for parsing life_map.md format:
 * - Table with Domain | Score (1-10) | Brief Assessment
 * - 6 domains: Career, Relationships, Health, Meaning, Finances, Fun
 */

import { LifeMap } from '@/lib/types';

describe('T3: Life Map Markdown Parser', () => {
  // Sample life_map.md content with scores
  const lifeMapWithScores = `# Life Map

*Adapted from Alex Lieberman's Life Map framework*

Life isn't just work. Most CEOs know this intellectually but live as if work is the only domain that matters.

---

## The Six Domains

Alex Lieberman's Life Map divides life into six interconnected domains:

1. **Career** — Work, business, professional growth
2. **Relationships** — Partner, family, friendships, community
3. **Health** — Physical, mental, energy, longevity
4. **Meaning** — Purpose, spirituality, contribution, legacy
5. **Finances** — Money, security, freedom, wealth
6. **Fun** — Play, hobbies, adventure, enjoyment

---

## Current State Assessment

*Rate each domain honestly. 1 = crisis, 5 = acceptable, 10 = thriving*

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | 8 | Strong momentum, good team |
| Relationships | 6 | Needs more quality time |
| Health | 5 | Acceptable but neglected |
| Meaning | 7 | Growing sense of purpose |
| Finances | 8 | Stable and secure |
| Fun | 4 | Neglected, needs attention |

**Total Score:** ___ / 60

---

## Domain Deep Dives

More content here...
`;

  // Life map with empty scores
  const lifeMapWithEmptyScores = `# Life Map

## Current State Assessment

*Rate each domain honestly. 1 = crisis, 5 = acceptable, 10 = thriving*

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | | |
| Relationships | | |
| Health | | |
| Meaning | | |
| Finances | | |
| Fun | | |

**Total Score:** ___ / 60
`;

  // Life map with partial scores
  const lifeMapWithPartialScores = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | 8 | Great progress |
| Relationships | | Need to assess |
| Health | 6 | Could be better |
| Meaning | | |
| Finances | 9 | Very good |
| Fun | | Haven't thought about it |

`;

  // Malformed life map
  const malformedLifeMap = `# Life Map

This file doesn't have the expected table format.

Just some random text.

## Current State Assessment

No table here, just text describing things.

Career is going well.
Relationships need work.
`;

  describe('parseLifeMap', () => {
    it('should parse life map with all 6 domain scores', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result).toBeDefined();
      expect(result.domains).toBeDefined();
      expect(Object.keys(result.domains)).toHaveLength(6);
    });

    it('should extract Career score from table row', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result.domains.career.score).toBe(8);
      expect(result.domains.career.assessment).toBe('Strong momentum, good team');
    });

    it('should extract Relationships score from table row', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result.domains.relationships.score).toBe(6);
      expect(result.domains.relationships.assessment).toBe('Needs more quality time');
    });

    it('should extract Health score from table row', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result.domains.health.score).toBe(5);
      expect(result.domains.health.assessment).toBe('Acceptable but neglected');
    });

    it('should extract Meaning score from table row', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result.domains.meaning.score).toBe(7);
      expect(result.domains.meaning.assessment).toBe('Growing sense of purpose');
    });

    it('should extract Finances score from table row', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result.domains.finances.score).toBe(8);
      expect(result.domains.finances.assessment).toBe('Stable and secure');
    });

    it('should extract Fun score from table row', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithScores);

      expect(result.domains.fun.score).toBe(4);
      expect(result.domains.fun.assessment).toBe('Neglected, needs attention');
    });

    it('should handle empty score cells (return 0)', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithEmptyScores);

      expect(result.domains.career.score).toBe(0);
      expect(result.domains.relationships.score).toBe(0);
      expect(result.domains.health.score).toBe(0);
      expect(result.domains.meaning.score).toBe(0);
      expect(result.domains.finances.score).toBe(0);
      expect(result.domains.fun.score).toBe(0);
    });

    it('should handle partial scores (mix of filled and empty)', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithPartialScores);

      expect(result.domains.career.score).toBe(8);
      expect(result.domains.relationships.score).toBe(0);
      expect(result.domains.health.score).toBe(6);
      expect(result.domains.meaning.score).toBe(0);
      expect(result.domains.finances.score).toBe(9);
      expect(result.domains.fun.score).toBe(0);
    });

    it('should handle partial assessments', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(lifeMapWithPartialScores);

      expect(result.domains.career.assessment).toBe('Great progress');
      expect(result.domains.relationships.assessment).toBe('Need to assess');
      expect(result.domains.fun.assessment).toBe("Haven't thought about it");
    });

    it('should handle malformed table gracefully (return defaults)', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const result = parseLifeMap(malformedLifeMap);

      // Should return structure with 0 scores, not crash
      expect(result).toBeDefined();
      expect(result.domains).toBeDefined();
      expect(result.domains.career.score).toBe(0);
    });

    it('should return all expected domains even if some are missing from file', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const incompleteTable = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | 8 | Good |
| Health | 5 | OK |

`;

      const result = parseLifeMap(incompleteTable);

      // All 6 domains should exist
      expect(result.domains.career).toBeDefined();
      expect(result.domains.relationships).toBeDefined();
      expect(result.domains.health).toBeDefined();
      expect(result.domains.meaning).toBeDefined();
      expect(result.domains.finances).toBeDefined();
      expect(result.domains.fun).toBeDefined();

      // Only Career and Health should have scores
      expect(result.domains.career.score).toBe(8);
      expect(result.domains.health.score).toBe(5);
      expect(result.domains.relationships.score).toBe(0);
    });

    it('should be case-insensitive for domain names', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const mixedCaseTable = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| CAREER | 8 | Good |
| relationships | 6 | OK |
| HeAlTh | 5 | Fine |
| Meaning | 7 | Growing |
| FINANCES | 9 | Great |
| fun | 3 | Needs work |

`;

      const result = parseLifeMap(mixedCaseTable);

      expect(result.domains.career.score).toBe(8);
      expect(result.domains.relationships.score).toBe(6);
      expect(result.domains.health.score).toBe(5);
      expect(result.domains.meaning.score).toBe(7);
      expect(result.domains.finances.score).toBe(9);
      expect(result.domains.fun.score).toBe(3);
    });

    it('should handle score values outside 1-10 range', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const outOfRangeScores = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | 15 | Over the top |
| Relationships | 0 | Zero |
| Health | -5 | Negative |
| Meaning | 7 | Normal |
| Finances | 100 | Way too high |
| Fun | 1 | Minimum |

`;

      // Parser should return the values as-is (validation is separate)
      const result = parseLifeMap(outOfRangeScores);

      expect(result.domains.career.score).toBe(15);
      expect(result.domains.relationships.score).toBe(0);
      expect(result.domains.health.score).toBe(-5);
      expect(result.domains.fun.score).toBe(1);
    });

    it('should handle non-numeric score values', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const nonNumericScores = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | eight | Good |
| Relationships | n/a | Unknown |
| Health | 5 | OK |
| Meaning | - | Not assessed |
| Finances | 8.5 | Decimal |
| Fun | | Empty |

`;

      const result = parseLifeMap(nonNumericScores);

      // Non-numeric should return 0 (or NaN handling)
      expect(result.domains.career.score).toBe(0); // "eight" is not a number
      expect(result.domains.relationships.score).toBe(0); // "n/a"
      expect(result.domains.health.score).toBe(5);
      expect(result.domains.meaning.score).toBe(0); // "-"
      // Decimal might be parsed or truncated
      expect(result.domains.finances.score).toBe(8); // or 8.5 if floating point supported
      expect(result.domains.fun.score).toBe(0); // empty
    });

    it('should trim whitespace from assessment text', async () => {
      const { parseLifeMap } = await import('@/lib/parsers/life-map');

      const whitespaceAssessments = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | 8 |   Lots of spaces   |
| Relationships | 6 | Normal |

`;

      const result = parseLifeMap(whitespaceAssessments);

      expect(result.domains.career.assessment).toBe('Lots of spaces');
    });
  });

  describe('getLifeMapChartData', () => {
    it('should convert LifeMap to chart-compatible format', async () => {
      const { parseLifeMap, getLifeMapChartData } = await import('@/lib/parsers/life-map');

      const lifeMap = parseLifeMap(lifeMapWithScores);
      const chartData = getLifeMapChartData(lifeMap);

      expect(chartData).toHaveLength(6);

      // Check structure
      expect(chartData[0]).toHaveProperty('domain');
      expect(chartData[0]).toHaveProperty('score');

      // Check all domains are present
      const domains = chartData.map((d: { domain: string }) => d.domain);
      expect(domains).toContain('Career');
      expect(domains).toContain('Relationships');
      expect(domains).toContain('Health');
      expect(domains).toContain('Meaning');
      expect(domains).toContain('Finances');
      expect(domains).toContain('Fun');
    });

    it('should return scores in correct order for radar chart', async () => {
      const { parseLifeMap, getLifeMapChartData } = await import('@/lib/parsers/life-map');

      const lifeMap = parseLifeMap(lifeMapWithScores);
      const chartData = getLifeMapChartData(lifeMap);

      // Find each domain
      const careerData = chartData.find((d: { domain: string }) => d.domain === 'Career');
      const healthData = chartData.find((d: { domain: string }) => d.domain === 'Health');
      const funData = chartData.find((d: { domain: string }) => d.domain === 'Fun');

      expect(careerData?.score).toBe(8);
      expect(healthData?.score).toBe(5);
      expect(funData?.score).toBe(4);
    });
  });
});
