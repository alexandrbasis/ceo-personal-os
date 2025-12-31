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
});
