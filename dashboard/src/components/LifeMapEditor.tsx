'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LifeMapChart } from '@/components/LifeMapChart';
import type { LifeMap } from '@/lib/types';

type DomainKey = keyof LifeMap['domains'];

const DOMAINS: { key: DomainKey; label: string }[] = [
  { key: 'career', label: 'Career' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'health', label: 'Health' },
  { key: 'meaning', label: 'Meaning' },
  { key: 'finances', label: 'Finances' },
  { key: 'fun', label: 'Fun' },
];

/**
 * Clamp a score value to the valid range [1, 10]
 * Silently clamps without showing errors
 */
function clampScore(score: number): number {
  if (score < 1) return 1;
  if (score > 10) return 10;
  return score;
}

/**
 * DomainSlider - Native range input styled as a slider
 * Uses native HTML input[type="range"] for better test compatibility
 */
interface DomainSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  'aria-label': string;
  'aria-labelledby': string;
}

function DomainSlider({
  value,
  onChange,
  min,
  max,
  step,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: DomainSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    }
  };

  return (
    <input
      type="range"
      role="slider"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
    />
  );
}

export interface LifeMapEditorProps {
  initialData: LifeMap;
  onSave: (data: LifeMap) => Promise<void>;
  onCancel: () => void;
}

/**
 * LifeMapEditor - Editor for Life Map domain scores and assessments
 *
 * Features:
 * - Sliders for each of 6 domains (1-10 range with silent clamping)
 * - Text fields for domain assessments
 * - Preview radar chart that updates on changes
 * - Save and Cancel buttons
 * - Accessible labels for all controls
 */
export function LifeMapEditor({
  initialData,
  onSave,
  onCancel,
}: LifeMapEditorProps) {
  // Initialize state with clamped scores
  const [domains, setDomains] = useState<LifeMap['domains']>(() => {
    const clamped: LifeMap['domains'] = {} as LifeMap['domains'];
    for (const { key } of DOMAINS) {
      clamped[key] = {
        score: clampScore(initialData.domains[key]?.score ?? 1),
        assessment: initialData.domains[key]?.assessment ?? '',
      };
    }
    return clamped;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const firstSliderRef = useRef<HTMLDivElement>(null);

  // Focus first interactive element on mount for accessibility
  useEffect(() => {
    if (firstSliderRef.current) {
      const slider = firstSliderRef.current.querySelector('[role="slider"]');
      if (slider instanceof HTMLElement) {
        slider.focus();
      }
    }
  }, []);

  const handleScoreChange = useCallback((domain: DomainKey, value: number) => {
    const score = clampScore(value);
    setDomains((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        score,
      },
    }));
  }, []);

  const handleAssessmentChange = useCallback(
    (domain: DomainKey, assessment: string) => {
      setDomains((prev) => ({
        ...prev,
        [domain]: {
          ...prev[domain],
          assessment,
        },
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const data: LifeMap = { domains };
      await onSave(data);
      setSaveSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [domains, onSave]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Prepare data for preview chart
  const chartData = DOMAINS.map(({ key, label }) => ({
    domain: label,
    score: domains[key].score,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Status messages for screen readers */}
      <div
        role="status"
        aria-live="polite"
        className={`text-sm ${
          saveError
            ? 'text-destructive'
            : saveSuccess
            ? 'text-green-600'
            : isSaving
            ? 'text-muted-foreground'
            : 'sr-only'
        }`}
      >
        {isSaving && 'Processing your changes...'}
        {saveError && `Error: ${saveError}`}
        {saveSuccess && 'Saved successfully'}
        {!isSaving && !saveError && !saveSuccess && 'Ready'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Editors */}
        <div className="space-y-6">
          {DOMAINS.map(({ key, label }, index) => (
            <div
              key={key}
              className="space-y-3"
              ref={index === 0 ? firstSliderRef : undefined}
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`${key}-assessment`}
                  id={`${key}-label`}
                  className="text-base font-medium capitalize"
                >
                  {label}
                </Label>
                <span className="text-lg font-semibold tabular-nums">
                  {domains[key].score}
                </span>
              </div>

              <DomainSlider
                value={domains[key].score}
                onChange={(value) => handleScoreChange(key, value)}
                min={1}
                max={10}
                step={1}
                aria-label={label}
                aria-labelledby={`${key}-label`}
              />

              <Input
                id={`${key}-assessment`}
                type="text"
                value={domains[key].assessment}
                onChange={(e) => handleAssessmentChange(key, e.target.value)}
                placeholder={`Assessment for ${label.toLowerCase()}...`}
                aria-label={`${label} assessment`}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Preview</Label>
          <div
            data-testid="life-map-preview"
            className="border rounded-lg p-4 bg-muted/30"
          >
            <LifeMapChart data={chartData} height={350} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          aria-label="Cancel"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          aria-label="Save"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
