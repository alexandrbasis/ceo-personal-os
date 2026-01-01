/**
 * T5: Component Tests - DailyForm
 *
 * Tests for the daily review form component
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

describe('T5: DailyForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Form Fields Rendering', () => {
    it('should render all required form fields', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Check for labels or placeholders
      expect(screen.getByText(/date/i)).toBeInTheDocument();
      expect(screen.getByText(/energy level/i)).toBeInTheDocument();
      expect(screen.getByText(/meaningful win/i)).toBeInTheDocument();
      expect(screen.getByText(/friction point/i)).toBeInTheDocument();
      expect(screen.getByText(/thing to let go/i)).toBeInTheDocument();
      expect(screen.getByText(/priority for tomorrow/i)).toBeInTheDocument();
    });

    it('should render date picker defaulting to today', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const today = new Date().toISOString().split('T')[0];
      const dateInput = screen.getByLabelText(/date/i) || screen.getByDisplayValue(today);

      expect(dateInput).toBeInTheDocument();
    });

    it('should render energy level slider (1-10)', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Look for slider element
      const slider = screen.getByRole('slider') || screen.getByLabelText(/energy level/i);
      expect(slider).toBeInTheDocument();
    });

    it('should render energy factors textarea', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/affecting your energy/i) ||
                       screen.getByLabelText(/energy factors/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render meaningful win textarea', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render friction point textarea', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/friction/i) ||
                       screen.getByLabelText(/friction point/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render friction action radio group', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Look for radio options
      const needsAction = screen.getByLabelText(/needs action/i) ||
                          screen.getByText(/needs action/i);
      const acknowledgment = screen.getByLabelText(/acknowledgment/i) ||
                             screen.getByText(/acknowledgment/i);

      expect(needsAction).toBeInTheDocument();
      expect(acknowledgment).toBeInTheDocument();
    });

    it('should render thing to let go textarea', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/let go/i) ||
                       screen.getByLabelText(/thing to let go/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render tomorrow\'s priority textarea', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/tomorrow/i) ||
                       screen.getByLabelText(/priority for tomorrow/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render notes textarea', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/notes/i) ||
                       screen.getByLabelText(/notes/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render submit button', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show validation errors for missing required fields', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      // Should show error messages
      await waitFor(() => {
        const errors = screen.getAllByRole('alert') ||
                       screen.getAllByText(/required/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it('should require meaningful win', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill some fields but not meaningful win
      const priorityInput = screen.getByPlaceholderText(/tomorrow/i) ||
                            screen.getByLabelText(/priority for tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should require tomorrow\'s priority', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill some fields but not tomorrow's priority
      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      await user.type(winInput, 'Test win');

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
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      await user.type(winInput, 'Test meaningful win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i) ||
                            screen.getByLabelText(/priority for tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            meaningfulWin: 'Test meaningful win',
            tomorrowPriority: 'Test priority',
          })
        );
      });
    });

    it('should include date in submitted data', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      await user.type(winInput, 'Test win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i) ||
                            screen.getByLabelText(/priority for tomorrow/i);
      await user.type(priorityInput, 'Test priority');

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

    it('should include energy level in submitted data', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      await user.type(winInput, 'Test win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i) ||
                            screen.getByLabelText(/priority for tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            energyLevel: expect.any(Number),
          })
        );
      });
    });
  });

  describe('Draft Saving', () => {
    it('should save draft to localStorage', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      await user.type(winInput, 'Draft test');

      // Advance time to trigger auto-save (30 seconds)
      jest.advanceTimersByTime(30000);

      expect(localStorageMock.setItem).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should restore draft from localStorage', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      // Set up stored draft
      const draft = {
        meaningfulWin: 'Restored draft win',
        tomorrowPriority: 'Restored priority',
        energyLevel: 7,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(draft));

      render(<DailyForm onSubmit={mockOnSubmit} />);

      await waitFor(() => {
        const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                         screen.getByLabelText(/meaningful win/i);
        expect(winInput).toHaveValue('Restored draft win');
      });
    });

    it('should clear draft after successful submission', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      mockOnSubmit.mockResolvedValue({ success: true });

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill and submit
      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      await user.type(winInput, 'Test win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i) ||
                            screen.getByLabelText(/priority for tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalled();
      });
    });
  });

  describe('Pre-filled Data (Edit Mode)', () => {
    it('should accept initialData prop for edit mode', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      const initialData = {
        date: '2024-12-31',
        energyLevel: 8,
        energyFactors: 'Good sleep',
        meaningfulWin: 'Closed the deal',
        frictionPoint: 'Too many meetings',
        frictionAction: 'address' as const,
        tomorrowPriority: 'Plan Q1',
        notes: 'Some notes',
      };

      render(<DailyForm onSubmit={mockOnSubmit} initialData={initialData} />);

      const winInput = screen.getByPlaceholderText(/meaningful win/i) ||
                       screen.getByLabelText(/meaningful win/i);
      expect(winInput).toHaveValue('Closed the deal');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i) ||
                            screen.getByLabelText(/priority for tomorrow/i);
      expect(priorityInput).toHaveValue('Plan Q1');
    });
  });

  describe('Timer Display', () => {
    it('should display elapsed time', async () => {
      jest.useFakeTimers();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

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
  });
});
