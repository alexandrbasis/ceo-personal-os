/**
 * @jest-environment node
 */

/**
 * API Route Tests - Goals Snapshot
 *
 * Tests for:
 * - GET /api/goals/snapshot - Returns first 3-5 goals with title, description, status
 *
 * AC2: Status from Frontmatter
 * AC3: API Endpoint
 */

import { NextRequest } from 'next/server';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  access: jest.fn(),
}));

// Mock path resolution
jest.mock('@/lib/config', () => ({
  MARKDOWN_BASE_PATH: '/mock/path',
  GOALS_PATH: '/mock/path/goals',
}));

describe('API Routes - Goals Snapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  // Sample goal file content with frontmatter and multiple goals
  const sampleGoalsContent = `---
status: On Track
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
Launch the new product successfully to market

*Why this matters:*
Core business growth and revenue generation

*Success criteria:*
100 paying customers by end of Q2

---

**Goal 2:**

*What:*
Complete AWS Solutions Architect certification

*Why this matters:*
Professional development and technical credibility

*Success criteria:*
Pass the exam with score > 80%

---

### Health

**Goal 3:**

*What:*
Run a full marathon

*Why this matters:*
Physical health and personal achievement

*Success criteria:*
Complete the Chicago Marathon in October

---

### Relationships

**Goal 4:**

*What:*
Spend quality time with family every weekend

*Why this matters:*
Maintain strong family bonds

*Success criteria:*
At least 4 hours of dedicated family time each weekend

---

### Personal Growth

**Goal 5:**

*What:*
Read 24 books this year

*Why this matters:*
Continuous learning and mental stimulation

*Success criteria:*
Average of 2 books per month

---

**Goal 6:**

*What:*
Learn to play guitar

*Why this matters:*
Creative outlet and relaxation

*Success criteria:*
Play 5 songs from start to finish
`;

  const goalsContentWithDifferentStatuses = `---
status: Needs Attention
last_updated: 2026-01-02
---

# One-Year Goals

**Goal 1:**

*What:*
Launch the new product

*Status:* On Track

---

**Goal 2:**

*What:*
Get AWS certification

*Status:* Behind

---

**Goal 3:**

*What:*
Run marathon

*Status:* Needs Attention
`;

  const goalsContentNoFrontmatter = `# One-Year Goals

**Goal 1:**

*What:*
Launch the new product

---

**Goal 2:**

*What:*
Get AWS certification
`;

  const goalsContentWithLongDescriptions = `---
status: On Track
---

# One-Year Goals

**Goal 1:**

*What:*
This is a very long description that definitely exceeds one hundred characters and should be truncated when displayed in the goals snapshot component on the dashboard

---

**Goal 2:**

*What:*
Short goal
`;

  describe('GET /api/goals/snapshot', () => {
    describe('AC3: API Endpoint - Basic Functionality', () => {
      it('should return 200 with goals array', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals).toBeDefined();
        expect(Array.isArray(data.goals)).toBe(true);
      });

      it('should return first 5 goals maximum', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals.length).toBeLessThanOrEqual(5);
      });

      it('should return fewer goals if file has less than 5', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithTwoGoals = `---
status: On Track
---

# One-Year Goals

**Goal 1:**

*What:*
First goal

---

**Goal 2:**

*What:*
Second goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithTwoGoals);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals.length).toBe(2);
      });

      it('should return goal with title, description, and status fields', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals.length).toBeGreaterThan(0);

        const firstGoal = data.goals[0];
        expect(firstGoal).toHaveProperty('title');
        expect(firstGoal).toHaveProperty('description');
        expect(firstGoal).toHaveProperty('status');
      });

      it('should parse goal title correctly', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // First goal should have a meaningful title
        expect(data.goals[0].title).toBeDefined();
        expect(typeof data.goals[0].title).toBe('string');
        expect(data.goals[0].title.length).toBeGreaterThan(0);
      });

      it('should parse goal description from "What" field', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // First goal description should contain "Launch" (from the What field)
        expect(data.goals[0].description).toContain('Launch');
      });

      it('should read from 1_year.md file', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        await GET(request);

        expect(fs.readFile).toHaveBeenCalledWith(
          expect.stringContaining('1_year.md'),
          'utf-8'
        );
      });
    });

    describe('AC3: API Endpoint - Error Handling', () => {
      it('should return 500 on file read error', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockRejectedValue(new Error('Permission denied'));

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });

      it('should return 404 when goals file not found', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file'));

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toContain('not found');
      });

      it('should handle empty goals file', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue('');

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals).toEqual([]);
      });

      it('should handle file with no goals defined', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithNoGoals = `---
status: On Track
---

# One-Year Goals

No goals defined yet.
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithNoGoals);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals).toEqual([]);
      });
    });

    describe('AC2: Status from Frontmatter', () => {
      it('should read status field from goal frontmatter', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // All goals should have the default status from frontmatter
        data.goals.forEach((goal: { status: string }) => {
          expect(goal.status).toBeDefined();
        });
      });

      it('should default to "On Track" when no status field present', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(goalsContentNoFrontmatter);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // When no status in frontmatter, default to "On Track"
        data.goals.forEach((goal: { status: string }) => {
          expect(goal.status).toBe('On Track');
        });
      });

      it('should support status value "On Track"', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithOnTrack = `---
status: On Track
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithOnTrack);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals[0].status).toBe('On Track');
      });

      it('should support status value "Needs Attention"', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithNeedsAttention = `---
status: Needs Attention
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithNeedsAttention);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals[0].status).toBe('Needs Attention');
      });

      it('should support status value "Behind"', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithBehind = `---
status: Behind
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithBehind);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals[0].status).toBe('Behind');
      });

      it('should normalize hyphenated status values', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithHyphenatedStatus = `---
status: on-track
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithHyphenatedStatus);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should normalize to "On Track"
        expect(data.goals[0].status).toBe('On Track');
      });

      it('should normalize lowercase status values', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithLowercaseStatus = `---
status: needs attention
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithLowercaseStatus);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should normalize to "Needs Attention"
        expect(data.goals[0].status).toBe('Needs Attention');
      });

      it('should default invalid status values to "On Track"', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithInvalidStatus = `---
status: invalid-status-value
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithInvalidStatus);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Invalid status should default to "On Track"
        expect(data.goals[0].status).toBe('On Track');
      });

      it('should handle malformed frontmatter gracefully', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithMalformedFrontmatter = `---
status: On Track
invalid yaml here {{{}}}
---

# Goals

**Goal 1:**

*What:*
Test goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithMalformedFrontmatter);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);

        // Should not crash, return 200 with default status or handle error gracefully
        expect([200, 500]).toContain(response.status);
      });
    });

    describe('AC3: Description Truncation', () => {
      it('should truncate description at 100 characters', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(goalsContentWithLongDescriptions);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // First goal has long description - should be truncated
        expect(data.goals[0].description.length).toBeLessThanOrEqual(103); // 100 + "..."
      });

      it('should add ellipsis when truncating', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(goalsContentWithLongDescriptions);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // First goal should be truncated with ellipsis
        expect(data.goals[0].description).toMatch(/\.\.\.$/);
      });

      it('should not truncate short descriptions', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(goalsContentWithLongDescriptions);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Second goal has short description - should not have ellipsis
        expect(data.goals[1].description).toBe('Short goal');
        expect(data.goals[1].description).not.toMatch(/\.\.\.$/);
      });
    });

    describe('Edge Cases', () => {
      it('should handle goals with missing "What" field', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithMissingWhat = `---
status: On Track
---

# Goals

**Goal 1:**

Just a goal without the What field

---

**Goal 2:**

*What:*
Normal goal
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithMissingWhat);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should handle gracefully - return what's available or empty string
        expect(data.goals).toBeDefined();
      });

      it('should preserve goal order from file', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        (fs.readFile as jest.Mock).mockResolvedValue(sampleGoalsContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Goals should be in order
        expect(data.goals.length).toBeGreaterThanOrEqual(3);
        // First goal should be about "Launch"
        expect(data.goals[0].description).toContain('Launch');
      });

      it('should handle special characters in goal text', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const contentWithSpecialChars = `---
status: On Track
---

# Goals

**Goal 1:**

*What:*
Use special chars: & < > " ' \` $100 10% @mention #hashtag

---

**Goal 2:**

*What:*
Unicode: Hello World
`;

        (fs.readFile as jest.Mock).mockResolvedValue(contentWithSpecialChars);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.goals.length).toBe(2);
        // Should preserve special characters
        expect(data.goals[0].description).toContain('$100');
      });

      it('should handle goals file with only template placeholders', async () => {
        const fs = await import('fs/promises');
        const { GET } = await import('@/app/api/goals/snapshot/route');

        const templateContent = `---
status: On Track
---

# One-Year Goals

**Year:** [YEAR]
**Created:** [DATE]

---

## This Year's Goals

### Career / Professional

**Goal 1:**

*What:*
[Enter your first career goal]

*Why this matters:*
[Why is this goal important?]
`;

        (fs.readFile as jest.Mock).mockResolvedValue(templateContent);

        const request = new NextRequest('http://localhost:3000/api/goals/snapshot');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Should still return goals even if they have placeholder text
        expect(Array.isArray(data.goals)).toBe(true);
      });
    });
  });
});
