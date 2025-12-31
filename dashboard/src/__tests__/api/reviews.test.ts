/**
 * T4: API Route Tests - Daily Reviews
 *
 * Tests for:
 * - GET /api/reviews/daily - List all reviews
 * - POST /api/reviews/daily - Create new review
 * - GET /api/reviews/daily/[date] - Get specific review
 * - PUT /api/reviews/daily/[date] - Update existing review
 */

import { NextRequest } from 'next/server';
import { DailyReviewFormData, ReviewListItem } from '@/lib/types';

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
}));

describe('T4: API Routes - Daily Reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reviews/daily', () => {
    it('should return list of all daily reviews', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/route');

      // Mock directory listing
      (fs.readdir as jest.Mock).mockResolvedValue([
        '2024-12-31.md',
        '2024-12-30.md',
        '2024-12-29.md',
      ]);

      // Mock file contents
      (fs.readFile as jest.Mock).mockResolvedValue(`# Daily Check-In

**Date:** 2024-12-31

---

## Energy Check

**Energy level (1-10):** 7

What's affecting your energy today?

Good day

---

## One Meaningful Win

> Did something great

---

## One Priority for Tomorrow

> Important task

---

**Time to complete:** 4 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toBeDefined();
      expect(Array.isArray(data.reviews)).toBe(true);
      expect(data.reviews.length).toBe(3);
    });

    it('should return array with date, energyLevel, tomorrowPriority, filePath for each', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/route');

      (fs.readdir as jest.Mock).mockResolvedValue(['2024-12-31.md']);
      (fs.readFile as jest.Mock).mockResolvedValue(`# Daily Check-In

**Date:** 2024-12-31

---

## Energy Check

**Energy level (1-10):** 8

What's affecting your energy today?

Feeling great

---

## One Meaningful Win

> Closed the deal

---

## One Priority for Tomorrow

> Plan Q1 roadmap

---

**Time to complete:** 3 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily');
      const response = await GET(request);
      const data = await response.json();

      const review = data.reviews[0];
      expect(review.date).toBe('2024-12-31');
      expect(review.energyLevel).toBe(8);
      expect(review.tomorrowPriority).toBe('Plan Q1 roadmap');
      expect(review.filePath).toContain('2024-12-31.md');
    });

    it('should return empty array when no reviews exist', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/route');

      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toEqual([]);
    });

    it('should order reviews by date descending', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/route');

      // Files in random order
      (fs.readdir as jest.Mock).mockResolvedValue([
        '2024-12-29.md',
        '2024-12-31.md',
        '2024-12-30.md',
      ]);

      // Mock file reads with dates
      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        const date = path.match(/(\d{4}-\d{2}-\d{2})\.md/)?.[1];
        return Promise.resolve(`# Daily Check-In

**Date:** ${date}

---

## Energy Check

**Energy level (1-10):** 7

What's affecting your energy today?

Test

---

## One Meaningful Win

> Win

---

## One Priority for Tomorrow

> Priority

---

**Time to complete:** 3 minutes
`);
      });

      const request = new NextRequest('http://localhost:3000/api/reviews/daily');
      const response = await GET(request);
      const data = await response.json();

      expect(data.reviews[0].date).toBe('2024-12-31');
      expect(data.reviews[1].date).toBe('2024-12-30');
      expect(data.reviews[2].date).toBe('2024-12-29');
    });

    it('should filter out non-markdown files', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/route');

      (fs.readdir as jest.Mock).mockResolvedValue([
        '2024-12-31.md',
        'TEMPLATE.md',
        '.DS_Store',
        'notes.txt',
      ]);

      (fs.readFile as jest.Mock).mockResolvedValue(`# Daily Check-In

**Date:** 2024-12-31

---

## Energy Check

**Energy level (1-10):** 7

What's affecting your energy today?

Test

---

## One Meaningful Win

> Win

---

## One Priority for Tomorrow

> Priority

---

**Time to complete:** 3 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily');
      const response = await GET(request);
      const data = await response.json();

      // Should only return the dated review, not TEMPLATE.md or other files
      expect(data.reviews.length).toBe(1);
      expect(data.reviews[0].date).toBe('2024-12-31');
    });
  });

  describe('POST /api/reviews/daily', () => {
    const validFormData: DailyReviewFormData = {
      date: '2024-12-31',
      energyLevel: 7,
      energyFactors: 'Good sleep',
      meaningfulWin: 'Closed the deal',
      tomorrowPriority: 'Plan Q1',
      completionTimeMinutes: 4,
    };

    it('should create new markdown file with valid data', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/reviews/daily/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return success: true and filePath on success', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/reviews/daily/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.filePath).toContain('2024-12-31.md');
    });

    it('should return error if file already exists', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/reviews/daily/route');

      // File exists
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const { POST } = await import('@/app/api/reviews/daily/route');

      const invalidData = {
        date: '2024-12-31',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/daily', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate date format', async () => {
      const { POST } = await import('@/app/api/reviews/daily/route');

      const invalidDateData = {
        ...validFormData,
        date: 'invalid-date',
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/daily', {
        method: 'POST',
        body: JSON.stringify(invalidDateData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('date');
    });

    it('should validate energyLevel range (1-10)', async () => {
      const { POST } = await import('@/app/api/reviews/daily/route');

      const invalidEnergyData = {
        ...validFormData,
        energyLevel: 15,
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/daily', {
        method: 'POST',
        body: JSON.stringify(invalidEnergyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('energyLevel');
    });
  });

  describe('GET /api/reviews/daily/[date]', () => {
    it('should return parsed review for valid date', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/[date]/route');

      (fs.readFile as jest.Mock).mockResolvedValue(`# Daily Check-In

**Date:** 2024-12-31

---

## Energy Check

**Energy level (1-10):** 8

What's affecting your energy today?

Great energy today

---

## One Meaningful Win

> Completed the project

---

## One Friction Point

> Too many meetings

Does this need action or just acknowledgment?

[ ] Needs action — I will:
[x] Just needs acknowledgment — moving on

---

## One Thing to Let Go

> Worry about deadlines

---

## One Priority for Tomorrow

> Start new sprint

---

## Optional: Brief Notes

Some notes here.

---

**Time to complete:** 5 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/2024-12-31');
      const response = await GET(request, { params: { date: '2024-12-31' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.date).toBe('2024-12-31');
      expect(data.energyLevel).toBe(8);
      expect(data.meaningfulWin).toBe('Completed the project');
      expect(data.frictionAction).toBe('letting_go');
    });

    it('should return 404 when review not found', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/daily/[date]/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/2024-12-31');
      const response = await GET(request, { params: { date: '2024-12-31' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should validate date format', async () => {
      const { GET } = await import('@/app/api/reviews/daily/[date]/route');

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/invalid-date');
      const response = await GET(request, { params: { date: 'invalid-date' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('date');
    });
  });

  describe('PUT /api/reviews/daily/[date]', () => {
    const updateData: DailyReviewFormData = {
      date: '2024-12-31',
      energyLevel: 9,
      energyFactors: 'Updated energy factors',
      meaningfulWin: 'Updated win',
      tomorrowPriority: 'Updated priority',
      completionTimeMinutes: 5,
    };

    it('should update existing review file', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/daily/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/2024-12-31', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { date: '2024-12-31' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return success: true on update', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/daily/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/2024-12-31', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { date: '2024-12-31' } });
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should return 404 when file does not exist', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/daily/[date]/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/2024-12-31', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { date: '2024-12-31' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should validate update data', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/daily/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const invalidData = {
        date: '2024-12-31',
        energyLevel: 'not a number',
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/daily/2024-12-31', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request, { params: { date: '2024-12-31' } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });
});
