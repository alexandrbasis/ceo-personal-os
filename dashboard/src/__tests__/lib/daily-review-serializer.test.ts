/**
 * T2.5: Daily Review Markdown Serializer Tests
 *
 * Tests for generating markdown from form data in TEMPLATE.md format:
 * - Proper header with formatted date
 * - Energy Check section
 * - All review sections with blockquotes
 * - Proper checkbox formatting
 */

import { DailyReviewFormData } from '@/lib/types';

describe('T2.5: Daily Review Markdown Serializer', () => {
  const completeFormData: DailyReviewFormData = {
    date: '2024-12-31',
    energyLevel: 7,
    energyFactors: 'Good sleep, but heavy meeting load',
    meaningfulWin: 'Closed the partnership deal.',
    frictionPoint: 'Back-to-back meetings',
    frictionAction: 'letting_go',
    thingToLetGo: 'Guilt about Slack messages.',
    tomorrowPriority: 'Finish Q1 planning document.',
    notes: 'Block calendar next week.',
    completionTimeMinutes: 4,
  };

  const minimalFormData: DailyReviewFormData = {
    date: '2024-12-30',
    energyLevel: 5,
    meaningfulWin: 'Made some progress',
    tomorrowPriority: 'Continue working',
  };

  const addressActionFormData: DailyReviewFormData = {
    date: '2024-12-29',
    energyLevel: 6,
    meaningfulWin: 'Resolved the issue',
    frictionPoint: 'Need to hire someone',
    frictionAction: 'address',
    tomorrowPriority: 'Post job listing',
    completionTimeMinutes: 5,
  };

  describe('serializeDailyReview', () => {
    it('should generate markdown with correct header (# Daily Check-In)', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('# Daily Check-In');
    });

    it('should include formatted date in **Date:** field', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('**Date:** 2024-12-31');
    });

    it('should generate Energy Check section with level', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('## Energy Check');
      expect(result).toContain('**Energy level (1-10):** 7');
    });

    it('should include energy factors in Energy Check section', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('Good sleep, but heavy meeting load');
    });

    it('should generate One Meaningful Win section with blockquote', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('## One Meaningful Win');
      expect(result).toContain('> Closed the partnership deal.');
    });

    it('should generate One Friction Point section with blockquote', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('## One Friction Point');
      expect(result).toContain('> Back-to-back meetings');
    });

    it('should generate letting_go friction action with checked acknowledgment checkbox', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('[ ] Needs action');
      expect(result).toContain('[x] Just needs acknowledgment');
    });

    it('should generate address friction action with checked action checkbox', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(addressActionFormData);

      expect(result).toContain('[x] Needs action');
      expect(result).toContain('[ ] Just needs acknowledgment');
    });

    it('should generate One Thing to Let Go section with blockquote', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('## One Thing to Let Go');
      expect(result).toContain('> Guilt about Slack messages.');
    });

    it('should generate One Priority for Tomorrow section with blockquote', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('## One Priority for Tomorrow');
      expect(result).toContain('> Finish Q1 planning document.');
    });

    it('should generate Optional Notes section', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('## Optional: Brief Notes');
      expect(result).toContain('Block calendar next week.');
    });

    it('should generate Time to complete footer', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      expect(result).toContain('**Time to complete:** 4 minutes');
    });

    it('should handle missing optional fields with empty blockquotes', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(minimalFormData);

      // Should still have all sections
      expect(result).toContain('## One Friction Point');
      expect(result).toContain('## One Thing to Let Go');
      expect(result).toContain('## Optional: Brief Notes');

      // Friction point should have empty blockquote
      expect(result).toMatch(/## One Friction Point[\s\S]*?>\s*\n/);
    });

    it('should handle unchecked friction action (both boxes unchecked)', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(minimalFormData);

      // Both checkboxes should be unchecked
      expect(result).toContain('[ ] Needs action');
      expect(result).toContain('[ ] Just needs acknowledgment');
    });

    it('should include helper text in each section', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      // Check for some helper text from template
      expect(result).toContain('*1 = depleted, 5 = functional, 10 = fully charged*');
      expect(result).toContain('*Not the biggest task completed. The thing that actually mattered.*');
      expect(result).toContain('*What\'s creating resistance? Where are you stuck?*');
    });

    it('should include section dividers (---)', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const result = serializeDailyReview(completeFormData);

      // Should have multiple --- dividers
      const dividerCount = (result.match(/\n---\n/g) || []).length;
      expect(dividerCount).toBeGreaterThanOrEqual(6);
    });

    it('should handle empty notes gracefully', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const dataWithoutNotes: DailyReviewFormData = {
        ...completeFormData,
        notes: undefined,
      };

      const result = serializeDailyReview(dataWithoutNotes);

      expect(result).toContain('## Optional: Brief Notes');
      // Should not crash
    });

    it('should handle missing completion time', async () => {
      const { serializeDailyReview } = await import('@/lib/parsers/daily-review');

      const dataWithoutTime: DailyReviewFormData = {
        ...completeFormData,
        completionTimeMinutes: undefined,
      };

      const result = serializeDailyReview(dataWithoutTime);

      // Should still have footer but with placeholder
      expect(result).toContain('**Time to complete:**');
    });
  });

  describe('Round-trip: serialize -> parse -> compare', () => {
    it('should produce same data after serialization and parsing', async () => {
      const { serializeDailyReview, parseDailyReview } = await import('@/lib/parsers/daily-review');

      const originalData: DailyReviewFormData = {
        date: '2024-12-31',
        energyLevel: 8,
        energyFactors: 'Great morning routine',
        meaningfulWin: 'Launched the new feature',
        frictionPoint: 'Too many interruptions',
        frictionAction: 'address',
        thingToLetGo: 'Perfectionism on the presentation',
        tomorrowPriority: 'Team sync meeting',
        notes: 'Remember to follow up with client',
        completionTimeMinutes: 5,
      };

      // Serialize to markdown
      const markdown = serializeDailyReview(originalData);

      // Parse the markdown back
      const parsed = parseDailyReview(markdown, '/test.md');

      // Compare values
      expect(parsed.date).toBe(originalData.date);
      expect(parsed.energyLevel).toBe(originalData.energyLevel);
      expect(parsed.energyFactors).toBe(originalData.energyFactors);
      expect(parsed.meaningfulWin).toBe(originalData.meaningfulWin);
      expect(parsed.frictionPoint).toBe(originalData.frictionPoint);
      expect(parsed.frictionAction).toBe(originalData.frictionAction);
      expect(parsed.thingToLetGo).toBe(originalData.thingToLetGo);
      expect(parsed.tomorrowPriority).toBe(originalData.tomorrowPriority);
      expect(parsed.notes).toBe(originalData.notes);
      expect(parsed.completionTimeMinutes).toBe(originalData.completionTimeMinutes);
    });

    it('should handle minimal data round-trip', async () => {
      const { serializeDailyReview, parseDailyReview } = await import('@/lib/parsers/daily-review');

      const minimalData: DailyReviewFormData = {
        date: '2024-12-30',
        energyLevel: 5,
        meaningfulWin: 'Did something',
        tomorrowPriority: 'Do more',
      };

      const markdown = serializeDailyReview(minimalData);
      const parsed = parseDailyReview(markdown, '/test.md');

      expect(parsed.date).toBe(minimalData.date);
      expect(parsed.energyLevel).toBe(minimalData.energyLevel);
      expect(parsed.meaningfulWin).toBe(minimalData.meaningfulWin);
      expect(parsed.tomorrowPriority).toBe(minimalData.tomorrowPriority);
      expect(parsed.frictionPoint).toBeUndefined();
      expect(parsed.frictionAction).toBeUndefined();
    });

    it('should handle special characters in content', async () => {
      const { serializeDailyReview, parseDailyReview } = await import('@/lib/parsers/daily-review');

      const dataWithSpecialChars: DailyReviewFormData = {
        date: '2024-12-31',
        energyLevel: 7,
        meaningfulWin: 'Fixed bug #123 & optimized query',
        tomorrowPriority: 'Review PR (critical)',
        notes: 'Don\'t forget: email CEO about Q1 targets!',
      };

      const markdown = serializeDailyReview(dataWithSpecialChars);
      const parsed = parseDailyReview(markdown, '/test.md');

      expect(parsed.meaningfulWin).toBe(dataWithSpecialChars.meaningfulWin);
      expect(parsed.tomorrowPriority).toBe(dataWithSpecialChars.tomorrowPriority);
      expect(parsed.notes).toBe(dataWithSpecialChars.notes);
    });
  });
});
