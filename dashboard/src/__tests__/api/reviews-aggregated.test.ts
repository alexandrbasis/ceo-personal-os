/**
 * @jest-environment node
 */

/**
 * API Route Tests - Aggregated Reviews Endpoint
 *
 * Tests for AC4: API Updates
 * - GET /api/reviews - Aggregated endpoint for all review types
 * - Support type parameter: all|daily|weekly
 * - Support sort parameter: desc|asc
 * - Default: type=all, sort=desc
 */

import { NextRequest } from 'next/server';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  mkdir: jest.fn(),
}));

// Mock path resolution
jest.mock('@/lib/config', () => ({
  MARKDOWN_BASE_PATH: '/mock/path',
  REVIEWS_DAILY_PATH: '/mock/path/reviews/daily',
  REVIEWS_WEEKLY_PATH: '/mock/path/reviews/weekly',
}));

describe('AC4: API Routes - Aggregated Reviews Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const mockDailyContent = (date: string, energy: number = 7) => `# Daily Check-In

**Date:** ${date}

---

## Energy Check

**Energy level (1-10):** ${energy}

What's affecting your energy today?

Good day

---

## One Meaningful Win

> Did something great

---

## One Priority for Tomorrow

> Important task for ${date}

---

**Time to complete:** 4 minutes
`;

  const mockWeeklyContent = (date: string, weekNum: number) => `# Weekly Review

**Week Starting:** ${date}
**Week Number:** ${weekNum}

---

## What Actually Moved the Needle This Week

> Closed the major partnership deal for week ${weekNum}.

---

## What Was Noise Disguised as Work

> Too many status meetings.

---

## Where Your Time Leaked

> Email checking every 10 minutes.

---

## One Strategic Insight

> Focus on high-leverage activities.

---

## One Adjustment for Next Week

> Block morning hours for deep work.

---

**Time to complete:** 18 minutes
`;

  describe('GET /api/reviews - Default Behavior', () => {
    it('should return all review types by default (type=all)', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      // Mock daily reviews directory
      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md', '2025-01-02.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      // Mock file reads
      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily/2025-01-01.md')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 8));
        }
        if (path.includes('daily/2025-01-02.md')) {
          return Promise.resolve(mockDailyContent('2025-01-02', 7));
        }
        if (path.includes('weekly/2024-12-30.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toBeDefined();
      expect(Array.isArray(data.reviews)).toBe(true);
      // Should have 3 reviews (2 daily + 1 weekly)
      expect(data.reviews.length).toBe(3);
    });

    it('should return reviews sorted by date descending by default', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md', '2025-01-03.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2025-01-02.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})\.md/);
        const date = dateMatch?.[1] || '2025-01-01';
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent(date, 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent(date, 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should be sorted newest first: 2025-01-03, 2025-01-02, 2025-01-01
      expect(data.reviews[0].date).toBe('2025-01-03');
      expect(data.reviews[1].date).toBe('2025-01-02');
      expect(data.reviews[2].date).toBe('2025-01-01');
    });

    it('should include type field for each review item', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 8));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      // Find daily and weekly reviews
      const dailyReview = data.reviews.find((r: { type: string }) => r.type === 'daily');
      const weeklyReview = data.reviews.find((r: { type: string }) => r.type === 'weekly');

      expect(dailyReview).toBeDefined();
      expect(dailyReview.type).toBe('daily');
      expect(weeklyReview).toBeDefined();
      expect(weeklyReview.type).toBe('weekly');
    });
  });

  describe('GET /api/reviews?type=daily - Daily Filter', () => {
    it('should return only daily reviews when type=daily', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md', '2025-01-02.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})\.md/);
          return Promise.resolve(mockDailyContent(dateMatch?.[1] || '2025-01-01', 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=daily');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.length).toBe(2);
      // All reviews should be daily type
      data.reviews.forEach((review: { type: string }) => {
        expect(review.type).toBe('daily');
      });
    });

    it('should return empty array when no daily reviews exist', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve([]);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=daily');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toEqual([]);
    });
  });

  describe('GET /api/reviews?type=weekly - Weekly Filter', () => {
    it('should return only weekly reviews when type=weekly', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md', '2024-12-23.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 7));
        }
        if (path.includes('weekly/2024-12-30.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        if (path.includes('weekly/2024-12-23.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-23', 52));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=weekly');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.length).toBe(2);
      // All reviews should be weekly type
      data.reviews.forEach((review: { type: string }) => {
        expect(review.type).toBe('weekly');
      });
    });

    it('should return empty array when no weekly reviews exist', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=weekly');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toEqual([]);
    });
  });

  describe('GET /api/reviews?sort=asc - Ascending Sort', () => {
    it('should return reviews sorted by date ascending (oldest first)', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md', '2025-01-03.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2025-01-02.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})\.md/);
        const date = dateMatch?.[1] || '2025-01-01';
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent(date, 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent(date, 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?sort=asc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should be sorted oldest first: 2025-01-01, 2025-01-02, 2025-01-03
      expect(data.reviews[0].date).toBe('2025-01-01');
      expect(data.reviews[1].date).toBe('2025-01-02');
      expect(data.reviews[2].date).toBe('2025-01-03');
    });
  });

  describe('GET /api/reviews?sort=desc - Descending Sort', () => {
    it('should return reviews sorted by date descending (newest first)', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md', '2025-01-03.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2025-01-02.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})\.md/);
        const date = dateMatch?.[1] || '2025-01-01';
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent(date, 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent(date, 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?sort=desc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should be sorted newest first: 2025-01-03, 2025-01-02, 2025-01-01
      expect(data.reviews[0].date).toBe('2025-01-03');
      expect(data.reviews[1].date).toBe('2025-01-02');
      expect(data.reviews[2].date).toBe('2025-01-01');
    });
  });

  describe('GET /api/reviews - Combined Parameters', () => {
    it('should support combined params: type=weekly&sort=asc', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md', '2024-12-23.md', '2024-12-16.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 7));
        }
        if (path.includes('weekly/2024-12-30.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        if (path.includes('weekly/2024-12-23.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-23', 52));
        }
        if (path.includes('weekly/2024-12-16.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-16', 51));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=weekly&sort=asc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.length).toBe(3);
      // All should be weekly type
      data.reviews.forEach((review: { type: string }) => {
        expect(review.type).toBe('weekly');
      });
      // Sorted oldest first
      expect(data.reviews[0].date).toBe('2024-12-16');
      expect(data.reviews[1].date).toBe('2024-12-23');
      expect(data.reviews[2].date).toBe('2024-12-30');
    });

    it('should support combined params: type=daily&sort=desc', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md', '2025-01-02.md', '2025-01-03.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        const dateMatch = path.match(/(\d{4}-\d{2}-\d{2})\.md/);
        const date = dateMatch?.[1] || '2025-01-01';
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent(date, 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent(date, 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=daily&sort=desc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.length).toBe(3);
      // All should be daily type
      data.reviews.forEach((review: { type: string }) => {
        expect(review.type).toBe('daily');
      });
      // Sorted newest first
      expect(data.reviews[0].date).toBe('2025-01-03');
      expect(data.reviews[1].date).toBe('2025-01-02');
      expect(data.reviews[2].date).toBe('2025-01-01');
    });
  });

  describe('GET /api/reviews - Error Handling', () => {
    it('should return 400 for invalid type parameter', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reviews?type=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('type');
    });

    it('should return 400 for invalid sort parameter', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reviews?sort=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('sort');
    });

    it('should return empty array when no reviews exist at all', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve([]);
        }
        if (path.includes('weekly')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toEqual([]);
    });

    it('should handle directory not existing gracefully', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toEqual([]);
    });
  });

  describe('GET /api/reviews - Review Item Structure', () => {
    it('should return correct fields for daily reviews', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockResolvedValue(mockDailyContent('2025-01-01', 8));

      const request = new NextRequest('http://localhost:3000/api/reviews?type=daily');
      const response = await GET(request);
      const data = await response.json();

      const review = data.reviews[0];
      expect(review.date).toBe('2025-01-01');
      expect(review.type).toBe('daily');
      expect(review.energyLevel).toBe(8);
      expect(review.tomorrowPriority).toBeDefined();
      expect(review.filePath).toContain('2025-01-01.md');
    });

    it('should return correct fields for weekly reviews', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockResolvedValue(mockWeeklyContent('2024-12-30', 1));

      const request = new NextRequest('http://localhost:3000/api/reviews?type=weekly');
      const response = await GET(request);
      const data = await response.json();

      const review = data.reviews[0];
      expect(review.date).toBe('2024-12-30');
      expect(review.type).toBe('weekly');
      expect(review.weekNumber).toBe(1);
      expect(review.movedNeedle).toBeDefined();
      expect(review.filePath).toContain('2024-12-30.md');
    });
  });

  describe('GET /api/reviews - Edge Cases', () => {
    it('should handle daily and weekly reviews with same date', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      // Both have a review on 2025-01-01
      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent('2025-01-01', 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should have both reviews
      expect(data.reviews.length).toBe(2);
      // Both have same date but different types
      const types = data.reviews.map((r: { type: string }) => r.type);
      expect(types).toContain('daily');
      expect(types).toContain('weekly');
    });

    it('should filter out non-markdown and template files', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve([
            '2025-01-01.md',
            'TEMPLATE.md',
            '.DS_Store',
            'notes.txt',
          ]);
        }
        if (path.includes('weekly')) {
          return Promise.resolve([
            '2024-12-30.md',
            'TEMPLATE.md',
          ]);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily/2025-01-01.md')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 7));
        }
        if (path.includes('weekly/2024-12-30.md')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should only have 2 valid reviews, not templates or other files
      expect(data.reviews.length).toBe(2);
    });

    it('should handle type=all explicitly', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/route');

      (fs.readdir as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(['2025-01-01.md']);
        }
        if (path.includes('weekly')) {
          return Promise.resolve(['2024-12-30.md']);
        }
        return Promise.resolve([]);
      });

      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        if (path.includes('daily')) {
          return Promise.resolve(mockDailyContent('2025-01-01', 7));
        }
        if (path.includes('weekly')) {
          return Promise.resolve(mockWeeklyContent('2024-12-30', 1));
        }
        return Promise.reject(new Error('File not found'));
      });

      const request = new NextRequest('http://localhost:3000/api/reviews?type=all');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews.length).toBe(2);
    });
  });
});
