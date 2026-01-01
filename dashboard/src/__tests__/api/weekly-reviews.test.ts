/**
 * @jest-environment node
 */

/**
 * API Route Tests - Weekly Reviews
 *
 * Tests for:
 * - GET /api/reviews/weekly - List all weekly reviews
 * - POST /api/reviews/weekly - Create new weekly review
 * - GET /api/reviews/weekly/[date] - Get specific weekly review
 * - PUT /api/reviews/weekly/[date] - Update existing weekly review
 *
 * AC1: Weekly Reviews
 * AC3: Weekly reviews stored in reviews/weekly/ directory
 * AC5: Data persistence to markdown files
 */

import { NextRequest } from 'next/server';
import { WeeklyReviewFormData } from '@/lib/types';

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

describe('API Routes - Weekly Reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reviews/weekly', () => {
    it('should return list of all weekly reviews', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/route');

      // Mock directory listing
      (fs.readdir as jest.Mock).mockResolvedValue([
        '2025-12-29.md',
        '2025-12-22.md',
        '2025-12-15.md',
      ]);

      // Mock file contents
      (fs.readFile as jest.Mock).mockResolvedValue(`# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

> Closed the major partnership deal.

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
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toBeDefined();
      expect(Array.isArray(data.reviews)).toBe(true);
      expect(data.reviews.length).toBe(3);
    });

    it('should return array with date, weekNumber, movedNeedle, filePath for each', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/route');

      (fs.readdir as jest.Mock).mockResolvedValue(['2025-12-29.md']);
      (fs.readFile as jest.Mock).mockResolvedValue(`# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

> Closed the major partnership deal.

---

## What Was Noise Disguised as Work

> Too many meetings.

---

## Where Your Time Leaked

> Email.

---

## One Strategic Insight

> Focus matters.

---

## One Adjustment for Next Week

> Block calendar.

---

**Time to complete:** 15 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly');
      const response = await GET(request);
      const data = await response.json();

      const review = data.reviews[0];
      expect(review.date).toBe('2025-12-29');
      expect(review.weekNumber).toBe(1);
      expect(review.movedNeedle).toBe('Closed the major partnership deal.');
      expect(review.filePath).toContain('2025-12-29.md');
    });

    it('should return empty array when no reviews exist', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/route');

      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toEqual([]);
    });

    it('should order reviews by date descending', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/route');

      // Files in random order
      (fs.readdir as jest.Mock).mockResolvedValue([
        '2025-12-15.md',
        '2025-12-29.md',
        '2025-12-22.md',
      ]);

      // Mock file reads with dates
      (fs.readFile as jest.Mock).mockImplementation((path: string) => {
        const date = path.match(/(\d{4}-\d{2}-\d{2})\.md/)?.[1];
        const weekNum = date === '2025-12-29' ? 1 : date === '2025-12-22' ? 52 : 51;
        return Promise.resolve(`# Weekly Review

**Week Starting:** ${date}
**Week Number:** ${weekNum}

---

## What Actually Moved the Needle This Week

> Win for ${date}

---

## What Was Noise Disguised as Work

> Noise

---

## Where Your Time Leaked

> Leaks

---

## One Strategic Insight

> Insight

---

## One Adjustment for Next Week

> Adjustment

---

**Time to complete:** 15 minutes
`);
      });

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly');
      const response = await GET(request);
      const data = await response.json();

      expect(data.reviews[0].date).toBe('2025-12-29');
      expect(data.reviews[1].date).toBe('2025-12-22');
      expect(data.reviews[2].date).toBe('2025-12-15');
    });

    it('should filter out non-markdown files', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/route');

      (fs.readdir as jest.Mock).mockResolvedValue([
        '2025-12-29.md',
        'TEMPLATE.md',
        '.DS_Store',
        'notes.txt',
      ]);

      (fs.readFile as jest.Mock).mockResolvedValue(`# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

> Win

---

## What Was Noise Disguised as Work

> Noise

---

## Where Your Time Leaked

> Leaks

---

## One Strategic Insight

> Insight

---

## One Adjustment for Next Week

> Adjustment

---

**Time to complete:** 15 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly');
      const response = await GET(request);
      const data = await response.json();

      // Should only return the dated review, not TEMPLATE.md or other files
      expect(data.reviews.length).toBe(1);
      expect(data.reviews[0].date).toBe('2025-12-29');
    });
  });

  describe('POST /api/reviews/weekly', () => {
    const validFormData: WeeklyReviewFormData = {
      date: '2025-12-29',
      weekNumber: 1,
      movedNeedle: 'Closed the major partnership deal',
      noiseDisguisedAsWork: 'Too many meetings',
      timeLeaks: 'Email checking',
      strategicInsight: 'Focus on high-leverage activities',
      adjustmentForNextWeek: 'Block morning hours for deep work',
      duration: 18,
    };

    it('should create new markdown file with valid data', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/reviews/weekly/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
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
      const { POST } = await import('@/app/api/reviews/weekly/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.filePath).toContain('2025-12-29.md');
    });

    it('should return error if file already exists', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/reviews/weekly/route');

      // File exists
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
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
      const { POST } = await import('@/app/api/reviews/weekly/route');

      const invalidData = {
        date: '2025-12-29',
        weekNumber: 1,
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate date format (week start date)', async () => {
      const { POST } = await import('@/app/api/reviews/weekly/route');

      const invalidDateData = {
        ...validFormData,
        date: 'invalid-date',
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
        method: 'POST',
        body: JSON.stringify(invalidDateData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('date');
    });

    it('should validate weekNumber is positive integer', async () => {
      const { POST } = await import('@/app/api/reviews/weekly/route');

      const invalidWeekData = {
        ...validFormData,
        weekNumber: -1,
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
        method: 'POST',
        body: JSON.stringify(invalidWeekData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('weekNumber');
    });

    it('should store file in reviews/weekly/ directory', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/reviews/weekly/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly', {
        method: 'POST',
        body: JSON.stringify(validFormData),
      });

      await POST(request);

      // Verify the file path contains 'weekly'
      const writeFileCall = (fs.writeFile as jest.Mock).mock.calls[0];
      expect(writeFileCall[0]).toContain('weekly');
    });
  });

  describe('GET /api/reviews/weekly/[date]', () => {
    it('should return parsed weekly review for valid date', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.readFile as jest.Mock).mockResolvedValue(`# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

> Closed the major partnership deal.

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

## Optional: Notes

Some additional notes here.

---

**Time to complete:** 18 minutes
`);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29');
      const response = await GET(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.date).toBe('2025-12-29');
      expect(data.weekNumber).toBe(1);
      expect(data.movedNeedle).toBe('Closed the major partnership deal.');
      expect(data.noiseDisguisedAsWork).toBe('Too many status meetings.');
      expect(data.timeLeaks).toBe('Email checking every 10 minutes.');
      expect(data.strategicInsight).toBe('Focus on high-leverage activities.');
      expect(data.adjustmentForNextWeek).toBe('Block morning hours for deep work.');
      expect(data.notes).toBe('Some additional notes here.');
    });

    it('should return 404 when review not found', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29');
      const response = await GET(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should validate date format', async () => {
      const { GET } = await import('@/app/api/reviews/weekly/[date]/route');

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/invalid-date');
      const response = await GET(request, { params: Promise.resolve({ date: 'invalid-date' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('date');
    });
  });

  describe('PUT /api/reviews/weekly/[date]', () => {
    const updateData: WeeklyReviewFormData = {
      date: '2025-12-29',
      weekNumber: 1,
      movedNeedle: 'Updated: Closed TWO major deals',
      noiseDisguisedAsWork: 'Updated noise',
      timeLeaks: 'Updated leaks',
      strategicInsight: 'Updated insight',
      adjustmentForNextWeek: 'Updated adjustment',
      duration: 20,
    };

    it('should update existing review file', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return success: true on update', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should return 404 when file does not exist', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should validate update data', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const invalidData = {
        date: '2025-12-29',
        weekNumber: 'not a number', // Invalid type
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should validate all required fields on update', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/reviews/weekly/[date]/route');

      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const incompleteData = {
        date: '2025-12-29',
        weekNumber: 1,
        movedNeedle: 'Only this field',
        // Missing other required fields
      };

      const request = new NextRequest('http://localhost:3000/api/reviews/weekly/2025-12-29', {
        method: 'PUT',
        body: JSON.stringify(incompleteData),
      });

      const response = await PUT(request, { params: Promise.resolve({ date: '2025-12-29' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
