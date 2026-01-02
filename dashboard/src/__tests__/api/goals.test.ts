/**
 * @jest-environment node
 */

/**
 * API Route Tests - Goals
 *
 * Tests for:
 * - GET /api/goals/[timeframe] - Read goal file (1-year, 3-year, 10-year)
 * - PUT /api/goals/[timeframe] - Update goal file
 * - GET /api/goals/[timeframe]/draft - Read draft (if exists)
 * - POST /api/goals/[timeframe]/draft - Save draft (auto-save)
 * - DELETE /api/goals/[timeframe]/draft - Clear draft after successful save
 *
 * AC3: Goals API Endpoints
 */

import { NextRequest } from 'next/server';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
}));

// Mock path resolution
jest.mock('@/lib/config', () => ({
  MARKDOWN_BASE_PATH: '/mock/path',
  GOALS_PATH: '/mock/path/goals',
  GOALS_DRAFTS_PATH: '/mock/path/goals/.drafts',
}));

describe('API Routes - Goals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('GET /api/goals/[timeframe]', () => {
    const sampleGoalContent = `---
status: on-track
last_updated: 2026-01-02
---

# One-Year Goals

**Year:** 2026
**Created:** 2026-01-01
**Last Updated:** 2026-01-02

---

## This Year's Goals

### Career / Professional

**Goal 1:**

*What:*
Launch the new product

*Why this matters:*
Core business growth

*Success criteria:*
100 paying customers
`;

    it('should return goal file content for 1-year', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalContent);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBeDefined();
      expect(data.content).toContain('One-Year Goals');
    });

    it('should return goal file content for 3-year', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Three-Year Goals\n\nContent here');

      const request = new NextRequest('http://localhost:3000/api/goals/3-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '3-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Three-Year Goals');
    });

    it('should return goal file content for 10-year', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Ten-Year Goals\n\nVision content');

      const request = new NextRequest('http://localhost:3000/api/goals/10-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '10-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Ten-Year Goals');
    });

    it('should return 400 for invalid timeframe', async () => {
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/5-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '5-year' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid timeframe');
    });

    it('should return 400 for invalid timeframe format', async () => {
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/invalid');
      const response = await GET(request, { params: Promise.resolve({ timeframe: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 404 when file not found', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should parse frontmatter and return metadata if present', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalContent);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.status).toBe('on-track');
      expect(data.metadata.last_updated).toBe('2026-01-02');
    });

    it('should handle files without frontmatter', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Goals\n\nNo frontmatter here');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Goals');
      // metadata should be empty or undefined but not cause an error
      expect(data.metadata).toEqual({});
    });

    it('should map timeframe to correct filename (1-year -> 1_year.md)', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Goals');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('1_year.md'),
        'utf-8'
      );
    });
  });

  describe('PUT /api/goals/[timeframe]', () => {
    const validContent = `---
status: on-track
last_updated: 2026-01-02
---

# One-Year Goals

Updated content here.
`;

    it('should update goal file with valid content', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      // Mock access to check file exists
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      // Mock unlink for draft deletion
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: JSON.stringify({ content: validContent }),
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return success: true on update', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: JSON.stringify({ content: '# Updated Goals' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should return 400 for invalid timeframe', async () => {
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/5-year', {
        method: 'PUT',
        body: JSON.stringify({ content: '# Goals' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '5-year' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid timeframe');
    });

    it('should return 400 for missing content', async () => {
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('content');
    });

    it('should return 400 for empty content', async () => {
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: JSON.stringify({ content: '' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('content');
    });

    it('should clear draft after successful update', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: JSON.stringify({ content: '# Updated Goals' }),
      });

      await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });

      // Should attempt to delete draft file
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('.drafts')
      );
    });

    it('should write to correct file path', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/3-year', {
        method: 'PUT',
        body: JSON.stringify({ content: '# Three Year Goals' }),
      });

      await PUT(request, { params: Promise.resolve({ timeframe: '3-year' }) });

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('3_year.md'),
        '# Three Year Goals',
        'utf-8'
      );
    });
  });

  describe('GET /api/goals/[timeframe]/draft', () => {
    it('should return draft content if exists', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/draft/route');

      const draftContent = '# Draft Goals\n\nWork in progress';
      (fs.readFile as jest.Mock).mockResolvedValue(draftContent);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(draftContent);
      expect(data.hasDraft).toBe(true);
    });

    it('should return 404 if no draft exists', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.hasDraft).toBe(false);
    });

    it('should return 400 for invalid timeframe', async () => {
      const { GET } = await import('@/app/api/goals/[timeframe]/draft/route');

      const request = new NextRequest('http://localhost:3000/api/goals/invalid/draft');
      const response = await GET(request, { params: Promise.resolve({ timeframe: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid timeframe');
    });

    it('should read from correct draft path', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Draft');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft');
      await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringMatching(/\.drafts.*1_year\.md$/),
        'utf-8'
      );
    });
  });

  describe('POST /api/goals/[timeframe]/draft', () => {
    it('should save draft content', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const draftContent = '# Draft Goals\n\nAuto-saved content';
      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'POST',
        body: JSON.stringify({ content: draftContent }),
      });

      const response = await POST(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.drafts'),
        draftContent,
        'utf-8'
      );
    });

    it('should create drafts directory if not exists', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'POST',
        body: JSON.stringify({ content: '# Draft' }),
      });

      await POST(request, { params: Promise.resolve({ timeframe: '1-year' }) });

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.drafts'),
        { recursive: true }
      );
    });

    it('should return success: true on save', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'POST',
        body: JSON.stringify({ content: '# Draft' }),
      });

      const response = await POST(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should return 400 for invalid timeframe', async () => {
      const { POST } = await import('@/app/api/goals/[timeframe]/draft/route');

      const request = new NextRequest('http://localhost:3000/api/goals/invalid/draft', {
        method: 'POST',
        body: JSON.stringify({ content: '# Draft' }),
      });

      const response = await POST(request, { params: Promise.resolve({ timeframe: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid timeframe');
    });

    it('should return 400 for missing content', async () => {
      const { POST } = await import('@/app/api/goals/[timeframe]/draft/route');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('content');
    });

    it('should accept empty string content (clear draft scenario)', async () => {
      const fs = await import('fs/promises');
      const { POST } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      });

      const response = await POST(request, { params: Promise.resolve({ timeframe: '1-year' }) });

      // Empty content should be allowed for drafts (represents clearing)
      // OR could return 400 - implementation specific
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/goals/[timeframe]/draft', () => {
    it('should delete draft file', async () => {
      const fs = await import('fs/promises');
      const { DELETE } = await import('@/app/api/goals/[timeframe]/draft/route');

      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringMatching(/\.drafts.*1_year\.md$/)
      );
    });

    it('should return success: true even if draft does not exist', async () => {
      const fs = await import('fs/promises');
      const { DELETE } = await import('@/app/api/goals/[timeframe]/draft/route');

      // Simulate file not found error
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const request = new NextRequest('http://localhost:3000/api/goals/1-year/draft', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      // Should succeed even if file doesn't exist (idempotent delete)
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 400 for invalid timeframe', async () => {
      const { DELETE } = await import('@/app/api/goals/[timeframe]/draft/route');

      const request = new NextRequest('http://localhost:3000/api/goals/invalid/draft', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ timeframe: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid timeframe');
    });
  });

  describe('Timeframe validation', () => {
    it('should accept "1-year" as valid timeframe', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Goals');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });

      expect(response.status).toBe(200);
    });

    it('should accept "3-year" as valid timeframe', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Goals');

      const request = new NextRequest('http://localhost:3000/api/goals/3-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '3-year' }) });

      expect(response.status).toBe(200);
    });

    it('should accept "10-year" as valid timeframe', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockResolvedValue('# Goals');

      const request = new NextRequest('http://localhost:3000/api/goals/10-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '10-year' }) });

      expect(response.status).toBe(200);
    });

    it('should reject "2-year" as invalid timeframe', async () => {
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/2-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '2-year' }) });

      expect(response.status).toBe(400);
    });

    it('should reject numeric-only timeframe', async () => {
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/1');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1' }) });

      expect(response.status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should handle file system errors gracefully on read', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/goals/[timeframe]/route');

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      const request = new NextRequest('http://localhost:3000/api/goals/1-year');
      const response = await GET(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle file system errors gracefully on write', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('Disk full'));

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: JSON.stringify({ content: '# Goals' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle malformed JSON in request body', async () => {
      const { PUT } = await import('@/app/api/goals/[timeframe]/route');

      const request = new NextRequest('http://localhost:3000/api/goals/1-year', {
        method: 'PUT',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, { params: Promise.resolve({ timeframe: '1-year' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
