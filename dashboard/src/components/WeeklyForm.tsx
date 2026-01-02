'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const DRAFT_KEY = 'weeklyReviewDraft';

// Form validation schema
const weeklyFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  weekNumber: z.number().min(1).max(53),
  movedNeedle: z.string().min(1, 'What moved the needle is required'),
  noiseDisguisedAsWork: z.string().min(1, 'Noise disguised as work is required'),
  timeLeaks: z.string().min(1, 'Time leaks is required'),
  strategicInsight: z.string().min(1, 'Strategic insight is required'),
  adjustmentForNextWeek: z.string().min(1, 'Adjustment for next week is required'),
  notes: z.string().optional(),
  duration: z.number().optional(),
});

type WeeklyFormData = z.infer<typeof weeklyFormSchema>;

export interface WeeklyFormProps {
  onSubmit: (data: WeeklyFormData) => void | Promise<{ success: boolean } | void>;
  initialData?: Partial<WeeklyFormData>;
}

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust to Monday (day 0 = Sunday, so we need to go back)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get ISO week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format week range for display (e.g., "Dec 30 - Jan 5")
 */
function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * WeeklyForm - Form for weekly review with all required fields
 * Features:
 * - Form validation with react-hook-form + zod
 * - Auto-save draft to localStorage every 30 seconds
 * - Timer showing elapsed time
 * - Week navigation (previous/next week)
 * - Edit mode support via initialData prop
 */
export function WeeklyForm({ onSubmit, initialData }: WeeklyFormProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    if (initialData?.date) {
      return new Date(initialData.date);
    }
    return getWeekStartDate(new Date());
  });

  // Load draft from localStorage
  const loadDraft = useCallback((): Partial<WeeklyFormData> | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  }, []);

  // Determine initial values (initialData > draft > defaults)
  const getDefaultValues = useCallback((): WeeklyFormData => {
    const draft = loadDraft();
    const weekStart = initialData?.date
      ? new Date(initialData.date)
      : getWeekStartDate(new Date());

    const merged = {
      date: initialData?.date ?? draft?.date ?? formatDate(weekStart),
      weekNumber: initialData?.weekNumber ?? draft?.weekNumber ?? getWeekNumber(weekStart),
      movedNeedle: initialData?.movedNeedle ?? draft?.movedNeedle ?? '',
      noiseDisguisedAsWork: initialData?.noiseDisguisedAsWork ?? draft?.noiseDisguisedAsWork ?? '',
      timeLeaks: initialData?.timeLeaks ?? draft?.timeLeaks ?? '',
      strategicInsight: initialData?.strategicInsight ?? draft?.strategicInsight ?? '',
      adjustmentForNextWeek: initialData?.adjustmentForNextWeek ?? draft?.adjustmentForNextWeek ?? '',
      notes: initialData?.notes ?? draft?.notes ?? '',
      duration: undefined,
    };
    return merged;
  }, [initialData, loadDraft]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WeeklyFormData>({
    resolver: zodResolver(weeklyFormSchema),
    defaultValues: getDefaultValues(),
  });

  const watchedValues = watch();

  // Save draft to localStorage
  const saveDraft = useCallback((data: Partial<WeeklyFormData>) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Timer effect - updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      saveDraft(watchedValues);
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [watchedValues, saveDraft]);

  // Format elapsed time as M:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle form submission
  const handleFormSubmit = async (data: WeeklyFormData) => {
    // Add duration (in minutes) before submitting
    const durationMinutes = Math.floor(elapsedSeconds / 60);
    const dataWithDuration = {
      ...data,
      duration: durationMinutes,
    };

    const result = await onSubmit(dataWithDuration);
    // Clear draft after successful submission
    if (!result || (result && result.success !== false)) {
      clearDraft();
    }
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
    setValue('date', formatDate(newWeekStart));
    setValue('weekNumber', getWeekNumber(newWeekStart));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    // Don't allow navigating past current week
    const currentWeek = getWeekStartDate(new Date());
    if (newWeekStart <= currentWeek) {
      setCurrentWeekStart(newWeekStart);
      setValue('date', formatDate(newWeekStart));
      setValue('weekNumber', getWeekNumber(newWeekStart));
    }
  };

  // Get the first error message for the single alert
  const firstError =
    errors.movedNeedle?.message ||
    errors.noiseDisguisedAsWork?.message ||
    errors.timeLeaks?.message ||
    errors.strategicInsight?.message ||
    errors.adjustmentForNextWeek?.message ||
    errors.date?.message;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Timer and Estimated Time Display */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div data-testid="timer">Timer: {formatTime(elapsedSeconds)}</div>
        <div>Target: 20 minutes</div>
      </div>

      {/* Single Error Alert - shows first validation error */}
      {firstError && (
        <p role="alert" className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
          {firstError}
        </p>
      )}

      {/* Week Selection */}
      <div className="space-y-2">
        <Label htmlFor="week-selector">Select Period</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            aria-label="Go back"
          >
            Previous
          </Button>
          <Input
            id="week-selector"
            type="text"
            readOnly
            value={`Week ${watchedValues.weekNumber} (${formatWeekRange(currentWeekStart)})`}
            className="flex-1 text-center cursor-default"
            aria-label="Week"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            aria-label="Go forward"
          >
            Next
          </Button>
        </div>
        <input type="hidden" {...register('date')} />
        <input type="hidden" {...register('weekNumber', { valueAsNumber: true })} />
      </div>

      {/* What Actually Moved the Needle This Week */}
      <div className="space-y-2">
        <Label htmlFor="movedNeedle">What Moved the Needle</Label>
        <Textarea
          id="movedNeedle"
          placeholder="What actually moved the needle this week? Not tasks completed - the outcomes that truly mattered."
          {...register('movedNeedle')}
          rows={3}
        />
        {errors.movedNeedle && (
          <p className="text-sm text-red-500">{errors.movedNeedle.message}</p>
        )}
      </div>

      {/* What Was Noise Disguised as Work */}
      <div className="space-y-2">
        <Label htmlFor="noiseDisguisedAsWork">Noise Disguised as Work</Label>
        <Textarea
          id="noiseDisguisedAsWork"
          placeholder="What was noise disguised as work? Busy work that felt productive but didn't advance key goals."
          {...register('noiseDisguisedAsWork')}
          rows={3}
        />
        {errors.noiseDisguisedAsWork && (
          <p className="text-sm text-red-500">{errors.noiseDisguisedAsWork.message}</p>
        )}
      </div>

      {/* Where Your Time Leaked */}
      <div className="space-y-2">
        <Label htmlFor="timeLeaks">Where Your Time Leaked</Label>
        <Textarea
          id="timeLeaks"
          placeholder="Where did your time leak? Where did hours disappear without meaningful output?"
          {...register('timeLeaks')}
          rows={3}
        />
        {errors.timeLeaks && (
          <p className="text-sm text-red-500">{errors.timeLeaks.message}</p>
        )}
      </div>

      {/* One Strategic Insight */}
      <div className="space-y-2">
        <Label htmlFor="strategicInsight">One Strategic Insight</Label>
        <Textarea
          id="strategicInsight"
          placeholder="What strategic insight did this week teach you about your work, priorities, or approach?"
          {...register('strategicInsight')}
          rows={3}
        />
        {errors.strategicInsight && (
          <p className="text-sm text-red-500">{errors.strategicInsight.message}</p>
        )}
      </div>

      {/* One Adjustment for Next Week */}
      <div className="space-y-2">
        <span className="flex items-center gap-2 text-sm leading-none font-medium select-none text-foreground">
          Adjustment for Next Week
        </span>
        <Textarea
          id="adjustmentForNextWeek"
          aria-label="adjustment for next 7 days"
          placeholder="What adjustment will you make based on this period's learning?"
          {...register('adjustmentForNextWeek')}
          rows={3}
        />
        {errors.adjustmentForNextWeek && (
          <p className="text-sm text-red-500">{errors.adjustmentForNextWeek.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          {...register('notes')}
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit">Save Review</Button>
    </form>
  );
}
