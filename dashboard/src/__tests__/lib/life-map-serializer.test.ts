/**
 * AC2: Life Map Serializer Tests
 *
 * Tests for serializing LifeMap data back to markdown format.
 * The serializer must:
 * - Generate correct markdown table format
 * - Preserve domain order
 * - Handle special characters in assessments
 * - Support table-only updates (preserve surrounding content)
 */

import type { LifeMap } from '@/lib/types';

describe('AC2: Life Map Serializer', () => {
  // Sample LifeMap data for testing
  const sampleLifeMap: LifeMap = {
    domains: {
      career: { score: 8, assessment: 'Strong momentum, good team' },
      relationships: { score: 6, assessment: 'Needs more quality time' },
      health: { score: 5, assessment: 'Acceptable but neglected' },
      meaning: { score: 7, assessment: 'Growing sense of purpose' },
      finances: { score: 8, assessment: 'Stable and secure' },
      fun: { score: 4, assessment: 'Neglected, needs attention' },
    },
  };

  // Original file content with table embedded
  const originalFileContent = `# Life Map

*Adapted from Alex Lieberman's Life Map framework*

Life isn't just work. Most CEOs know this intellectually but live as if work is the only domain that matters.

---

## The Six Domains

1. **Career** - Work, business, professional growth
2. **Relationships** - Partner, family, friendships, community
3. **Health** - Physical, mental, energy, longevity
4. **Meaning** - Purpose, spirituality, contribution, legacy
5. **Finances** - Money, security, freedom, wealth
6. **Fun** - Play, hobbies, adventure, enjoyment

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

### 1. Career

More content here...
`;

  describe('serializeLifeMap', () => {
    it('should generate correct markdown table format', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const result = serializeLifeMap(sampleLifeMap);

      // Should contain table header
      expect(result).toContain('| Domain | Score (1-10) | Brief Assessment |');
      expect(result).toContain('|--------|--------------|------------------|');

      // Should contain all domain rows
      expect(result).toContain('| Career | 8 | Strong momentum, good team |');
      expect(result).toContain('| Relationships | 6 | Needs more quality time |');
      expect(result).toContain('| Health | 5 | Acceptable but neglected |');
      expect(result).toContain('| Meaning | 7 | Growing sense of purpose |');
      expect(result).toContain('| Finances | 8 | Stable and secure |');
      expect(result).toContain('| Fun | 4 | Neglected, needs attention |');
    });

    it('should preserve domain order (career, relationships, health, meaning, finances, fun)', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const result = serializeLifeMap(sampleLifeMap);
      const lines = result.split('\n');

      // Find the domain rows (skip header and separator)
      const domainLines = lines.filter(
        (line) =>
          line.startsWith('|') &&
          !line.includes('Domain') &&
          !line.includes('---')
      );

      expect(domainLines.length).toBe(6);
      expect(domainLines[0]).toContain('Career');
      expect(domainLines[1]).toContain('Relationships');
      expect(domainLines[2]).toContain('Health');
      expect(domainLines[3]).toContain('Meaning');
      expect(domainLines[4]).toContain('Finances');
      expect(domainLines[5]).toContain('Fun');
    });

    it('should handle special characters in assessments', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const lifeMapWithSpecialChars: LifeMap = {
        domains: {
          career: { score: 8, assessment: 'Good & growing fast' },
          relationships: { score: 6, assessment: "Partner's birthday coming up" },
          health: { score: 5, assessment: 'Need to exercise more (seriously!)' },
          meaning: { score: 7, assessment: 'Purpose: help others' },
          finances: { score: 8, assessment: '$100k saved, target: $500k' },
          fun: { score: 4, assessment: 'Travel planned - Europe 2026' },
        },
      };

      const result = serializeLifeMap(lifeMapWithSpecialChars);

      expect(result).toContain('Good & growing fast');
      expect(result).toContain("Partner's birthday coming up");
      expect(result).toContain('Need to exercise more (seriously!)');
      expect(result).toContain('Purpose: help others');
      expect(result).toContain('$100k saved, target: $500k');
      expect(result).toContain('Travel planned - Europe 2026');
    });

    it('should handle empty assessment text', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const lifeMapWithEmptyAssessments: LifeMap = {
        domains: {
          career: { score: 8, assessment: '' },
          relationships: { score: 6, assessment: '' },
          health: { score: 5, assessment: '' },
          meaning: { score: 7, assessment: '' },
          finances: { score: 8, assessment: '' },
          fun: { score: 4, assessment: '' },
        },
      };

      const result = serializeLifeMap(lifeMapWithEmptyAssessments);

      // Should still have valid table rows with empty assessment cells
      expect(result).toContain('| Career | 8 |');
      expect(result).toContain('| Relationships | 6 |');
      expect(result).toContain('| Health | 5 |');
    });

    it('should handle undefined assessment text (treat as empty)', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const lifeMapWithUndefinedAssessments: LifeMap = {
        domains: {
          career: { score: 8 },
          relationships: { score: 6 },
          health: { score: 5 },
          meaning: { score: 7 },
          finances: { score: 8 },
          fun: { score: 4 },
        },
      };

      const result = serializeLifeMap(lifeMapWithUndefinedAssessments);

      // Should not crash and should generate valid table
      expect(result).toContain('| Career | 8 |');
      expect(result).toContain('| Fun | 4 |');
    });

    it('should handle score of 10 correctly', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const lifeMapWithMaxScores: LifeMap = {
        domains: {
          career: { score: 10, assessment: 'Perfect' },
          relationships: { score: 10, assessment: 'Amazing' },
          health: { score: 10, assessment: 'Peak' },
          meaning: { score: 10, assessment: 'Fulfilled' },
          finances: { score: 10, assessment: 'Wealthy' },
          fun: { score: 10, assessment: 'Joyful' },
        },
      };

      const result = serializeLifeMap(lifeMapWithMaxScores);

      expect(result).toContain('| Career | 10 | Perfect |');
      expect(result).toContain('| Fun | 10 | Joyful |');
    });

    it('should handle score of 1 correctly', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const lifeMapWithMinScores: LifeMap = {
        domains: {
          career: { score: 1, assessment: 'Crisis' },
          relationships: { score: 1, assessment: 'Isolated' },
          health: { score: 1, assessment: 'Ill' },
          meaning: { score: 1, assessment: 'Lost' },
          finances: { score: 1, assessment: 'Broke' },
          fun: { score: 1, assessment: 'Depressed' },
        },
      };

      const result = serializeLifeMap(lifeMapWithMinScores);

      expect(result).toContain('| Career | 1 | Crisis |');
      expect(result).toContain('| Fun | 1 | Depressed |');
    });
  });

  describe('updateLifeMapFile', () => {
    it('should preserve all non-table content when updating', async () => {
      const { updateLifeMapFile } = await import('@/lib/parsers/life-map');

      const updatedLifeMap: LifeMap = {
        domains: {
          career: { score: 9, assessment: 'Even better now' },
          relationships: { score: 7, assessment: 'Improved' },
          health: { score: 6, assessment: 'Working on it' },
          meaning: { score: 8, assessment: 'Deeper understanding' },
          finances: { score: 9, assessment: 'Growing' },
          fun: { score: 5, assessment: 'Making time' },
        },
      };

      const result = updateLifeMapFile(originalFileContent, updatedLifeMap);

      // Should preserve header content
      expect(result).toContain('# Life Map');
      expect(result).toContain("*Adapted from Alex Lieberman's Life Map framework*");
      expect(result).toContain("Life isn't just work.");

      // Should preserve The Six Domains section
      expect(result).toContain('## The Six Domains');
      expect(result).toContain('1. **Career** - Work, business, professional growth');

      // Should preserve footer content
      expect(result).toContain('**Total Score:** ___ / 60');
      expect(result).toContain('## Domain Deep Dives');
      expect(result).toContain('### 1. Career');

      // Should have updated table values
      expect(result).toContain('| Career | 9 | Even better now |');
      expect(result).toContain('| Fun | 5 | Making time |');
    });

    it('should only update the table rows, not add new content', async () => {
      const { updateLifeMapFile } = await import('@/lib/parsers/life-map');

      const result = updateLifeMapFile(originalFileContent, sampleLifeMap);

      // Count table rows - should still be exactly 6 data rows
      const tableRows = result
        .split('\n')
        .filter(
          (line) =>
            line.startsWith('|') &&
            !line.includes('Domain') &&
            !line.includes('---')
        );

      expect(tableRows.length).toBe(6);
    });

    it('should handle file content with different whitespace', async () => {
      const { updateLifeMapFile } = await import('@/lib/parsers/life-map');

      const contentWithExtraWhitespace = `# Life Map


## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | 5 |  |
| Relationships | 5 |  |
| Health | 5 |  |
| Meaning | 5 |  |
| Finances | 5 |  |
| Fun | 5 |  |


**Footer**
`;

      const result = updateLifeMapFile(contentWithExtraWhitespace, sampleLifeMap);

      expect(result).toContain('| Career | 8 | Strong momentum, good team |');
      expect(result).toContain('**Footer**');
    });
  });

  describe('Round-trip: parse -> serialize/update -> parse', () => {
    it('should produce same data after serialization and parsing', async () => {
      const { parseLifeMap, updateLifeMapFile } = await import(
        '@/lib/parsers/life-map'
      );

      const originalData: LifeMap = {
        domains: {
          career: { score: 8, assessment: 'Launched new product' },
          relationships: { score: 7, assessment: 'Better communication' },
          health: { score: 6, assessment: 'Started running' },
          meaning: { score: 8, assessment: 'Found my purpose' },
          finances: { score: 9, assessment: 'Investments paying off' },
          fun: { score: 5, assessment: 'Planning vacation' },
        },
      };

      // Update file with new data
      const updatedContent = updateLifeMapFile(originalFileContent, originalData);

      // Parse the updated content
      const parsed = parseLifeMap(updatedContent);

      // Compare all domain values
      expect(parsed.domains.career.score).toBe(originalData.domains.career.score);
      expect(parsed.domains.career.assessment).toBe(
        originalData.domains.career.assessment
      );

      expect(parsed.domains.relationships.score).toBe(
        originalData.domains.relationships.score
      );
      expect(parsed.domains.relationships.assessment).toBe(
        originalData.domains.relationships.assessment
      );

      expect(parsed.domains.health.score).toBe(originalData.domains.health.score);
      expect(parsed.domains.health.assessment).toBe(
        originalData.domains.health.assessment
      );

      expect(parsed.domains.meaning.score).toBe(originalData.domains.meaning.score);
      expect(parsed.domains.meaning.assessment).toBe(
        originalData.domains.meaning.assessment
      );

      expect(parsed.domains.finances.score).toBe(
        originalData.domains.finances.score
      );
      expect(parsed.domains.finances.assessment).toBe(
        originalData.domains.finances.assessment
      );

      expect(parsed.domains.fun.score).toBe(originalData.domains.fun.score);
      expect(parsed.domains.fun.assessment).toBe(originalData.domains.fun.assessment);
    });

    it('should handle minimal data round-trip', async () => {
      const { parseLifeMap, updateLifeMapFile } = await import(
        '@/lib/parsers/life-map'
      );

      const minimalData: LifeMap = {
        domains: {
          career: { score: 5, assessment: '' },
          relationships: { score: 5, assessment: '' },
          health: { score: 5, assessment: '' },
          meaning: { score: 5, assessment: '' },
          finances: { score: 5, assessment: '' },
          fun: { score: 5, assessment: '' },
        },
      };

      const updatedContent = updateLifeMapFile(originalFileContent, minimalData);
      const parsed = parseLifeMap(updatedContent);

      expect(parsed.domains.career.score).toBe(5);
      expect(parsed.domains.fun.score).toBe(5);
    });

    it('should preserve special characters through round-trip', async () => {
      const { parseLifeMap, updateLifeMapFile } = await import(
        '@/lib/parsers/life-map'
      );

      const dataWithSpecialChars: LifeMap = {
        domains: {
          career: { score: 8, assessment: 'Growth & profit up 50%' },
          relationships: { score: 7, assessment: "Partner's support crucial" },
          health: { score: 6, assessment: 'Gym 3x/week (target: 5x)' },
          meaning: { score: 8, assessment: 'Legacy: help 1000 founders' },
          finances: { score: 9, assessment: 'Net worth > $1M' },
          fun: { score: 5, assessment: 'Hobbies: golf, reading, travel' },
        },
      };

      const updatedContent = updateLifeMapFile(originalFileContent, dataWithSpecialChars);
      const parsed = parseLifeMap(updatedContent);

      expect(parsed.domains.career.assessment).toBe('Growth & profit up 50%');
      expect(parsed.domains.relationships.assessment).toBe(
        "Partner's support crucial"
      );
      expect(parsed.domains.health.assessment).toBe('Gym 3x/week (target: 5x)');
      expect(parsed.domains.meaning.assessment).toBe('Legacy: help 1000 founders');
      expect(parsed.domains.finances.assessment).toBe('Net worth > $1M');
      expect(parsed.domains.fun.assessment).toBe('Hobbies: golf, reading, travel');
    });
  });

  describe('Edge Cases', () => {
    it('should handle assessments with pipe characters (escaped)', async () => {
      const { serializeLifeMap, parseLifeMap, updateLifeMapFile } = await import(
        '@/lib/parsers/life-map'
      );

      const dataWithPipes: LifeMap = {
        domains: {
          career: { score: 8, assessment: 'Option A or B' },
          relationships: { score: 6, assessment: 'Either way works' },
          health: { score: 5, assessment: 'Morning or evening' },
          meaning: { score: 7, assessment: 'Big or small impact' },
          finances: { score: 8, assessment: 'Save or invest' },
          fun: { score: 4, assessment: 'Indoor or outdoor' },
        },
      };

      // Serialize and ensure it doesn't break table structure
      const updatedContent = updateLifeMapFile(originalFileContent, dataWithPipes);

      // Should be parseable
      const parsed = parseLifeMap(updatedContent);
      expect(parsed.domains.career.score).toBe(8);
    });

    it('should handle very long assessments', async () => {
      const { updateLifeMapFile, parseLifeMap } = await import(
        '@/lib/parsers/life-map'
      );

      const longAssessment =
        'This is a very long assessment that contains many words and describes the current state of this domain in great detail with multiple considerations and future plans included';

      const dataWithLongAssessments: LifeMap = {
        domains: {
          career: { score: 8, assessment: longAssessment },
          relationships: { score: 6, assessment: 'Short' },
          health: { score: 5, assessment: 'Short' },
          meaning: { score: 7, assessment: 'Short' },
          finances: { score: 8, assessment: 'Short' },
          fun: { score: 4, assessment: 'Short' },
        },
      };

      const updatedContent = updateLifeMapFile(
        originalFileContent,
        dataWithLongAssessments
      );
      const parsed = parseLifeMap(updatedContent);

      expect(parsed.domains.career.assessment).toBe(longAssessment);
    });

    it('should handle score of 0 (unrated)', async () => {
      const { serializeLifeMap } = await import('@/lib/parsers/life-map');

      const dataWithZeroScores: LifeMap = {
        domains: {
          career: { score: 0, assessment: 'Not rated' },
          relationships: { score: 0, assessment: '' },
          health: { score: 0, assessment: '' },
          meaning: { score: 0, assessment: '' },
          finances: { score: 0, assessment: '' },
          fun: { score: 0, assessment: '' },
        },
      };

      const result = serializeLifeMap(dataWithZeroScores);

      expect(result).toContain('| Career | 0 | Not rated |');
    });

    it('should handle file with missing table (create new table)', async () => {
      const { updateLifeMapFile } = await import('@/lib/parsers/life-map');

      const contentWithoutTable = `# Life Map

*No table yet*

## Just some text
`;

      const result = updateLifeMapFile(contentWithoutTable, sampleLifeMap);

      // Should insert a table
      expect(result).toContain('| Domain | Score (1-10) | Brief Assessment |');
      expect(result).toContain('| Career | 8 | Strong momentum, good team |');
    });
  });
});
