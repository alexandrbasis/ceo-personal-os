/**
 * @jest-environment node
 */

/**
 * AC4: API Route Tests - Frameworks
 *
 * Tests for:
 * - GET /api/frameworks/[name] - Get framework file content
 * - PUT /api/frameworks/[name] - Update framework file content
 *
 * Framework allowlist:
 * - annual-review -> frameworks/annual_review.md
 * - vivid-vision -> frameworks/vivid_vision.md
 * - ideal-life-costing -> frameworks/ideal_life_costing.md
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
  FRAMEWORKS_PATH: '/mock/path/frameworks',
}));

describe('AC4: API Routes - Frameworks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const sampleFrameworkContent = `# Annual Review Framework

## Overview
This is a structured approach to year-end reflection, inspired by Dr. Anthony Gustin's methodology.

## The Process

### Part 1: Looking Back
- What were your biggest wins this year?
- What didn't go as planned?
- What surprised you?

### Part 2: Lessons Learned
- What would you do differently?
- What should you keep doing?
- What should you stop doing?

### Part 3: Looking Forward
- What are your priorities for next year?
- What resources do you need?
- What obstacles do you anticipate?

## Templates
Use the templates in \`reviews/annual/\` to complete your review.
`;

  // Valid framework names that should be in the allowlist
  const validFrameworks = ['annual-review', 'vivid-vision', 'ideal-life-costing'];

  // Invalid framework names that should return 404
  const invalidFrameworks = [
    'life-map', // excluded per task doc
    'invalid-name',
    'north-star',
    'principles',
    '../../../etc/passwd',
    'annual_review', // underscore instead of hyphen
    '',
    'ANNUAL-REVIEW', // wrong case
  ];

  describe('GET /api/frameworks/[name]', () => {
    describe('Valid Framework Names', () => {
      it.each(validFrameworks)(
        'should return markdown content for %s',
        async (frameworkName) => {
          const fs = await import('fs/promises');
          const { GET } = await import('@/app/api/frameworks/[name]/route');

          (fs.readFile as jest.Mock).mockResolvedValue(sampleFrameworkContent);

          const request = new NextRequest(
            `http://localhost:3000/api/frameworks/${frameworkName}`
          );
          const response = await GET(request, {
            params: Promise.resolve({ name: frameworkName }),
          });
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data.content).toBeDefined();
          expect(typeof data.content).toBe('string');
          expect(data.content).toBe(sampleFrameworkContent);
        }
      );

      it('should read annual-review from correct file path', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleFrameworkContent);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review'
        );
        await GET(request, { params: Promise.resolve({ name: 'annual-review' }) });

        expect(fs.readFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/annual_review.md',
          'utf-8'
        );
      });

      it('should read vivid-vision from correct file path', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleFrameworkContent);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/vivid-vision'
        );
        await GET(request, { params: Promise.resolve({ name: 'vivid-vision' }) });

        expect(fs.readFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/vivid_vision.md',
          'utf-8'
        );
      });

      it('should read ideal-life-costing from correct file path', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleFrameworkContent);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/ideal-life-costing'
        );
        await GET(request, {
          params: Promise.resolve({ name: 'ideal-life-costing' }),
        });

        expect(fs.readFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/ideal_life_costing.md',
          'utf-8'
        );
      });
    });

    describe('Invalid Framework Names', () => {
      it.each(invalidFrameworks)(
        'should return 404 for invalid framework name: %s',
        async (invalidName) => {
          const fs = await import('fs/promises');
          const { GET } = await import('@/app/api/frameworks/[name]/route');

          const request = new NextRequest(
            `http://localhost:3000/api/frameworks/${invalidName}`
          );
          const response = await GET(request, {
            params: Promise.resolve({ name: invalidName }),
          });
          const data = await response.json();

          expect(response.status).toBe(404);
          expect(data.error).toBeDefined();
          expect(fs.readFile).not.toHaveBeenCalled();
        }
      );

      it('should not allow path traversal attempts', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        const maliciousNames = [
          '../north_star',
          '../../etc/passwd',
          'annual-review/../../../north_star',
          'annual-review%2F..%2F..%2Fnorth_star',
        ];

        for (const maliciousName of maliciousNames) {
          const request = new NextRequest(
            `http://localhost:3000/api/frameworks/${maliciousName}`
          );
          const response = await GET(request, {
            params: Promise.resolve({ name: maliciousName }),
          });

          expect(response.status).toBe(404);
          expect(fs.readFile).not.toHaveBeenCalled();
        }
      });
    });

    describe('Error Handling', () => {
      it('should return 500 on file read error', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        (fs.readFile as jest.Mock).mockRejectedValue(
          new Error('ENOENT: no such file or directory')
        );

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review'
        );
        const response = await GET(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });

      it('should return 500 on permission denied', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        (fs.readFile as jest.Mock).mockRejectedValue(
          new Error('EACCES: permission denied')
        );

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review'
        );
        const response = await GET(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should return empty string if file is empty', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        (fs.readFile as jest.Mock).mockResolvedValue('');

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review'
        );
        const response = await GET(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.content).toBe('');
      });

      it('should handle markdown with special characters', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        const contentWithSpecialChars = `# Framework

Special chars: & < > " ' \` $ @ ! # % ^ * ( ) [ ] { }
Emoji: stars shine bright
Unicode: Cafe, naive, resume
Math: 2 + 2 = 4, 10 > 5, 3 < 7
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithSpecialChars);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review'
        );
        const response = await GET(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.content).toBe(contentWithSpecialChars);
      });

      it('should handle very long content', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/frameworks/[name]/route');

        const longContent = '# Framework\n\n' + 'A'.repeat(100000);

        (fs.readFile as jest.Mock).mockResolvedValue(longContent);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review'
        );
        const response = await GET(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.content).toBe(longContent);
      });
    });
  });

  describe('PUT /api/frameworks/[name]', () => {
    const validUpdatePayload = {
      content: `# Updated Annual Review

## New Structure
This is the updated content for the annual review framework.

## Sections
- Section 1
- Section 2
- Section 3
`,
    };

    describe('Valid Framework Names', () => {
      it.each(validFrameworks)(
        'should update file content successfully for %s',
        async (frameworkName) => {
          const fs = await import('fs/promises');
          const { PUT } = await import('@/app/api/frameworks/[name]/route');

          (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

          const request = new NextRequest(
            `http://localhost:3000/api/frameworks/${frameworkName}`,
            {
              method: 'PUT',
              body: JSON.stringify(validUpdatePayload),
              headers: { 'Content-Type': 'application/json' },
            }
          );

          const response = await PUT(request, {
            params: Promise.resolve({ name: frameworkName }),
          });
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(fs.writeFile).toHaveBeenCalled();
        }
      );

      it('should write annual-review to correct file path', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify(validUpdatePayload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        await PUT(request, { params: Promise.resolve({ name: 'annual-review' }) });

        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/annual_review.md',
          validUpdatePayload.content,
          'utf-8'
        );
      });

      it('should write vivid-vision to correct file path', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/vivid-vision',
          {
            method: 'PUT',
            body: JSON.stringify(validUpdatePayload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        await PUT(request, { params: Promise.resolve({ name: 'vivid-vision' }) });

        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/vivid_vision.md',
          validUpdatePayload.content,
          'utf-8'
        );
      });

      it('should write ideal-life-costing to correct file path', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/ideal-life-costing',
          {
            method: 'PUT',
            body: JSON.stringify(validUpdatePayload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        await PUT(request, {
          params: Promise.resolve({ name: 'ideal-life-costing' }),
        });

        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/ideal_life_costing.md',
          validUpdatePayload.content,
          'utf-8'
        );
      });

      it('should return updated content in response', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify(validUpdatePayload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.content).toBe(validUpdatePayload.content);
      });
    });

    describe('Invalid Framework Names', () => {
      it.each(invalidFrameworks)(
        'should return 404 for invalid framework name: %s',
        async (invalidName) => {
          const fs = await import('fs/promises');
          const { PUT } = await import('@/app/api/frameworks/[name]/route');

          const request = new NextRequest(
            `http://localhost:3000/api/frameworks/${invalidName}`,
            {
              method: 'PUT',
              body: JSON.stringify(validUpdatePayload),
              headers: { 'Content-Type': 'application/json' },
            }
          );

          const response = await PUT(request, {
            params: Promise.resolve({ name: invalidName }),
          });
          const data = await response.json();

          expect(response.status).toBe(404);
          expect(data.error).toBeDefined();
          expect(fs.writeFile).not.toHaveBeenCalled();
        }
      );
    });

    describe('Request Validation', () => {
      it('should return 400 on missing content field', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({ notContent: 'some data' }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
        expect(fs.writeFile).not.toHaveBeenCalled();
      });

      it('should return 400 on empty request body', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(400);
        expect(fs.writeFile).not.toHaveBeenCalled();
      });

      it('should return 400 on invalid JSON', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: 'invalid json {{{',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(400);
        expect(fs.writeFile).not.toHaveBeenCalled();
      });

      it('should return 400 when content is not a string', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({ content: { nested: 'object' } }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(400);
        expect(fs.writeFile).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should return 500 on file write error', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockRejectedValue(
          new Error('EACCES: permission denied')
        );

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify(validUpdatePayload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });

      it('should return 500 on disk full error', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockRejectedValue(
          new Error('ENOSPC: no space left on device')
        );

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify(validUpdatePayload),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should allow empty content string', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({ content: '' }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(200);
        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/annual_review.md',
          '',
          'utf-8'
        );
      });

      it('should handle content with special characters', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const contentWithSpecialChars = `# Framework

Special: & < > " ' \` $ @ ! # % ^ *
Code block:
\`\`\`javascript
const x = 1 && 2 || 3;
\`\`\`
`;

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({ content: contentWithSpecialChars }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(200);
        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/annual_review.md',
          contentWithSpecialChars,
          'utf-8'
        );
      });

      it('should handle very long content', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const longContent = '# Framework\n\n' + 'B'.repeat(100000);

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({ content: longContent }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(200);
        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/annual_review.md',
          longContent,
          'utf-8'
        );
      });

      it('should preserve newlines and whitespace', async () => {
        const fs = await import('fs/promises');
        const { PUT } = await import('@/app/api/frameworks/[name]/route');

        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const contentWithWhitespace = `# Framework

Paragraph 1 with trailing spaces

  Indented paragraph

\t\tTabbed content

Multiple


Newlines
`;

        const request = new NextRequest(
          'http://localhost:3000/api/frameworks/annual-review',
          {
            method: 'PUT',
            body: JSON.stringify({ content: contentWithWhitespace }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const response = await PUT(request, {
          params: Promise.resolve({ name: 'annual-review' }),
        });

        expect(response.status).toBe(200);
        expect(fs.writeFile).toHaveBeenCalledWith(
          '/mock/path/frameworks/annual_review.md',
          contentWithWhitespace,
          'utf-8'
        );
      });
    });
  });
});
