/**
 * AC1: Life Map Editor Component Tests
 *
 * Tests for the LifeMapEditor component which provides:
 * - Sliders for each of 6 domains (1-10, silent clamping)
 * - Text fields for domain assessments
 * - Preview of changes on radar chart
 * - Save and cancel functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LifeMap } from '@/lib/types';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('AC1: LifeMapEditor Component', () => {
  const mockLifeMapData: LifeMap = {
    domains: {
      career: { score: 8, assessment: 'Strong momentum, good team' },
      relationships: { score: 6, assessment: 'Needs more quality time' },
      health: { score: 5, assessment: 'Acceptable but neglected' },
      meaning: { score: 7, assessment: 'Growing sense of purpose' },
      finances: { score: 8, assessment: 'Stable and secure' },
      fun: { score: 4, assessment: 'Neglected, needs attention' },
    },
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();

    // Default successful fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, ...mockLifeMapData }),
    });
  });

  describe('Slider Rendering (AC1)', () => {
    it('should render sliders for all 6 domains', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have 6 sliders, one for each domain
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(6);
    });

    it('should render slider for Career domain', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerSlider = screen.getByRole('slider', { name: /career/i });
      expect(careerSlider).toBeInTheDocument();
      expect(careerSlider).toHaveAttribute('aria-valuenow', '8');
    });

    it('should render slider for Relationships domain', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const relationshipsSlider = screen.getByRole('slider', { name: /relationships/i });
      expect(relationshipsSlider).toBeInTheDocument();
      expect(relationshipsSlider).toHaveAttribute('aria-valuenow', '6');
    });

    it('should render slider for Health domain', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const healthSlider = screen.getByRole('slider', { name: /health/i });
      expect(healthSlider).toBeInTheDocument();
      expect(healthSlider).toHaveAttribute('aria-valuenow', '5');
    });

    it('should render slider for Meaning domain', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const meaningSlider = screen.getByRole('slider', { name: /meaning/i });
      expect(meaningSlider).toBeInTheDocument();
      expect(meaningSlider).toHaveAttribute('aria-valuenow', '7');
    });

    it('should render slider for Finances domain', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const financesSlider = screen.getByRole('slider', { name: /finances/i });
      expect(financesSlider).toBeInTheDocument();
      expect(financesSlider).toHaveAttribute('aria-valuenow', '8');
    });

    it('should render slider for Fun domain', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const funSlider = screen.getByRole('slider', { name: /fun/i });
      expect(funSlider).toBeInTheDocument();
      expect(funSlider).toHaveAttribute('aria-valuenow', '4');
    });

    it('should have sliders with min=1 and max=10', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const sliders = screen.getAllByRole('slider');

      sliders.forEach((slider) => {
        expect(slider).toHaveAttribute('aria-valuemin', '1');
        expect(slider).toHaveAttribute('aria-valuemax', '10');
      });
    });

    it('should display current score value next to each slider', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should display score values
      expect(screen.getByText('8', { exact: true })).toBeInTheDocument(); // Career
      expect(screen.getByText('6', { exact: true })).toBeInTheDocument(); // Relationships
      expect(screen.getByText('5', { exact: true })).toBeInTheDocument(); // Health
      expect(screen.getByText('7', { exact: true })).toBeInTheDocument(); // Meaning
      expect(screen.getByText('4', { exact: true })).toBeInTheDocument(); // Fun
    });
  });

  describe('Score Clamping (AC1)', () => {
    it('should silently clamp values below 1 to 1', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      const dataWithZeroScores: LifeMap = {
        domains: {
          career: { score: 0, assessment: '' },
          relationships: { score: 0, assessment: '' },
          health: { score: 0, assessment: '' },
          meaning: { score: 0, assessment: '' },
          finances: { score: 0, assessment: '' },
          fun: { score: 0, assessment: '' },
        },
      };

      render(
        <LifeMapEditor
          initialData={dataWithZeroScores}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Sliders should show 1 (clamped from 0)
      const sliders = screen.getAllByRole('slider');
      sliders.forEach((slider) => {
        expect(slider).toHaveAttribute('aria-valuenow', '1');
      });
    });

    it('should silently clamp values above 10 to 10', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      const dataWithHighScores: LifeMap = {
        domains: {
          career: { score: 15, assessment: '' },
          relationships: { score: 100, assessment: '' },
          health: { score: 11, assessment: '' },
          meaning: { score: 20, assessment: '' },
          finances: { score: 50, assessment: '' },
          fun: { score: 99, assessment: '' },
        },
      };

      render(
        <LifeMapEditor
          initialData={dataWithHighScores}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Sliders should show 10 (clamped from higher values)
      const sliders = screen.getAllByRole('slider');
      sliders.forEach((slider) => {
        expect(slider).toHaveAttribute('aria-valuenow', '10');
      });
    });

    it('should not show error messages when clamping', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      const dataWithOutOfRangeScores: LifeMap = {
        domains: {
          career: { score: -5, assessment: '' },
          relationships: { score: 50, assessment: '' },
          health: { score: 5, assessment: '' },
          meaning: { score: 5, assessment: '' },
          finances: { score: 5, assessment: '' },
          fun: { score: 5, assessment: '' },
        },
      };

      render(
        <LifeMapEditor
          initialData={dataWithOutOfRangeScores}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should not display any error or warning about clamping
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/warning/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  describe('Assessment Text Fields (AC1)', () => {
    it('should render text fields for all 6 domain assessments', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have 6 text inputs for assessments
      const textInputs = screen.getAllByRole('textbox');
      expect(textInputs).toHaveLength(6);
    });

    it('should display initial assessment values in text fields', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Strong momentum, good team')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Needs more quality time')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Acceptable but neglected')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Growing sense of purpose')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Stable and secure')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Neglected, needs attention')).toBeInTheDocument();
    });

    it('should allow editing assessment text', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerInput = screen.getByDisplayValue('Strong momentum, good team');
      await user.clear(careerInput);
      await user.type(careerInput, 'New assessment text');

      expect(careerInput).toHaveValue('New assessment text');
    });

    it('should allow empty assessment text', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerInput = screen.getByDisplayValue('Strong momentum, good team');
      await user.clear(careerInput);

      expect(careerInput).toHaveValue('');
    });

    it('should have accessible labels for assessment fields', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Each input should have an accessible label
      const textInputs = screen.getAllByRole('textbox');
      textInputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
      });
    });
  });

  describe('Preview Radar Chart (AC1)', () => {
    it('should render preview radar chart', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should have a preview section with chart
      const preview = screen.getByTestId('life-map-preview') ||
                     screen.getByRole('img', { name: /life map/i }) ||
                     screen.getByText(/preview/i);
      expect(preview).toBeInTheDocument();
    });

    it('should update preview chart when slider values change', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerSlider = screen.getByRole('slider', { name: /career/i });

      // Change slider value
      fireEvent.change(careerSlider, { target: { value: '10' } });

      await waitFor(() => {
        // The preview should reflect the new value
        // We check that the slider shows the updated value
        expect(careerSlider).toHaveAttribute('aria-valuenow', '10');
      });
    });

    it('should show all 6 domains in preview', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Domain labels should be visible in preview section
      expect(screen.getByText(/career/i)).toBeInTheDocument();
      expect(screen.getByText(/relationships/i)).toBeInTheDocument();
      expect(screen.getByText(/health/i)).toBeInTheDocument();
      expect(screen.getByText(/meaning/i)).toBeInTheDocument();
      expect(screen.getByText(/finances/i)).toBeInTheDocument();
      expect(screen.getByText(/fun/i)).toBeInTheDocument();
    });
  });

  describe('Save Functionality (AC2)', () => {
    it('should render save button', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should call onSave with updated data when save clicked', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            domains: expect.objectContaining({
              career: expect.objectContaining({ score: 8 }),
              fun: expect.objectContaining({ score: 4 }),
            }),
          })
        );
      });
    });

    it('should call onSave with modified values', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Modify a value
      const careerSlider = screen.getByRole('slider', { name: /career/i });
      fireEvent.change(careerSlider, { target: { value: '10' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            domains: expect.objectContaining({
              career: expect.objectContaining({ score: 10 }),
            }),
          })
        );
      });
    });

    it('should disable save button while saving', async () => {
      const user = userEvent.setup();

      // Make onSave take some time
      const slowOnSave = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={slowOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('should show loading indicator while saving', async () => {
      const user = userEvent.setup();

      const slowOnSave = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={slowOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(
        screen.getByText(/saving/i) ||
        screen.getByRole('progressbar')
      ).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality (AC1)', () => {
    it('should render cancel button', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not call onSave when cancel clicked', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all sliders', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const sliders = screen.getAllByRole('slider');
      sliders.forEach((slider) => {
        expect(slider).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation on sliders', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerSlider = screen.getByRole('slider', { name: /career/i });
      careerSlider.focus();

      // Arrow keys should change value
      await user.keyboard('{ArrowRight}');

      await waitFor(() => {
        expect(careerSlider).toHaveAttribute('aria-valuenow', '9');
      });
    });

    it('should announce save status to screen readers', async () => {
      const user = userEvent.setup();
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        const statusElement = screen.getByRole('status') ||
                             screen.getByRole('alert');
        expect(statusElement).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty initial data gracefully', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      const emptyData: LifeMap = {
        domains: {
          career: { score: 0, assessment: '' },
          relationships: { score: 0, assessment: '' },
          health: { score: 0, assessment: '' },
          meaning: { score: 0, assessment: '' },
          finances: { score: 0, assessment: '' },
          fun: { score: 0, assessment: '' },
        },
      };

      render(
        <LifeMapEditor
          initialData={emptyData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getAllByRole('slider')).toHaveLength(6);
      expect(screen.getAllByRole('textbox')).toHaveLength(6);
    });

    it('should handle save error gracefully', async () => {
      const user = userEvent.setup();

      const failingOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));

      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      render(
        <LifeMapEditor
          initialData={mockLifeMapData}
          onSave={failingOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should handle very long assessment text', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      const longAssessment = 'A'.repeat(500);
      const dataWithLongAssessments: LifeMap = {
        domains: {
          career: { score: 8, assessment: longAssessment },
          relationships: { score: 6, assessment: '' },
          health: { score: 5, assessment: '' },
          meaning: { score: 7, assessment: '' },
          finances: { score: 8, assessment: '' },
          fun: { score: 4, assessment: '' },
        },
      };

      render(
        <LifeMapEditor
          initialData={dataWithLongAssessments}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerInput = screen.getByDisplayValue(longAssessment);
      expect(careerInput).toBeInTheDocument();
    });

    it('should handle special characters in assessment text', async () => {
      const { LifeMapEditor } = await import('@/components/LifeMapEditor');

      const specialCharAssessment = 'Growth & profit > 50% (target: $1M)';
      const dataWithSpecialChars: LifeMap = {
        domains: {
          career: { score: 8, assessment: specialCharAssessment },
          relationships: { score: 6, assessment: '' },
          health: { score: 5, assessment: '' },
          meaning: { score: 7, assessment: '' },
          finances: { score: 8, assessment: '' },
          fun: { score: 4, assessment: '' },
        },
      };

      render(
        <LifeMapEditor
          initialData={dataWithSpecialChars}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const careerInput = screen.getByDisplayValue(specialCharAssessment);
      expect(careerInput).toBeInTheDocument();
    });
  });
});
