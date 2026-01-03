/**
 * @jest-environment node
 */

/**
 * AC3: API Route Tests - North Star
 *
 * Tests for:
 * - GET /api/north-star - Get north_star.md file content
 * - PUT /api/north-star - Update north_star.md file content
 */

import { NextRequest } from 'next/server';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
}));

// Mock path resolution
jest.mock('@/lib/config', () => ({
  MARKDOWN_BASE_PATH: '/mock/path',
  NORTH_STAR_PATH: '/mock/path/north_star.md',
}));

describe('AC3: API Routes - North Star', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const sampleNorthStarContent = `# My North Star

## Purpose
To build meaningful products that help people live better lives.

## Core Values
1. **Integrity** - Always do the right thing
2. **Growth** - Never stop learning
3. **Impact** - Create positive change

## Vision
In 10 years, I want to have built a company that:
- Employs 100+ talented people
- Serves millions of users
- Generates sustainable profit while doing good

## Daily Reminder
Every decision should align with this direction.
`;

  describe('GET /api/north-star', () => {
    it('should return markdown content as string', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      (fs.readFile as jest.Mock).mockResolvedValue(sampleNorthStarContent);

      const request = new NextRequest('http://localhost:3000/api/north-star');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBeDefined();
      expect(typeof data.content).toBe('string');
      expect(data.content).toBe(sampleNorthStarContent);
    });

    it('should read from correct file path', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      (fs.readFile as jest.Mock).mockResolvedValue(sampleNorthStarContent);

      const request = new NextRequest('http://localhost:3000/api/north-star');
      await GET(request);

      expect(fs.readFile).toHaveBeenCalledWith(
        '/mock/path/north_star.md',
        'utf-8'
      );
    });

    it('should return 500 on file read error', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      const request = new NextRequest('http://localhost:3000/api/north-star');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on permission denied', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const request = new NextRequest('http://localhost:3000/api/north-star');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return empty string if file is empty', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      (fs.readFile as jest.Mock).mockResolvedValue('');

      const request = new NextRequest('http://localhost:3000/api/north-star');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('');
    });

    it('should handle markdown with special characters', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      const contentWithSpecialChars = `# North Star

Special chars: & < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Emoji: stars shine bright
Unicode: Cafe, naive, resume
Math: 2 + 2 = 4, 10 > 5, 3 < 7
`;

      (fs.readFile as jest.Mock).mockResolvedValue(contentWithSpecialChars);

      const request = new NextRequest('http://localhost:3000/api/north-star');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(contentWithSpecialChars);
    });

    it('should handle very long content', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/north-star/route');

      const longContent = '# North Star\n\n' + 'A'.repeat(100000);

      (fs.readFile as jest.Mock).mockResolvedValue(longContent);

      const request = new NextRequest('http://localhost:3000/api/north-star');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(longContent);
    });
  });

  describe('PUT /api/north-star', () => {
    const validUpdatePayload = {
      content: `# Updated North Star

## New Purpose
A completely updated purpose statement.

## New Goals
- Goal 1
- Goal 2
- Goal 3
`,
    };

    it('should update file content successfully', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/north-star', {
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

    it('should write to correct file path', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/north_star.md',
        validUpdatePayload.content,
        'utf-8'
      );
    });

    it('should return updated content in response', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.content).toBe(validUpdatePayload.content);
    });

    it('should return 400 on missing content field', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({ notContent: 'some data' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should return 400 on empty request body', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should return 400 on invalid JSON', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: 'invalid json {{{',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should return 400 when content is not a string', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({ content: { nested: 'object' } }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should return 500 on file write error', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on disk full error', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('ENOSPC: no space left on device')
      );

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should allow empty content string', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({ content: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/north_star.md',
        '',
        'utf-8'
      );
    });

    it('should handle content with special characters', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const contentWithSpecialChars = `# North Star

Special: & < > " ' \` $ @ ! # % ^ *
Code block:
\`\`\`javascript
const x = 1 && 2 || 3;
\`\`\`
`;

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({ content: contentWithSpecialChars }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/north_star.md',
        contentWithSpecialChars,
        'utf-8'
      );
    });

    it('should handle very long content', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const longContent = '# North Star\n\n' + 'B'.repeat(100000);

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({ content: longContent }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/north_star.md',
        longContent,
        'utf-8'
      );
    });

    it('should preserve newlines and whitespace', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/north-star/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const contentWithWhitespace = `# North Star

Paragraph 1 with trailing spaces

  Indented paragraph

\t\tTabbed content

Multiple


Newlines
`;

      const request = new NextRequest('http://localhost:3000/api/north-star', {
        method: 'PUT',
        body: JSON.stringify({ content: contentWithWhitespace }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/north_star.md',
        contentWithWhitespace,
        'utf-8'
      );
    });
  });
});
