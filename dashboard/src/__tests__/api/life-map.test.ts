/**
 * @jest-environment node
 */

/**
 * T4: API Route Tests - Life Map
 *
 * Tests for:
 * - GET /api/life-map - Get life map scores
 */

import { NextRequest } from 'next/server';
import { LifeMap } from '@/lib/types';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
}));

// Mock path resolution
jest.mock('@/lib/config', () => ({
  MARKDOWN_BASE_PATH: '/mock/path',
  LIFE_MAP_PATH: '/mock/path/frameworks/life_map.md',
}));

describe('T4: API Routes - Life Map', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const lifeMapMarkdown = `# Life Map

*Adapted from Alex Lieberman's Life Map framework*

---

## The Six Domains

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
`;

  describe('GET /api/life-map', () => {
    it('should return life map with all 6 domain scores', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);

      const request = new NextRequest('http://localhost:3000/api/life-map');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.domains).toBeDefined();
      expect(Object.keys(data.domains)).toHaveLength(6);
    });

    it('should return domains object with score and assessment', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);

      const request = new NextRequest('http://localhost:3000/api/life-map');
      const response = await GET(request);
      const data: LifeMap = await response.json();

      expect(data.domains.career.score).toBe(8);
      expect(data.domains.career.assessment).toBe('Strong momentum, good team');

      expect(data.domains.relationships.score).toBe(6);
      expect(data.domains.relationships.assessment).toBe('Needs more quality time');

      expect(data.domains.health.score).toBe(5);
      expect(data.domains.health.assessment).toBe('Acceptable but neglected');

      expect(data.domains.meaning.score).toBe(7);
      expect(data.domains.meaning.assessment).toBe('Growing sense of purpose');

      expect(data.domains.finances.score).toBe(8);
      expect(data.domains.finances.assessment).toBe('Stable and secure');

      expect(data.domains.fun.score).toBe(4);
      expect(data.domains.fun.assessment).toBe('Neglected, needs attention');
    });

    it('should return 500 if life_map.md not found', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const request = new NextRequest('http://localhost:3000/api/life-map');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle malformed life map gracefully', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(`# Life Map

This file doesn't have the expected format.
No table here.
`);

      const request = new NextRequest('http://localhost:3000/api/life-map');
      const response = await GET(request);
      const data: LifeMap = await response.json();

      // Should return default structure with 0 scores
      expect(response.status).toBe(200);
      expect(data.domains).toBeDefined();
      expect(data.domains.career.score).toBe(0);
      expect(data.domains.relationships.score).toBe(0);
    });

    it('should handle empty scores correctly', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/life-map/route');

      const emptyScoresMarkdown = `# Life Map

## Current State Assessment

| Domain | Score (1-10) | Brief Assessment |
|--------|--------------|------------------|
| Career | | |
| Relationships | | |
| Health | | |
| Meaning | | |
| Finances | | |
| Fun | | |
`;

      (fs.readFile as jest.Mock).mockResolvedValue(emptyScoresMarkdown);

      const request = new NextRequest('http://localhost:3000/api/life-map');
      const response = await GET(request);
      const data: LifeMap = await response.json();

      expect(response.status).toBe(200);
      expect(data.domains.career.score).toBe(0);
      expect(data.domains.fun.score).toBe(0);
    });

    it('should include chart-ready data format', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);

      const request = new NextRequest('http://localhost:3000/api/life-map');
      const response = await GET(request);
      const data = await response.json();

      // Should also return chart data format
      if (data.chartData) {
        expect(Array.isArray(data.chartData)).toBe(true);
        expect(data.chartData.length).toBe(6);
        expect(data.chartData[0]).toHaveProperty('domain');
        expect(data.chartData[0]).toHaveProperty('score');
      }
    });
  });

  /**
   * AC3: PUT /api/life-map - Update life map file
   *
   * Tests for updating life_map.md with new domain scores and assessments.
   * The PUT handler must:
   * - Accept valid updates with all 6 domains
   * - Accept partial updates (some domains)
   * - Clamp score values to 1-10 range
   * - Allow empty assessment text
   * - Preserve non-table content in file
   * - Return appropriate error responses
   */
  describe('PUT /api/life-map (AC3)', () => {
    const validUpdatePayload = {
      domains: {
        career: { score: 9, assessment: 'Even better now' },
        relationships: { score: 7, assessment: 'Improved' },
        health: { score: 6, assessment: 'Working on it' },
        meaning: { score: 8, assessment: 'Deeper understanding' },
        finances: { score: 9, assessment: 'Growing' },
        fun: { score: 5, assessment: 'Making time' },
      },
    };

    it('should accept valid update with all 6 domains', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should write updated content to file', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      // Check that writeFile was called with correct path and updated content
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/frameworks/life_map.md',
        expect.stringContaining('| Career | 9 | Even better now |'),
        'utf-8'
      );
    });

    it('should accept partial update (some domains)', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const partialPayload = {
        domains: {
          career: { score: 10, assessment: 'Promoted!' },
          // Other domains not specified - should keep existing values
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(partialPayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);

      // The written content should include updated career and preserved others
      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenContent = writeCall[1];

      expect(writtenContent).toContain('| Career | 10 | Promoted! |');
      // Other domains should preserve their original values
      expect(writtenContent).toContain('| Relationships | 6 | Needs more quality time |');
    });

    it('should clamp score values below 1 to 1', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const payloadWithLowScore = {
        domains: {
          career: { score: 0, assessment: 'Zero score' },
          relationships: { score: -5, assessment: 'Negative score' },
          health: { score: 5, assessment: 'Normal' },
          meaning: { score: 5, assessment: 'Normal' },
          finances: { score: 5, assessment: 'Normal' },
          fun: { score: 5, assessment: 'Normal' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithLowScore),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenContent = writeCall[1];

      // Scores should be clamped to 1
      expect(writtenContent).toContain('| Career | 1 |');
      expect(writtenContent).toContain('| Relationships | 1 |');
    });

    it('should clamp score values above 10 to 10', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const payloadWithHighScore = {
        domains: {
          career: { score: 15, assessment: 'Too high' },
          relationships: { score: 100, assessment: 'Way too high' },
          health: { score: 5, assessment: 'Normal' },
          meaning: { score: 5, assessment: 'Normal' },
          finances: { score: 5, assessment: 'Normal' },
          fun: { score: 5, assessment: 'Normal' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithHighScore),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenContent = writeCall[1];

      // Scores should be clamped to 10
      expect(writtenContent).toContain('| Career | 10 |');
      expect(writtenContent).toContain('| Relationships | 10 |');
    });

    it('should allow empty assessment text', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const payloadWithEmptyAssessments = {
        domains: {
          career: { score: 8, assessment: '' },
          relationships: { score: 6, assessment: '' },
          health: { score: 5, assessment: '' },
          meaning: { score: 7, assessment: '' },
          finances: { score: 8, assessment: '' },
          fun: { score: 4, assessment: '' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithEmptyAssessments),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return 500 on file write error', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('EACCES: permission denied'));

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on file read error', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 400 on invalid request body', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 when domains object is missing', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify({ notDomains: {} }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should preserve non-table content in file', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenContent = writeCall[1];

      // Should preserve header content
      expect(writtenContent).toContain('# Life Map');
      expect(writtenContent).toContain("*Adapted from Alex Lieberman's Life Map framework*");

      // Should preserve section headers
      expect(writtenContent).toContain('## The Six Domains');
      expect(writtenContent).toContain('## Current State Assessment');

      // Should preserve footer content
      expect(writtenContent).toContain('**Total Score:** ___ / 60');
    });

    it('should return updated life map data in response', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.domains).toBeDefined();
      expect(data.domains.career.score).toBe(9);
      expect(data.domains.fun.score).toBe(5);
    });

    it('should handle special characters in assessments', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const payloadWithSpecialChars = {
        domains: {
          career: { score: 8, assessment: 'Growth & profit up 50%' },
          relationships: { score: 7, assessment: "Partner's support crucial" },
          health: { score: 6, assessment: 'Gym 3x/week (target: 5x)' },
          meaning: { score: 8, assessment: 'Legacy: help 1000 founders' },
          finances: { score: 9, assessment: 'Net worth > $1M' },
          fun: { score: 5, assessment: 'Hobbies: golf, reading, travel' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithSpecialChars),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);

      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenContent = writeCall[1];

      expect(writtenContent).toContain('Growth & profit up 50%');
      expect(writtenContent).toContain("Partner's support crucial");
    });

    it('should handle undefined assessment (treat as empty string)', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const payloadWithUndefinedAssessment = {
        domains: {
          career: { score: 8 }, // no assessment property
          relationships: { score: 6, assessment: 'Has assessment' },
          health: { score: 5 },
          meaning: { score: 7 },
          finances: { score: 8 },
          fun: { score: 4 },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithUndefinedAssessment),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
    });

    it('should validate score is a number', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);

      const payloadWithInvalidScore = {
        domains: {
          career: { score: 'not a number', assessment: 'Test' },
          relationships: { score: 6, assessment: 'Valid' },
          health: { score: 5, assessment: 'Valid' },
          meaning: { score: 7, assessment: 'Valid' },
          finances: { score: 8, assessment: 'Valid' },
          fun: { score: 4, assessment: 'Valid' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithInvalidScore),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should handle decimal scores by truncating', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/life-map/route');

      (fs.readFile as jest.Mock).mockResolvedValue(lifeMapMarkdown);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const payloadWithDecimalScores = {
        domains: {
          career: { score: 8.7, assessment: 'Decimal score' },
          relationships: { score: 6.1, assessment: 'Another decimal' },
          health: { score: 5, assessment: 'Normal' },
          meaning: { score: 7, assessment: 'Normal' },
          finances: { score: 8, assessment: 'Normal' },
          fun: { score: 4, assessment: 'Normal' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/life-map', {
        method: 'PUT',
        body: JSON.stringify(payloadWithDecimalScores),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
      const writtenContent = writeCall[1];

      // Scores should be truncated to integers
      expect(writtenContent).toContain('| Career | 8 |');
      expect(writtenContent).toContain('| Relationships | 6 |');
    });
  });
});
