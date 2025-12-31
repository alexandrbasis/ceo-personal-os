/**
 * T2: Daily Review Markdown Parser Tests
 *
 * Tests for parsing the daily review TEMPLATE.md format:
 * - **Energy level (1-10):** [ ] or **Energy level (1-10):** 7
 * - Blockquotes for answers: > [Your win]
 * - Checkboxes: [ ] Needs action or [x] Just needs acknowledgment
 */

import { DailyReview } from '@/lib/types';

// The parser module we're testing (to be implemented)
// import { parseDailyReview } from '@/lib/parsers/daily-review';

describe('T2: Daily Review Markdown Parser', () => {
  // Sample complete daily review matching TEMPLATE.md format
  const completeDailyReviewMarkdown = `# Daily Check-In

**Date:** 2024-12-31

---

## Energy Check

**Energy level (1-10):** 7

*1 = depleted, 5 = functional, 10 = fully charged*

What's affecting your energy today?

Good sleep, but heavy meeting load

---

## One Meaningful Win

*Not the biggest task completed. The thing that actually mattered.*

> Closed the partnership deal we've been working on for 3 months.

---

## One Friction Point

*What's creating resistance? Where are you stuck?*

> Back-to-back meetings left no time for deep work

Does this need action or just acknowledgment?

[ ] Needs action — I will:
[x] Just needs acknowledgment — moving on

---

## One Thing to Let Go

*What thought, worry, task, or emotion can you release?*

> The guilt about not responding to all Slack messages immediately.

It's done. Let it go.

---

## One Priority for Tomorrow

*If tomorrow only allowed one meaningful thing, what would it be?*

> Finish the Q1 planning document.

---

## Optional: Brief Notes

*Anything else worth capturing? Keep it short.*

Remember to block calendar for focus time next week.

---

**Time to complete:** 4 minutes

*Target: under 5 minutes*
`;

  const emptyTemplateMarkdown = `# Daily Check-In

**Date:** [YYYY-MM-DD]

---

## Energy Check

**Energy level (1-10):** [ ]

*1 = depleted, 5 = functional, 10 = fully charged*

What's affecting your energy today?

[One sentence]

---

## One Meaningful Win

*Not the biggest task completed. The thing that actually mattered.*

> [Your win]

---

## One Friction Point

*What's creating resistance? Where are you stuck?*

> [Your friction]

Does this need action or just acknowledgment?

[ ] Needs action — I will:
[ ] Just needs acknowledgment — moving on

---

## One Thing to Let Go

*What thought, worry, task, or emotion can you release?*

> [What to release]

It's done. Let it go.

---

## One Priority for Tomorrow

*If tomorrow only allowed one meaningful thing, what would it be?*

> [Tomorrow's priority]

---

## Optional: Brief Notes

*Anything else worth capturing? Keep it short.*

[Notes]

---

**Time to complete:** ___ minutes

*Target: under 5 minutes*
`;

  const partialReviewMarkdown = `# Daily Check-In

**Date:** 2024-12-30

---

## Energy Check

**Energy level (1-10):** 5

*1 = depleted, 5 = functional, 10 = fully charged*

What's affecting your energy today?

Tired from travel

---

## One Meaningful Win

*Not the biggest task completed. The thing that actually mattered.*

> Made progress on the presentation

---

## One Friction Point

*What's creating resistance? Where are you stuck?*

>

Does this need action or just acknowledgment?

[ ] Needs action — I will:
[ ] Just needs acknowledgment — moving on

---

## One Thing to Let Go

*What thought, worry, task, or emotion can you release?*

>

It's done. Let it go.

---

## One Priority for Tomorrow

*If tomorrow only allowed one meaningful thing, what would it be?*

> Prepare for client meeting

---

## Optional: Brief Notes

*Anything else worth capturing? Keep it short.*



---

**Time to complete:** 3 minutes

*Target: under 5 minutes*
`;

  const addressActionMarkdown = `# Daily Check-In

**Date:** 2024-12-29

---

## Energy Check

**Energy level (1-10):** 6

*1 = depleted, 5 = functional, 10 = fully charged*

What's affecting your energy today?

Average day

---

## One Meaningful Win

*Not the biggest task completed. The thing that actually mattered.*

> Resolved the billing issue

---

## One Friction Point

*What's creating resistance? Where are you stuck?*

> Need to hire a new developer

Does this need action or just acknowledgment?

[x] Needs action — I will: Post job listing tomorrow
[ ] Just needs acknowledgment — moving on

---

## One Thing to Let Go

*What thought, worry, task, or emotion can you release?*

> Worry about Q4 numbers

It's done. Let it go.

---

## One Priority for Tomorrow

*If tomorrow only allowed one meaningful thing, what would it be?*

> Interview candidates

---

## Optional: Brief Notes

*Anything else worth capturing? Keep it short.*



---

**Time to complete:** 5 minutes

*Target: under 5 minutes*
`;

  describe('parseDailyReview', () => {
    // Note: These tests will FAIL until the parser is implemented

    it('should parse a complete daily review file with all fields filled', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/reviews/daily/2024-12-31.md');

      expect(result).toBeDefined();
      expect(result.date).toBe('2024-12-31');
      expect(result.energyLevel).toBe(7);
      expect(result.energyFactors).toBe('Good sleep, but heavy meeting load');
      expect(result.meaningfulWin).toBe('Closed the partnership deal we\'ve been working on for 3 months.');
      expect(result.frictionPoint).toBe('Back-to-back meetings left no time for deep work');
      expect(result.frictionAction).toBe('letting_go');
      expect(result.thingToLetGo).toBe('The guilt about not responding to all Slack messages immediately.');
      expect(result.tomorrowPriority).toBe('Finish the Q1 planning document.');
      expect(result.notes).toBe('Remember to block calendar for focus time next week.');
      expect(result.completionTimeMinutes).toBe(4);
      expect(result.filePath).toBe('/reviews/daily/2024-12-31.md');
    });

    it('should extract date from "**Date:** YYYY-MM-DD" format', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.date).toBe('2024-12-31');
    });

    it('should extract energy level from "**Energy level (1-10):** N"', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.energyLevel).toBe(7);
    });

    it('should extract energy factors from text after question', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.energyFactors).toBe('Good sleep, but heavy meeting load');
    });

    it('should extract meaningful win from blockquote after "## One Meaningful Win"', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.meaningfulWin).toBe('Closed the partnership deal we\'ve been working on for 3 months.');
    });

    it('should extract friction point from blockquote after "## One Friction Point"', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.frictionPoint).toBe('Back-to-back meetings left no time for deep work');
    });

    it('should detect friction action as "letting_go" when acknowledgment is checked', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.frictionAction).toBe('letting_go');
    });

    it('should detect friction action as "address" when action is checked', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(addressActionMarkdown, '/test.md');

      expect(result.frictionAction).toBe('address');
    });

    it('should extract thing to let go from blockquote after "## One Thing to Let Go"', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.thingToLetGo).toBe('The guilt about not responding to all Slack messages immediately.');
    });

    it('should extract tomorrow\'s priority from blockquote after "## One Priority for Tomorrow"', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.tomorrowPriority).toBe('Finish the Q1 planning document.');
    });

    it('should extract notes from "## Optional: Brief Notes" section', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.notes).toBe('Remember to block calendar for focus time next week.');
    });

    it('should extract completion time from "**Time to complete:** N minutes"', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(completeDailyReviewMarkdown, '/test.md');

      expect(result.completionTimeMinutes).toBe(4);
    });

    it('should handle missing optional fields (return undefined)', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(partialReviewMarkdown, '/test.md');

      expect(result.frictionPoint).toBeUndefined();
      expect(result.thingToLetGo).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it('should return undefined frictionAction when neither checkbox is checked', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(partialReviewMarkdown, '/test.md');

      expect(result.frictionAction).toBeUndefined();
    });

    it('should handle malformed markdown gracefully (no crash)', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const malformedMarkdown = `
This is not valid daily review markdown
Just some random text
## Random Header
More text
`;

      expect(() => {
        parseDailyReview(malformedMarkdown, '/test.md');
      }).not.toThrow();
    });

    it('should return partial data when file is incomplete', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const incompleteMarkdown = `# Daily Check-In

**Date:** 2024-12-28

---

## Energy Check

**Energy level (1-10):** 8

This file ends abruptly...
`;

      const result = parseDailyReview(incompleteMarkdown, '/test.md');

      expect(result.date).toBe('2024-12-28');
      expect(result.energyLevel).toBe(8);
      expect(result.meaningfulWin).toBeUndefined();
      expect(result.tomorrowPriority).toBeUndefined();
    });

    it('should handle template placeholders as empty values', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const result = parseDailyReview(emptyTemplateMarkdown, '/test.md');

      // Template placeholders like [Your win] should be treated as not filled
      expect(result.date).toBeUndefined(); // [YYYY-MM-DD] is a placeholder
      expect(result.energyLevel).toBeUndefined(); // [ ] is not a number
    });

    it('should handle energy level with empty brackets', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const markdown = `**Energy level (1-10):** [ ]`;

      // Should return undefined for unparseable energy level
      const result = parseDailyReview(markdown, '/test.md');

      expect(result.energyLevel).toBeUndefined();
    });

    it('should trim whitespace from extracted values', async () => {
      const { parseDailyReview } = await import('@/lib/parsers/daily-review');

      const markdownWithWhitespace = `# Daily Check-In

**Date:** 2024-12-31

---

## Energy Check

**Energy level (1-10):** 7

*1 = depleted, 5 = functional, 10 = fully charged*

What's affecting your energy today?

   Lots of whitespace here

---

## One Meaningful Win

*Not the biggest task completed. The thing that actually mattered.*

>    Win with spaces

---

## One Priority for Tomorrow

*If tomorrow only allowed one meaningful thing, what would it be?*

>   Priority with spaces

---

**Time to complete:** 3 minutes
`;

      const result = parseDailyReview(markdownWithWhitespace, '/test.md');

      expect(result.energyFactors).toBe('Lots of whitespace here');
      expect(result.meaningfulWin).toBe('Win with spaces');
      expect(result.tomorrowPriority).toBe('Priority with spaces');
    });
  });
});
