/**
 * T1: Project Setup Tests
 *
 * These tests verify the project is properly configured with:
 * - TypeScript
 * - Module aliases (@/ imports)
 * - Utility functions
 */

import { DailyReview, LifeMap, DailyReviewFormData } from '@/lib/types';

describe('T1: Project Setup', () => {
  describe('TypeScript Configuration', () => {
    it('should have working TypeScript with type definitions', () => {
      // This test verifies TypeScript compilation works
      const review: DailyReview = {
        date: '2024-12-31',
        energyLevel: 7,
        meaningfulWin: 'Completed the project',
        tomorrowPriority: 'Start next phase',
        filePath: '/reviews/daily/2024-12-31.md',
      };

      expect(review.date).toBe('2024-12-31');
      expect(review.energyLevel).toBe(7);
    });

    it('should enforce type constraints', () => {
      // TypeScript should catch type errors at compile time
      const formData: DailyReviewFormData = {
        date: '2024-12-31',
        energyLevel: 8,
        meaningfulWin: 'Test win',
        tomorrowPriority: 'Test priority',
      };

      expect(formData.frictionAction).toBeUndefined();
    });
  });

  describe('Module Aliases', () => {
    it('should resolve @/ imports to src directory', async () => {
      // If this test runs, the @/ alias is working
      const types = await import('@/lib/types');
      expect(types).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should have cn() utility for className merging', async () => {
      // Test that cn utility exists and works
      // cn() combines clsx and tailwind-merge
      const { cn } = await import('@/lib/utils');

      expect(cn).toBeDefined();
      expect(typeof cn).toBe('function');

      // Test basic usage
      const result = cn('px-4', 'py-2');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
    });

    it('should merge conflicting Tailwind classes correctly', async () => {
      const { cn } = await import('@/lib/utils');

      // tailwind-merge should resolve conflicts
      const result = cn('px-4', 'px-6');
      expect(result).toBe('px-6');
    });

    it('should handle conditional classes', async () => {
      const { cn } = await import('@/lib/utils');

      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should handle falsy values', async () => {
      const { cn } = await import('@/lib/utils');

      const result = cn('base', false, null, undefined, 'end');
      expect(result).toBe('base end');
    });
  });
});
