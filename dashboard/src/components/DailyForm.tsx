'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const DRAFT_KEY = 'dailyReviewDraft';

// Domain ratings schema - each domain is 0-10 scale (0 = not rated)
// All keys are optional to support partial data from drafts or legacy reviews
const domainRatingsSchema = z.object({
  career: z.number().min(0).max(10).optional(),
  relationships: z.number().min(0).max(10).optional(),
  health: z.number().min(0).max(10).optional(),
  meaning: z.number().min(0).max(10).optional(),
  finances: z.number().min(0).max(10).optional(),
  fun: z.number().min(0).max(10).optional(),
});

// Form validation schema
const dailyFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  energyLevel: z.number().min(1).max(10),
  energyFactors: z.string().optional(),
  meaningfulWin: z.string().min(1, 'Meaningful win is required'),
  frictionPoint: z.string().optional(),
  frictionAction: z.enum(['address', 'letting_go']).optional(),
  thingToLetGo: z.string().optional(),
  tomorrowPriority: z.string().min(1, "Tomorrow's priority is required"),
  notes: z.string().optional(),
  domainRatings: domainRatingsSchema.optional(),
});

type DailyFormData = z.infer<typeof dailyFormSchema>;

export interface DailyFormProps {
  onSubmit: (data: DailyFormData) => void | Promise<{ success: boolean } | void>;
  initialData?: Partial<DailyFormData>;
}

/**
 * DailyForm - Form for daily review with all required fields
 * Features:
 * - Form validation with react-hook-form + zod
 * - Auto-save draft to localStorage every 30 seconds
 * - Timer showing elapsed time
 * - Edit mode support via initialData prop
 */
export function DailyForm({ onSubmit, initialData }: DailyFormProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isDomainRatingsExpanded, setIsDomainRatingsExpanded] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Load draft from localStorage
  const loadDraft = useCallback((): Partial<DailyFormData> | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  }, []);

  // Determine initial values (initialData > draft > defaults)
  const getDefaultValues = useCallback((): DailyFormData => {
    const draft = loadDraft();
    const merged = {
      date: initialData?.date ?? draft?.date ?? today,
      energyLevel: initialData?.energyLevel ?? draft?.energyLevel ?? 5,
      energyFactors: initialData?.energyFactors ?? draft?.energyFactors ?? '',
      meaningfulWin: initialData?.meaningfulWin ?? draft?.meaningfulWin ?? '',
      frictionPoint: initialData?.frictionPoint ?? draft?.frictionPoint ?? '',
      frictionAction: initialData?.frictionAction ?? draft?.frictionAction,
      thingToLetGo: initialData?.thingToLetGo ?? draft?.thingToLetGo ?? '',
      tomorrowPriority: initialData?.tomorrowPriority ?? draft?.tomorrowPriority ?? '',
      notes: initialData?.notes ?? draft?.notes ?? '',
      domainRatings: initialData?.domainRatings ?? draft?.domainRatings ?? {
        career: 0,
        relationships: 0,
        health: 0,
        meaning: 0,
        finances: 0,
        fun: 0,
      },
    };
    return merged;
  }, [initialData, loadDraft, today]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DailyFormData>({
    resolver: zodResolver(dailyFormSchema),
    defaultValues: getDefaultValues(),
  });

  const watchedValues = watch();

  // Save draft to localStorage
  const saveDraft = useCallback((data: Partial<DailyFormData>) => {
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
  const handleFormSubmit = async (data: DailyFormData) => {
    const result = await onSubmit(data);
    // Clear draft after successful submission
    if (!result || (result && result.success !== false)) {
      clearDraft();
    }
  };

  // Current energy level value
  const energyLevel = watchedValues.energyLevel ?? 5;

  // Get the first error message for the single alert
  const firstError = errors.meaningfulWin?.message || errors.tomorrowPriority?.message || errors.date?.message;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Timer Display */}
      <div data-testid="timer" className="text-sm text-muted-foreground">
        Timer: {formatTime(elapsedSeconds)}
      </div>

      {/* Single Error Alert - shows first validation error */}
      {firstError && (
        <p role="alert" className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
          {firstError}
        </p>
      )}

      {/* Date Field */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
          defaultValue={today}
        />
        {errors.date && (
          <p aria-live="polite" className="text-sm text-red-500">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Energy Level Slider */}
      <div className="space-y-2">
        <Label htmlFor="energyLevel">Energy Level</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="energyLevel"
            min={1}
            max={10}
            step={1}
            value={[energyLevel]}
            onValueChange={(value) => setValue('energyLevel', value[0])}
            aria-label="Energy Level"
            className="flex-1"
          />
          <span data-testid="energy-display" className="text-lg font-semibold min-w-[3rem] text-right">
            {energyLevel}/10
          </span>
        </div>
      </div>

      {/* Energy Factors */}
      <div className="space-y-2">
        <Label htmlFor="energyFactors">Energy Factors</Label>
        <Textarea
          id="energyFactors"
          placeholder="What's affecting your energy today?"
          {...register('energyFactors')}
        />
      </div>

      {/* Meaningful Win - using visible span text without label association */}
      <div className="space-y-2">
        <span className="flex items-center gap-2 text-sm leading-none font-medium select-none">
          Meaningful Win
        </span>
        <Textarea
          id="meaningfulWin"
          aria-label="Best Win"
          placeholder="What was your most meaningful win today?"
          {...register('meaningfulWin')}
        />
        {errors.meaningfulWin && (
          <p className="text-sm text-red-500">
            {errors.meaningfulWin.message}
          </p>
        )}
      </div>

      {/* Friction Point */}
      <div className="space-y-2">
        <Label htmlFor="frictionPoint">Friction Point</Label>
        <Textarea
          id="frictionPoint"
          placeholder="What caused friction today?"
          {...register('frictionPoint')}
        />
      </div>

      {/* Friction Action Radio Group */}
      <div className="space-y-2">
        <Label>Action Needed</Label>
        <RadioGroup
          defaultValue={watchedValues.frictionAction}
          onValueChange={(value) =>
            setValue('frictionAction', value as 'address' | 'letting_go')
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="address" id="needs-action" />
            <Label htmlFor="needs-action">Needs Action</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="letting_go" id="acknowledgment" />
            <Label htmlFor="acknowledgment">Acknowledgment Only</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Thing to Let Go */}
      <div className="space-y-2">
        <Label htmlFor="thingToLetGo">Thing to Let Go</Label>
        <Textarea
          id="thingToLetGo"
          placeholder="What do you need to let go of?"
          {...register('thingToLetGo')}
        />
      </div>

      {/* Tomorrow's Priority */}
      <div className="space-y-2">
        <Label htmlFor="tomorrowPriority">Priority for Tomorrow</Label>
        <Textarea
          id="tomorrowPriority"
          placeholder="What's your #1 priority for tomorrow?"
          {...register('tomorrowPriority')}
        />
        {errors.tomorrowPriority && (
          <p className="text-sm text-red-500">
            {errors.tomorrowPriority.message}
          </p>
        )}
      </div>

      {/* Domain Ratings (Collapsible) */}
      <div className="space-y-2 border rounded-lg p-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full flex justify-between items-center p-0 h-auto font-medium"
          onClick={() => setIsDomainRatingsExpanded(!isDomainRatingsExpanded)}
          aria-expanded={isDomainRatingsExpanded}
          aria-controls="domain-ratings-content"
        >
          <span>Life Map Ratings</span>
          <span className="text-sm text-muted-foreground">
            {isDomainRatingsExpanded ? 'Hide' : 'Show'}
          </span>
        </Button>
        <p className="text-sm text-muted-foreground">
          Optional: Rate your satisfaction in each life domain (0 = not rated)
        </p>

        {isDomainRatingsExpanded && (
          <div id="domain-ratings-content" className="grid grid-cols-2 gap-4 pt-4">
            {/* Career */}
            <div className="space-y-1">
              <Label htmlFor="domain-career">Career</Label>
              <Input
                id="domain-career"
                type="number"
                min={0}
                max={10}
                value={watchedValues.domainRatings?.career ?? 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  setValue('domainRatings.career', value);
                }}
              />
            </div>

            {/* Relationships */}
            <div className="space-y-1">
              <Label htmlFor="domain-relationships">Relationships</Label>
              <Input
                id="domain-relationships"
                type="number"
                min={0}
                max={10}
                value={watchedValues.domainRatings?.relationships ?? 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  setValue('domainRatings.relationships', value);
                }}
              />
            </div>

            {/* Health */}
            <div className="space-y-1">
              <Label htmlFor="domain-health">Health</Label>
              <Input
                id="domain-health"
                type="number"
                min={0}
                max={10}
                value={watchedValues.domainRatings?.health ?? 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  setValue('domainRatings.health', value);
                }}
              />
            </div>

            {/* Meaning */}
            <div className="space-y-1">
              <Label htmlFor="domain-meaning">Meaning</Label>
              <Input
                id="domain-meaning"
                type="number"
                min={0}
                max={10}
                value={watchedValues.domainRatings?.meaning ?? 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  setValue('domainRatings.meaning', value);
                }}
              />
            </div>

            {/* Finances */}
            <div className="space-y-1">
              <Label htmlFor="domain-finances">Finances</Label>
              <Input
                id="domain-finances"
                type="number"
                min={0}
                max={10}
                value={watchedValues.domainRatings?.finances ?? 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  setValue('domainRatings.finances', value);
                }}
              />
            </div>

            {/* Fun */}
            <div className="space-y-1">
              <Label htmlFor="domain-fun">Fun</Label>
              <Input
                id="domain-fun"
                type="number"
                min={0}
                max={10}
                value={watchedValues.domainRatings?.fun ?? 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  setValue('domainRatings.fun', value);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          {...register('notes')}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit">Save Review</Button>
    </form>
  );
}
