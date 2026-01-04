/**
 * @jest-environment node
 */

/**
 * AC3: API Route Tests - Principles
 *
 * Tests for:
 * - GET /api/principles - Get principles.md file content
 * - PUT /api/principles - Update principles.md file content
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
  PRINCIPLES_PATH: '/mock/path/principles.md',
}));

describe('AC3: API Routes - Principles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const samplePrinciplesContent = `# Operating Principles

These are the principles that guide your decisions when the path isn't clear. They're not aspirations - they're commitments about how you operate.

Review these quarterly. Update them when they no longer feel true.

---

## Decision-Making

**"When in doubt, choose the path that builds optionality."**
Avoid decisions that close doors permanently unless the upside is overwhelming.

**"Speed matters more than perfection in 80% of decisions."**
Identify the 20% where precision matters. Move fast on the rest.

**"What would I do if I weren't afraid?"**
Use this question when you notice yourself avoiding something important.

## Energy & Attention

**"Protect the morning."**
Your best thinking happens before the world starts demanding responses.

**"Say no to good opportunities so you can say yes to great ones."**
Every yes is a no to something else. Be deliberate.

## People & Relationships

**"Hire slow, fire fast, but always with dignity."**
Misalignment doesn't improve with time. Part ways cleanly.

**"Assume good intent until proven otherwise."**
Most friction comes from miscommunication, not malice.

---

## Your Principles

*Add your own below. What do you believe that guides your behavior?*

### [PRINCIPLE NAME]
[What you believe and why it matters to how you operate]
`;

  describe('GET /api/principles', () => {
    it('should return markdown content as string', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      (fs.readFile as jest.Mock).mockResolvedValue(samplePrinciplesContent);

      const request = new NextRequest('http://localhost:3000/api/principles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBeDefined();
      expect(typeof data.content).toBe('string');
      expect(data.content).toBe(samplePrinciplesContent);
    });

    it('should read from correct file path', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      (fs.readFile as jest.Mock).mockResolvedValue(samplePrinciplesContent);

      const request = new NextRequest('http://localhost:3000/api/principles');
      await GET(request);

      expect(fs.readFile).toHaveBeenCalledWith(
        '/mock/path/principles.md',
        'utf-8'
      );
    });

    it('should return 500 on file read error', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('ENOENT: no such file or directory')
      );

      const request = new NextRequest('http://localhost:3000/api/principles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 on permission denied', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const request = new NextRequest('http://localhost:3000/api/principles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return empty string if file is empty', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      (fs.readFile as jest.Mock).mockResolvedValue('');

      const request = new NextRequest('http://localhost:3000/api/principles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('');
    });

    it('should handle markdown with special characters', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      const contentWithSpecialChars = `# Principles

Special chars: & < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Emoji: stars shine bright
Unicode: Cafe, naive, resume
Math: 2 + 2 = 4, 10 > 5, 3 < 7
`;

      (fs.readFile as jest.Mock).mockResolvedValue(contentWithSpecialChars);

      const request = new NextRequest('http://localhost:3000/api/principles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(contentWithSpecialChars);
    });

    it('should handle very long content', async () => {
      const fs = await import('fs/promises');
      const { GET } = await import('@/app/api/principles/route');

      const longContent = '# Principles\n\n' + 'A'.repeat(100000);

      (fs.readFile as jest.Mock).mockResolvedValue(longContent);

      const request = new NextRequest('http://localhost:3000/api/principles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe(longContent);
    });
  });

  describe('PUT /api/principles', () => {
    const validUpdatePayload = {
      content: `# Updated Principles

## New Decision Framework
A completely updated decision framework.

## New Values
- Value 1
- Value 2
- Value 3
`,
    };

    it('should update file content successfully', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/principles', {
        method: 'PUT',
        body: JSON.stringify(validUpdatePayload),
        headers: { 'Content-Type': 'application/json' },
      });

      await PUT(request);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/principles.md',
        validUpdatePayload.content,
        'utf-8'
      );
    });

    it('should return updated content in response', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockRejectedValue(
        new Error('ENOSPC: no space left on device')
      );

      const request = new NextRequest('http://localhost:3000/api/principles', {
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
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/principles', {
        method: 'PUT',
        body: JSON.stringify({ content: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/principles.md',
        '',
        'utf-8'
      );
    });

    it('should handle content with special characters', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const contentWithSpecialChars = `# Principles

Special: & < > " ' \` $ @ ! # % ^ *
Code block:
\`\`\`javascript
const x = 1 && 2 || 3;
\`\`\`
`;

      const request = new NextRequest('http://localhost:3000/api/principles', {
        method: 'PUT',
        body: JSON.stringify({ content: contentWithSpecialChars }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/principles.md',
        contentWithSpecialChars,
        'utf-8'
      );
    });

    it('should handle very long content', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const longContent = '# Principles\n\n' + 'B'.repeat(100000);

      const request = new NextRequest('http://localhost:3000/api/principles', {
        method: 'PUT',
        body: JSON.stringify({ content: longContent }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/principles.md',
        longContent,
        'utf-8'
      );
    });

    it('should preserve newlines and whitespace', async () => {
      const fs = await import('fs/promises');
      const { PUT } = await import('@/app/api/principles/route');

      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const contentWithWhitespace = `# Principles

Paragraph 1 with trailing spaces

  Indented paragraph

\t\tTabbed content

Multiple


Newlines
`;

      const request = new NextRequest('http://localhost:3000/api/principles', {
        method: 'PUT',
        body: JSON.stringify({ content: contentWithWhitespace }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/mock/path/principles.md',
        contentWithWhitespace,
        'utf-8'
      );
    });
  });
});
