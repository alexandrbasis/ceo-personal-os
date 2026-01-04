/**
 * @jest-environment node
 */

/**
 * AC3: API Route Tests - Memory
 *
 * Tests for:
 * - GET /api/memory - Get memory.md file content
 * - PUT /api/memory - Update memory.md file content
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
  MEMORY_PATH: '/mock/path/memory.md',
}));

describe('AC3: API Routes - Memory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const sampleMemoryContent = `# Memory

This is your accumulated self-knowledge - patterns, preferences, and insights about yourself that help you make better decisions.

## Energy Patterns

**Best work hours**: 6am-11am (deep work), afternoon for meetings
**Energy drains**: Back-to-back meetings, context switching
**Energy sources**: Morning walks, focused coding time

## Decision-Making Patterns

**Tendency to overthink**: Yes, especially on reversible decisions
**Risk tolerance**: Medium-high for career, low for health
**Decision regrets**: Usually from inaction, not action

## Productivity Insights

- Write first, edit later works best
- 90-minute focus blocks are optimal
- End day with tomorrow's top 3 priorities

## Communication Style

**Preferred**: Written > verbal for complex topics
**Under stress**: Tend to go quiet, need to communicate more
**Best feedback**: Direct and specific

## Personal Triggers

- Feeling unheard in meetings
- Last-minute changes to plans
- Unclear expectations

## What Works

- Morning routines before checking email
- Weekly reviews on Sunday evening
- Quarterly planning retreats
`;

  describe('GET /api/memory', () => {
    it('should return markdown content as string', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      (fs.readFile as jest.Mock).mockResolvedValue(sampleMemoryContent);

      const request = new NextRequest('http://localhost:3000/api/memory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBeDefined();
      expect(typeof data.content).toBe('string');
      expect(data.content).toBe(sampleMemoryContent);
    });

    it('should read from correct file path', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      (fs.readFile as jest.Mock).mockResolvedValue(sampleMemoryContent);

      const request = new NextRequest('http://localhost:3000/api/memory');
      await GET(request);

      expect(fs.readFile).toHaveBeenCalledWith(
        '/mock/path/memory.md',
        'utf-8'
      );
    });

    it('should return 500 on file read error', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      const request = new NextRequest('http://localhost:3000/api/memory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on permission denied', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const request = new NextRequest('http://localhost:3000/api/memory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return empty string if file is empty', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      (fs.readFile as jest.Mock).mockResolvedValue('');

      const request = new NextRequest('http://localhost:3000/api/memory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('');
    });

    it('should handle markdown with special characters', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      const contentWithSpecialChars = `# Memory

Special chars: & < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Emoji: stars shine bright
Unicode: Cafe, naive, resume
Math: 2 + 2 = 4, 10 > 5, 3 < 7
`;

      (fs.readFile as jest.Mock).mockResolvedValue(contentWithSpecialChars);

      const request = new NextRequest('http://localhost:3000/api/memory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(contentWithSpecialChars);
    });

    it('should handle very long content', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/memory/route');

      const longContent = '# Memory\n\n' + 'A'.repeat(100000);

      (fs.readFile as jest.Mock).mockResolvedValue(longContent);

      const request = new NextRequest('http://localhost:3000/api/memory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(longContent);
    });
  });

  describe('PUT /api/memory', () => {
    const validUpdatePayload = {
      content: `# Updated Memory

## New Energy Patterns
Updated energy patterns content.

## New Insights
- Insight 1
- Insight 2
- Insight 3
`,
    };

    it('should update file content successfully', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/memory', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/memory.md',
        validUpdatePayload.content,
        'utf-8'
      );
    });

    it('should return updated content in response', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('ENOSPC: no space left on device')
      );

      const request = new NextRequest('http://localhost:3000/api/memory', {
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
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/memory', {
        method: 'PUT',
        body: JSON.stringify({ content: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/memory.md',
        '',
        'utf-8'
      );
    });

    it('should handle content with special characters', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const contentWithSpecialChars = `# Memory

Special: & < > " ' \` $ @ ! # % ^ *
Code block:
\`\`\`javascript
const x = 1 && 2 || 3;
\`\`\`
`;

      const request = new NextRequest('http://localhost:3000/api/memory', {
        method: 'PUT',
        body: JSON.stringify({ content: contentWithSpecialChars }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/memory.md',
        contentWithSpecialChars,
        'utf-8'
      );
    });

    it('should handle very long content', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const longContent = '# Memory\n\n' + 'B'.repeat(100000);

      const request = new NextRequest('http://localhost:3000/api/memory', {
        method: 'PUT',
        body: JSON.stringify({ content: longContent }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/memory.md',
        longContent,
        'utf-8'
      );
    });

    it('should preserve newlines and whitespace', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/memory/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const contentWithWhitespace = `# Memory

Paragraph 1 with trailing spaces

  Indented paragraph

\t\tTabbed content

Multiple


Newlines
`;

      const request = new NextRequest('http://localhost:3000/api/memory', {
        method: 'PUT',
        body: JSON.stringify({ content: contentWithWhitespace }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/memory.md',
        contentWithWhitespace,
        'utf-8'
      );
    });
  });
});
