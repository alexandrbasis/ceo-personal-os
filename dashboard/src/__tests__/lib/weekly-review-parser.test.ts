/**
 * Weekly Review Markdown Parser Tests
 *
 * Tests for parsing and serializing the weekly review markdown format:
 * - Week Starting date (YYYY-MM-DD)
 * - Week Number
 * - All 5 reflection sections with blockquotes
 * - Optional notes
 * - Completion time
 *
 * AC1: Weekly Reviews
 * AC5: Data Persistence - Weekly reviews save to markdown
 */

import { WeeklyReview, WeeklyReviewFormData } from '@/lib/types';

// Sample complete weekly review matching expected format
const completeWeeklyReviewMarkdown = `# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

*Not tasks completed. The outcomes that truly mattered.*

> Closed the partnership deal with Acme Corp that we've been pursuing for 6 months.

---

## What Was Noise Disguised as Work

*Busy work that felt productive but didn't advance key goals.*

> Back-to-back status meetings that could have been async updates.

---

## Where Your Time Leaked

*Where did hours disappear without meaningful output?*

> Checking email every 10 minutes instead of batching. Spent 3+ hours on this.

---

## One Strategic Insight

*What did this week teach you about your work, priorities, or approach?*

> High-leverage activities often feel uncomfortable because they require focus and saying no to easy tasks.

---

## One Adjustment for Next Week

*What one change will you make based on this week's learning?*

> Block the first 3 hours of each day for deep work with notifications off.

---

## Optional: Notes

*Anything else worth capturing?*

Remember to prepare for quarterly planning next week.

---

**Time to complete:** 18 minutes

*Target: under 20 minutes*
`;

const minimalWeeklyReviewMarkdown = `# Weekly Review

**Week Starting:** 2025-12-22
**Week Number:** 52

---

## What Actually Moved the Needle This Week

> Shipped the new feature.

---

## What Was Noise Disguised as Work

> Unnecessary meetings.

---

## Where Your Time Leaked

> Social media.

---

## One Strategic Insight

> Focus matters.

---

## One Adjustment for Next Week

> Less meetings.

---

**Time to complete:** 10 minutes
`;

const emptyTemplateMarkdown = `# Weekly Review

**Week Starting:** [YYYY-MM-DD]
**Week Number:** [N]

---

## What Actually Moved the Needle This Week

*Not tasks completed. The outcomes that truly mattered.*

> [Your key outcomes]

---

## What Was Noise Disguised as Work

*Busy work that felt productive but didn't advance key goals.*

> [Busy work identified]

---

## Where Your Time Leaked

*Where did hours disappear without meaningful output?*

> [Time leaks]

---

## One Strategic Insight

*What did this week teach you about your work, priorities, or approach?*

> [Your insight]

---

## One Adjustment for Next Week

*What one change will you make based on this week's learning?*

> [Your adjustment]

---

## Optional: Notes

*Anything else worth capturing?*

[Notes]

---

**Time to complete:** ___ minutes

*Target: under 20 minutes*
`;

describe('Weekly Review Markdown Parser', () => {
  describe('parseWeeklyReview', () => {
    it('should parse a complete weekly review file with all fields filled', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/reviews/weekly/2025-12-29.md');

      expect(result).toBeDefined();
      expect(result.date).toBe('2025-12-29');
      expect(result.weekNumber).toBe(1);
      expect(result.movedNeedle).toBe('Closed the partnership deal with Acme Corp that we\'ve been pursuing for 6 months.');
      expect(result.noiseDisguisedAsWork).toBe('Back-to-back status meetings that could have been async updates.');
      expect(result.timeLeaks).toBe('Checking email every 10 minutes instead of batching. Spent 3+ hours on this.');
      expect(result.strategicInsight).toBe('High-leverage activities often feel uncomfortable because they require focus and saying no to easy tasks.');
      expect(result.adjustmentForNextWeek).toBe('Block the first 3 hours of each day for deep work with notifications off.');
      expect(result.notes).toBe('Remember to prepare for quarterly planning next week.');
      expect(result.duration).toBe(18);
      expect(result.filePath).toBe('/reviews/weekly/2025-12-29.md');
    });

    it('should extract date from "**Week Starting:** YYYY-MM-DD" format', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.date).toBe('2025-12-29');
    });

    it('should extract week number from "**Week Number:** N"', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.weekNumber).toBe(1);
    });

    it('should extract "moved needle" from section', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.movedNeedle).toBe('Closed the partnership deal with Acme Corp that we\'ve been pursuing for 6 months.');
    });

    it('should extract "noise disguised as work" from section', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.noiseDisguisedAsWork).toBe('Back-to-back status meetings that could have been async updates.');
    });

    it('should extract "time leaks" from section', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.timeLeaks).toBe('Checking email every 10 minutes instead of batching. Spent 3+ hours on this.');
    });

    it('should extract "strategic insight" from section', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.strategicInsight).toBe('High-leverage activities often feel uncomfortable because they require focus and saying no to easy tasks.');
    });

    it('should extract "adjustment for next week" from section', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.adjustmentForNextWeek).toBe('Block the first 3 hours of each day for deep work with notifications off.');
    });

    it('should extract notes from optional section', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.notes).toBe('Remember to prepare for quarterly planning next week.');
    });

    it('should extract completion time from "**Time to complete:** N minutes"', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(completeWeeklyReviewMarkdown, '/test.md');

      expect(result.duration).toBe(18);
    });

    it('should handle missing optional fields (return undefined)', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(minimalWeeklyReviewMarkdown, '/test.md');

      expect(result.notes).toBeUndefined();
    });

    it('should handle malformed markdown gracefully (no crash)', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const malformedMarkdown = `
This is not valid weekly review markdown
Just some random text
## Random Header
More text
`;

      expect(() => {
        parseWeeklyReview(malformedMarkdown, '/test.md');
      }).not.toThrow();
    });

    it('should return partial data when file is incomplete', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const incompleteMarkdown = `# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

> Partial content

This file ends abruptly...
`;

      const result = parseWeeklyReview(incompleteMarkdown, '/test.md');

      expect(result.date).toBe('2025-12-29');
      expect(result.weekNumber).toBe(1);
      expect(result.movedNeedle).toBe('Partial content');
      expect(result.noiseDisguisedAsWork).toBeUndefined();
    });

    it('should handle template placeholders as empty values', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(emptyTemplateMarkdown, '/test.md');

      // Template placeholders like [Your key outcomes] should be treated as not filled
      expect(result.date).toBeUndefined(); // [YYYY-MM-DD] is a placeholder
      expect(result.weekNumber).toBeUndefined(); // [N] is not a number
    });

    it('should trim whitespace from extracted values', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const markdownWithWhitespace = `# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

>    Win with leading spaces

---

## What Was Noise Disguised as Work

>   Noise with spaces

---

## Where Your Time Leaked

>   Leaks with spaces

---

## One Strategic Insight

>   Insight with spaces

---

## One Adjustment for Next Week

>   Adjustment with spaces

---

**Time to complete:** 15 minutes
`;

      const result = parseWeeklyReview(markdownWithWhitespace, '/test.md');

      expect(result.movedNeedle).toBe('Win with leading spaces');
      expect(result.noiseDisguisedAsWork).toBe('Noise with spaces');
      expect(result.timeLeaks).toBe('Leaks with spaces');
      expect(result.strategicInsight).toBe('Insight with spaces');
      expect(result.adjustmentForNextWeek).toBe('Adjustment with spaces');
    });

    it('should handle week 52 correctly', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = parseWeeklyReview(minimalWeeklyReviewMarkdown, '/test.md');

      expect(result.weekNumber).toBe(52);
    });

    it('should handle multi-line blockquotes', async () => {
      const { parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const multiLineMarkdown = `# Weekly Review

**Week Starting:** 2025-12-29
**Week Number:** 1

---

## What Actually Moved the Needle This Week

> First line of the win.
> Second line continues the thought.
> Third line wraps it up.

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
`;

      const result = parseWeeklyReview(multiLineMarkdown, '/test.md');

      expect(result.movedNeedle).toContain('First line');
      expect(result.movedNeedle).toContain('Second line');
      expect(result.movedNeedle).toContain('Third line');
    });
  });

  describe('serializeWeeklyReview', () => {
    const completeFormData: WeeklyReviewFormData = {
      date: '2025-12-29',
      weekNumber: 1,
      movedNeedle: 'Closed the major deal',
      noiseDisguisedAsWork: 'Too many meetings',
      timeLeaks: 'Email checking',
      strategicInsight: 'Focus on leverage',
      adjustmentForNextWeek: 'Block morning hours',
      notes: 'Remember quarterly planning',
      duration: 18,
    };

    const minimalFormData: WeeklyReviewFormData = {
      date: '2025-12-22',
      weekNumber: 52,
      movedNeedle: 'Key win',
      noiseDisguisedAsWork: 'Busy work',
      timeLeaks: 'Time wasters',
      strategicInsight: 'Important insight',
      adjustmentForNextWeek: 'Change to make',
    };

    it('should generate markdown with correct header (# Weekly Review)', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('# Weekly Review');
    });

    it('should include formatted week start date in **Week Starting:** field', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('**Week Starting:** 2025-12-29');
    });

    it('should include week number', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('**Week Number:** 1');
    });

    it('should generate "moved needle" section with blockquote', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('## What Actually Moved the Needle This Week');
      expect(result).toContain('> Closed the major deal');
    });

    it('should generate "noise disguised as work" section with blockquote', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('## What Was Noise Disguised as Work');
      expect(result).toContain('> Too many meetings');
    });

    it('should generate "time leaks" section with blockquote', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('## Where Your Time Leaked');
      expect(result).toContain('> Email checking');
    });

    it('should generate "strategic insight" section with blockquote', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('## One Strategic Insight');
      expect(result).toContain('> Focus on leverage');
    });

    it('should generate "adjustment for next week" section with blockquote', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('## One Adjustment for Next Week');
      expect(result).toContain('> Block morning hours');
    });

    it('should generate optional notes section', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('## Optional: Notes');
      expect(result).toContain('Remember quarterly planning');
    });

    it('should generate time to complete footer', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      expect(result).toContain('**Time to complete:** 18 minutes');
    });

    it('should handle missing optional fields gracefully', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(minimalFormData);

      // Should still have all sections
      expect(result).toContain('## Optional: Notes');
      // Should not crash
    });

    it('should handle missing duration', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const dataWithoutDuration: WeeklyReviewFormData = {
        ...minimalFormData,
        duration: undefined,
      };

      const result = serializeWeeklyReview(dataWithoutDuration);

      // Should still have footer but with placeholder
      expect(result).toContain('**Time to complete:**');
    });

    it('should include section dividers (---)', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      // Should have multiple --- dividers
      const dividerCount = (result.match(/\n---\n/g) || []).length;
      expect(dividerCount).toBeGreaterThanOrEqual(6);
    });

    it('should include helper text in each section', async () => {
      const { serializeWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const result = serializeWeeklyReview(completeFormData);

      // Check for some helper text
      expect(result).toContain('*Not tasks completed');
      expect(result).toContain('*Busy work that felt productive');
      expect(result).toContain('*Where did hours disappear');
    });
  });

  describe('Round-trip: serialize -> parse -> compare', () => {
    it('should produce same data after serialization and parsing', async () => {
      const { serializeWeeklyReview, parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const originalData: WeeklyReviewFormData = {
        date: '2025-12-29',
        weekNumber: 1,
        movedNeedle: 'Launched the new product feature',
        noiseDisguisedAsWork: 'Too many check-in meetings',
        timeLeaks: 'Constant Slack checking',
        strategicInsight: 'Deep work requires protected time',
        adjustmentForNextWeek: 'Schedule focus blocks',
        notes: 'Follow up with marketing team',
        duration: 20,
      };

      // Serialize to markdown
      const markdown = serializeWeeklyReview(originalData);

      // Parse the markdown back
      const parsed = parseWeeklyReview(markdown, '/test.md');

      // Compare values
      expect(parsed.date).toBe(originalData.date);
      expect(parsed.weekNumber).toBe(originalData.weekNumber);
      expect(parsed.movedNeedle).toBe(originalData.movedNeedle);
      expect(parsed.noiseDisguisedAsWork).toBe(originalData.noiseDisguisedAsWork);
      expect(parsed.timeLeaks).toBe(originalData.timeLeaks);
      expect(parsed.strategicInsight).toBe(originalData.strategicInsight);
      expect(parsed.adjustmentForNextWeek).toBe(originalData.adjustmentForNextWeek);
      expect(parsed.notes).toBe(originalData.notes);
      expect(parsed.duration).toBe(originalData.duration);
    });

    it('should handle minimal data round-trip', async () => {
      const { serializeWeeklyReview, parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const minimalData: WeeklyReviewFormData = {
        date: '2025-12-22',
        weekNumber: 52,
        movedNeedle: 'Key outcome',
        noiseDisguisedAsWork: 'Wasted effort',
        timeLeaks: 'Time waster',
        strategicInsight: 'Lesson learned',
        adjustmentForNextWeek: 'New approach',
      };

      const markdown = serializeWeeklyReview(minimalData);
      const parsed = parseWeeklyReview(markdown, '/test.md');

      expect(parsed.date).toBe(minimalData.date);
      expect(parsed.weekNumber).toBe(minimalData.weekNumber);
      expect(parsed.movedNeedle).toBe(minimalData.movedNeedle);
      expect(parsed.noiseDisguisedAsWork).toBe(minimalData.noiseDisguisedAsWork);
      expect(parsed.notes).toBeUndefined();
      expect(parsed.duration).toBeUndefined();
    });

    it('should handle special characters in content', async () => {
      const { serializeWeeklyReview, parseWeeklyReview } = await import('@/lib/parsers/weekly-review');

      const dataWithSpecialChars: WeeklyReviewFormData = {
        date: '2025-12-29',
        weekNumber: 1,
        movedNeedle: 'Fixed bug #123 & optimized query',
        noiseDisguisedAsWork: 'Meetings (non-essential)',
        timeLeaks: 'Email checking',
        strategicInsight: "Don't forget: focus matters!",
        adjustmentForNextWeek: 'Block 3+ hours daily',
        notes: 'Q1 targets: $100k revenue goal',
      };

      const markdown = serializeWeeklyReview(dataWithSpecialChars);
      const parsed = parseWeeklyReview(markdown, '/test.md');

      expect(parsed.movedNeedle).toBe(dataWithSpecialChars.movedNeedle);
      expect(parsed.strategicInsight).toBe(dataWithSpecialChars.strategicInsight);
      expect(parsed.notes).toBe(dataWithSpecialChars.notes);
    });
  });
});
