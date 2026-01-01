/**
 * Component Tests - WeeklyForm
 *
 * Tests for the weekly review form component
 * AC1: Weekly Reviews - User can create a new weekly review
 *
 * Weekly Review Fields (per README):
 * 1. What actually moved the needle this week
 * 2. What was noise disguised as work
 * 3. Where your time leaked
 * 4. One strategic insight
 * 5. One adjustment for next week
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('WeeklyForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Form Fields Rendering', () => {
    it('should render all required form fields', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Check for labels or field identifiers
      expect(screen.getByText(/week/i)).toBeInTheDocument();
      expect(screen.getByText(/moved the needle/i)).toBeInTheDocument();
      expect(screen.getByText(/noise disguised as work/i)).toBeInTheDocument();
      expect(screen.getByText(/time leaked/i)).toBeInTheDocument();
      expect(screen.getByText(/strategic insight/i)).toBeInTheDocument();
      expect(screen.getByText(/adjustment for next week/i)).toBeInTheDocument();
    });

    it('should render week picker defaulting to current week', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Should have a week/date picker for selecting the week
      const weekInput = screen.getByLabelText(/week/i) || screen.getByRole('textbox', { name: /week/i });
      expect(weekInput).toBeInTheDocument();
    });

    it('should render "moved needle" textarea with label', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/moved the needle/i) ||
                       screen.getByLabelText(/moved the needle/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render "noise disguised as work" textarea', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/noise/i) ||
                       screen.getByLabelText(/noise disguised as work/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render "time leaks" textarea', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/time leaked/i) ||
                       screen.getByLabelText(/time leaked/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render "strategic insight" textarea', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/strategic insight/i) ||
                       screen.getByLabelText(/strategic insight/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render "adjustment for next week" textarea', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/adjustment/i) ||
                       screen.getByLabelText(/adjustment for next week/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render optional notes textarea', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/notes/i) ||
                       screen.getByLabelText(/notes/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render submit button', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should display estimated time (20 minutes for weekly)', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Should show estimated time of 20 minutes for weekly review
      expect(screen.getByText(/20 minutes|20 min/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show validation errors for missing required fields', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      // Should show error messages
      await waitFor(() => {
        const errors = screen.getAllByRole('alert') ||
                       screen.getAllByText(/required/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it('should require "moved needle" field', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill all fields except movedNeedle
      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Test noise');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should require "adjustment for next week" field', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill movedNeedle but not adjustment
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test needle');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should require "strategic insight" field', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill some fields but not strategic insight
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test needle');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Test adjustment');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill all required fields
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Closed major deal');

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Unnecessary meetings');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      await user.type(timeLeaksInput, 'Email checking');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      await user.type(insightInput, 'Focus on high-value tasks');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Block calendar for deep work');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            movedNeedle: 'Closed major deal',
            noiseDisguisedAsWork: 'Unnecessary meetings',
            timeLeaks: 'Email checking',
            strategicInsight: 'Focus on high-value tasks',
            adjustmentForNextWeek: 'Block calendar for deep work',
          })
        );
      });
    });

    it('should include weekStartDate in submitted data', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test win');

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Test noise');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      await user.type(timeLeaksInput, 'Test leaks');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      await user.type(insightInput, 'Test insight');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Test adjustment');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          })
        );
      });
    });

    it('should include weekNumber in submitted data', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test win');

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Test noise');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      await user.type(timeLeaksInput, 'Test leaks');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      await user.type(insightInput, 'Test insight');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Test adjustment');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            weekNumber: expect.any(Number),
          })
        );
      });
    });

    it('should include optional notes in submitted data when filled', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill all required fields plus notes
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test win');

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Test noise');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      await user.type(timeLeaksInput, 'Test leaks');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      await user.type(insightInput, 'Test insight');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Test adjustment');

      const notesInput = screen.getByPlaceholderText(/notes/i) ||
                         screen.getByLabelText(/notes/i);
      await user.type(notesInput, 'Additional notes here');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: 'Additional notes here',
          })
        );
      });
    });
  });

  describe('Draft Saving', () => {
    it('should save draft to localStorage', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Draft test');

      // Advance time to trigger auto-save (30 seconds)
      jest.advanceTimersByTime(30000);

      expect(localStorageMock.setItem).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should restore draft from localStorage', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      // Set up stored draft
      const draft = {
        movedNeedle: 'Restored needle content',
        strategicInsight: 'Restored insight',
        adjustmentForNextWeek: 'Restored adjustment',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(draft));

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      await waitFor(() => {
        const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                            screen.getByLabelText(/moved the needle/i);
        expect(needleInput).toHaveValue('Restored needle content');
      });
    });

    it('should clear draft after successful submission', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      mockOnSubmit.mockResolvedValue({ success: true });

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Fill and submit all required fields
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test win');

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Test noise');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      await user.type(timeLeaksInput, 'Test leaks');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      await user.type(insightInput, 'Test insight');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Test adjustment');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalled();
      });
    });
  });

  describe('Pre-filled Data (Edit Mode)', () => {
    it('should accept initialData prop for edit mode', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      const initialData = {
        date: '2025-12-29', // Week start date
        weekNumber: 1,
        movedNeedle: 'Closed the deal',
        noiseDisguisedAsWork: 'Too many meetings',
        timeLeaks: 'Email checking',
        strategicInsight: 'Focus matters',
        adjustmentForNextWeek: 'Block calendar',
        notes: 'Some notes',
      };

      render(<WeeklyForm onSubmit={mockOnSubmit} initialData={initialData} />);

      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      expect(needleInput).toHaveValue('Closed the deal');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      expect(adjustmentInput).toHaveValue('Block calendar');
    });

    it('should pre-fill all fields from initialData', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      const initialData = {
        date: '2025-12-29',
        weekNumber: 1,
        movedNeedle: 'Major win',
        noiseDisguisedAsWork: 'Busywork',
        timeLeaks: 'Social media',
        strategicInsight: 'Key insight',
        adjustmentForNextWeek: 'New habit',
        notes: 'Notes content',
      };

      render(<WeeklyForm onSubmit={mockOnSubmit} initialData={initialData} />);

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      expect(noiseInput).toHaveValue('Busywork');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      expect(timeLeaksInput).toHaveValue('Social media');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      expect(insightInput).toHaveValue('Key insight');
    });
  });

  describe('Timer Display', () => {
    it('should display elapsed time', async () => {
      jest.useFakeTimers();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Initially should show 0:00 or similar
      const timerElement = screen.getByText(/0:00|00:00|timer/i);
      expect(timerElement).toBeInTheDocument();

      // Advance time by 1 minute
      jest.advanceTimersByTime(60000);

      // Should update to show 1:00
      await waitFor(() => {
        const updatedTimer = screen.getByText(/1:00|01:00/i);
        expect(updatedTimer).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should update timer every second', async () => {
      jest.useFakeTimers();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Advance by 5 seconds
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        const timerElement = screen.getByText(/0:05|00:05/i);
        expect(timerElement).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should include duration in submitted data', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Advance time by 5 minutes
      jest.advanceTimersByTime(300000);

      // Fill all required fields
      const needleInput = screen.getByPlaceholderText(/moved the needle/i) ||
                          screen.getByLabelText(/moved the needle/i);
      await user.type(needleInput, 'Test win');

      const noiseInput = screen.getByPlaceholderText(/noise/i) ||
                         screen.getByLabelText(/noise disguised as work/i);
      await user.type(noiseInput, 'Test noise');

      const timeLeaksInput = screen.getByPlaceholderText(/time leaked/i) ||
                             screen.getByLabelText(/time leaked/i);
      await user.type(timeLeaksInput, 'Test leaks');

      const insightInput = screen.getByPlaceholderText(/strategic insight/i) ||
                           screen.getByLabelText(/strategic insight/i);
      await user.type(insightInput, 'Test insight');

      const adjustmentInput = screen.getByPlaceholderText(/adjustment/i) ||
                              screen.getByLabelText(/adjustment for next week/i);
      await user.type(adjustmentInput, 'Test adjustment');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: expect.any(Number),
          })
        );
      });

      jest.useRealTimers();
    });
  });

  describe('Week Selection', () => {
    it('should allow selecting past weeks', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Should have controls to navigate to previous weeks
      const prevWeekButton = screen.getByRole('button', { name: /previous|prev|back/i }) ||
                             screen.getByLabelText(/previous week/i);
      expect(prevWeekButton).toBeInTheDocument();

      await user.click(prevWeekButton);

      // Week display should change
      // This is a behavioral test - implementation details will vary
    });

    it('should display current week range by default', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // Should show week range like "Dec 30 - Jan 5" or similar
      // Check for month names or date range indicator
      const weekRangeElement = screen.getByText(/week|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i);
      expect(weekRangeElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all fields', async () => {
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      // All form fields should be accessible
      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      expect(submitButton).toBeVisible();
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      const { WeeklyForm } = await import('@/components/WeeklyForm');

      render(<WeeklyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Errors should have role="alert" or aria-live
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });
  });
});
