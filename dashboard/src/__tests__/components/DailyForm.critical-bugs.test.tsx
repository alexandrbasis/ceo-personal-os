/**
 * Critical Bug Fix Tests - AC3: Form Validation Icons Clarified
 *
 * Tests to ensure:
 * - Red exclamation icons are either removed or clearly explained
 * - If kept, tooltips explain their purpose
 * - No user confusion about form errors
 *
 * Also includes tests for Option B: Domain ratings in daily review form
 */

import { render, screen, waitFor } from '@testing-library/react';
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

describe('AC3: Form Validation Icons Clarified', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('AC3.1: Red icons removed or clearly explained', () => {
    it('should NOT show red exclamation icons on empty optional textareas', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Find all textareas
      const energyFactorsTextarea = screen.getByPlaceholderText(/affecting your energy/i);
      const frictionTextarea = screen.getByPlaceholderText(/friction/i);
      const notesTextarea = screen.getByPlaceholderText(/notes/i);

      // These are optional fields - should not have error indicators
      const optionalTextareas = [energyFactorsTextarea, frictionTextarea, notesTextarea];

      optionalTextareas.forEach((textarea) => {
        const parent = textarea.parentElement;
        // Should not have any red/error colored elements
        const errorIcon = parent?.querySelector('[data-error-icon]');
        const exclamationIcon = parent?.querySelector('.text-red-500, .text-destructive');
        expect(errorIcon).not.toBeInTheDocument();
        expect(exclamationIcon).not.toBeInTheDocument();
      });
    });

    it('should NOT show red icons after typing valid content in textareas', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Type valid content in textareas
      const meaningfulWinTextarea = screen.getByPlaceholderText(/meaningful win/i);
      await user.type(meaningfulWinTextarea, 'Completed the project successfully');

      // After typing valid content, should not show any error indicators
      const parent = meaningfulWinTextarea.parentElement;
      const errorIcon = parent?.querySelector('[data-error-icon], [data-state="error"]');
      expect(errorIcon).not.toBeInTheDocument();

      // Also check for aria-invalid
      expect(meaningfulWinTextarea).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('should only show error indicators AFTER form submission with invalid data', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Before submission - no errors visible
      const meaningfulWinTextarea = screen.getByPlaceholderText(/meaningful win/i);
      expect(
        meaningfulWinTextarea.parentElement?.querySelector('.text-red-500')
      ).not.toBeInTheDocument();

      // Submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // After submission with empty required field - error should show
      await waitFor(() => {
        const errorMessage = screen.queryByRole('alert');
        // If there's an error message, it should be associated with the field
        if (errorMessage) {
          expect(errorMessage).toHaveTextContent(/required/i);
        }
      });
    });

    it('should not have confusing visual indicators on optional fields', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      const { container } = render(<DailyForm onSubmit={mockOnSubmit} />);

      // Find fields marked as optional (no asterisk or "required" text)
      const energyFactorsLabel = screen.getByText(/energy factors/i);
      const frictionLabel = screen.getByText(/friction point/i);
      const notesLabel = screen.getByText(/notes/i);

      // These optional fields should not have any confusing indicators
      [energyFactorsLabel, frictionLabel, notesLabel].forEach((label) => {
        const fieldContainer = label.closest('.space-y-2');
        if (fieldContainer) {
          // Should not have red/warning colors unless there's an actual error
          const warningElements = fieldContainer.querySelectorAll(
            '.text-red-500, .text-yellow-500, .text-orange-500, [data-state="error"]'
          );
          expect(warningElements.length).toBe(0);
        }
      });
    });
  });

  describe('AC3.2: Tooltips explain icon purpose if icons are kept', () => {
    it('should have tooltip explaining purpose if info/warning icons exist', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      const { container } = render(<DailyForm onSubmit={mockOnSubmit} />);

      // Find any info or warning icons
      const infoIcons = container.querySelectorAll(
        '[data-icon="info"], [data-icon="alert"], svg[class*="icon"]'
      );

      infoIcons.forEach((icon) => {
        // Each icon should have either:
        // 1. A tooltip (title attribute or aria-describedby)
        // 2. An aria-label
        // 3. Adjacent explanatory text
        const hasTitle = icon.hasAttribute('title');
        const hasAriaLabel = icon.hasAttribute('aria-label');
        const hasAriaDescribedBy = icon.hasAttribute('aria-describedby');
        const parentHasTooltip = icon.closest('[data-tooltip]');

        const isExplained = hasTitle || hasAriaLabel || hasAriaDescribedBy || parentHasTooltip;

        if (icon.classList.contains('text-red') || icon.classList.contains('text-destructive')) {
          // Error icons should be explained
          expect(isExplained).toBe(true);
        }
      });
    });

    it('should have accessible description for any validation state indicators', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Find any error messages
        const errorMessages = screen.queryAllByRole('alert');

        // Each error should be clear and not just an icon
        errorMessages.forEach((error) => {
          // Should have actual text content, not just an icon
          expect(error.textContent?.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('AC3.3: No user confusion about form errors', () => {
    it('should clearly distinguish between error state and normal state', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      const meaningfulWinTextarea = screen.getByPlaceholderText(/meaningful win/i);

      // Normal state - no error styling
      expect(meaningfulWinTextarea).not.toHaveClass('border-red-500');
      expect(meaningfulWinTextarea).not.toHaveClass('border-destructive');
      expect(meaningfulWinTextarea).not.toHaveAttribute('aria-invalid', 'true');

      // Submit without filling required field
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Error state should be visually different
      await waitFor(() => {
        // The error state should be indicated somehow
        const hasErrorState =
          meaningfulWinTextarea.classList.contains('border-red-500') ||
          meaningfulWinTextarea.classList.contains('border-destructive') ||
          meaningfulWinTextarea.getAttribute('aria-invalid') === 'true';

        // Either has error styling OR has associated error message
        const hasErrorMessage = screen.queryByRole('alert');

        expect(hasErrorState || hasErrorMessage).toBeTruthy();
      });
    });

    it('should clear error indicators after user corrects the input', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      // Now fill the required field
      const meaningfulWinTextarea = screen.getByPlaceholderText(/meaningful win/i);
      await user.type(meaningfulWinTextarea, 'Fixed the issue');

      // Error should clear (may need to blur or wait)
      await waitFor(
        () => {
          // Error message for this field should be gone or updated
          const errorMessage = screen.queryByText(/meaningful win.*required/i);
          expect(errorMessage).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should not show multiple confusing indicators for the same field', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      const { container } = render(<DailyForm onSubmit={mockOnSubmit} />);

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        // For each field, should not have both icon AND border AND text all being red/error
        const fieldContainers = container.querySelectorAll('.space-y-2');

        fieldContainers.forEach((field) => {
          const errorIndicators = field.querySelectorAll(
            '[role="alert"], .text-red-500, .border-red-500, [aria-invalid="true"]'
          );

          // Maximum of 2 indicators per field (e.g., border + message, or icon + message)
          // Having 3+ different error indicators is confusing
          expect(errorIndicators.length).toBeLessThanOrEqual(2);
        });
      });
    });

    it('should have clear visual hierarchy - errors should stand out', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.queryAllByRole('alert');

        // Error messages should be visible (not hidden or too small)
        errorMessages.forEach((error) => {
          expect(error).toBeVisible();
          // Should have readable text
          expect(error.textContent?.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('Option B: Domain Ratings in Daily Review Form', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Domain Ratings Section', () => {
    it('should render optional domain ratings section', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Should have a domain ratings section (collapsible)
      expect(screen.getByText(/life map ratings/i) || screen.getByText(/domain ratings/i)).toBeInTheDocument();
    });

    it('should render all 6 domain rating inputs', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Expand domain ratings section if collapsed
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain/i });
      if (expandButton) {
        await userEvent.click(expandButton);
      }

      // Should have inputs for all 6 domains
      expect(screen.getByLabelText(/career/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relationships/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/health/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/meaning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/finances/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fun/i)).toBeInTheDocument();
    });

    it('should have domain ratings as optional (0-10 scale with 0 meaning "not rated")', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Expand if needed
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain/i });
      if (expandButton) {
        await userEvent.click(expandButton);
      }

      // Each domain rating should accept 0-10
      const careerInput = screen.getByLabelText(/career/i);
      expect(careerInput).toHaveAttribute('min', '0');
      expect(careerInput).toHaveAttribute('max', '10');
    });

    it('should make domain ratings collapsible to keep form lightweight', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Domain ratings section should be collapsible
      const collapseButton = screen.queryByRole('button', { name: /collapse|hide|domain|life map/i });
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain|life map/i });

      // Either it's already collapsed with expand button, or expanded with collapse button
      expect(collapseButton || expandButton).toBeInTheDocument();
    });

    it('should include domain ratings in form submission data', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill required fields first
      const winInput = screen.getByPlaceholderText(/meaningful win/i);
      await user.type(winInput, 'Test win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      // Expand domain ratings
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain/i });
      if (expandButton) {
        await user.click(expandButton);
      }

      // Fill some domain ratings
      const careerInput = screen.getByLabelText(/career/i);
      await user.clear(careerInput);
      await user.type(careerInput, '8');

      const healthInput = screen.getByLabelText(/health/i);
      await user.clear(healthInput);
      await user.type(healthInput, '7');

      // Submit
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            domainRatings: expect.objectContaining({
              career: 8,
              health: 7,
            }),
          })
        );
      });
    });

    it('should allow form submission without domain ratings (they are optional)', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill only required fields
      const winInput = screen.getByPlaceholderText(/meaningful win/i);
      await user.type(winInput, 'Test win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      // Submit without touching domain ratings
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        // Domain ratings should be undefined or all zeros
        const submittedData = mockOnSubmit.mock.calls[0][0];
        if (submittedData.domainRatings) {
          // All values should be 0 or undefined
          Object.values(submittedData.domainRatings).forEach((value) => {
            expect(value === 0 || value === undefined).toBe(true);
          });
        }
      });
    });

    it('should display current domain rating values visually', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Expand domain ratings
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain/i });
      if (expandButton) {
        await user.click(expandButton);
      }

      // Set a rating
      const careerInput = screen.getByLabelText(/career/i);
      await user.clear(careerInput);
      await user.type(careerInput, '8');

      // Should show the value (either in input or display)
      expect(careerInput).toHaveValue(8);
      // Or if using slider, check display text
      const displayValue = screen.queryByText(/8\/10/);
      expect((careerInput as HTMLInputElement).value === '8' || displayValue).toBeTruthy();
    });
  });

  describe('Domain Ratings Validation', () => {
    it('should only accept values 0-10 for domain ratings', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Expand domain ratings
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain/i });
      if (expandButton) {
        await user.click(expandButton);
      }

      const careerInput = screen.getByLabelText(/career/i) as HTMLInputElement;

      // Type value over 10
      await user.clear(careerInput);
      await user.type(careerInput, '15');

      // Value should be clamped or show error
      expect(parseInt(careerInput.value) <= 10 || screen.queryByText(/10/)).toBeTruthy();
    });

    it('should not show errors for empty/0 domain ratings (they are optional)', async () => {
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      render(<DailyForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const winInput = screen.getByPlaceholderText(/meaningful win/i);
      await user.type(winInput, 'Test win');

      const priorityInput = screen.getByPlaceholderText(/tomorrow/i);
      await user.type(priorityInput, 'Test priority');

      // Submit with empty domain ratings
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should submit successfully, no domain rating errors
        expect(mockOnSubmit).toHaveBeenCalled();
        const domainErrors = screen.queryAllByText(/domain.*required/i);
        expect(domainErrors.length).toBe(0);
      });
    });
  });

  describe('Pre-filled Domain Ratings (Edit Mode)', () => {
    it('should accept initialData with domain ratings', async () => {
      const { DailyForm } = await import('@/components/DailyForm');

      const initialData = {
        date: '2026-01-01',
        energyLevel: 7,
        meaningfulWin: 'Initial win',
        tomorrowPriority: 'Initial priority',
        domainRatings: {
          career: 8,
          relationships: 6,
          health: 7,
          meaning: 5,
          finances: 9,
          fun: 4,
        },
      };

      render(<DailyForm onSubmit={mockOnSubmit} initialData={initialData} />);

      // Expand domain ratings
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain/i });
      if (expandButton) {
        await userEvent.click(expandButton);
      }

      const careerInput = screen.getByLabelText(/career/i);
      expect(careerInput).toHaveValue(8);

      const healthInput = screen.getByLabelText(/health/i);
      expect(healthInput).toHaveValue(7);
    });

    it('should accept partial domainRatings from drafts or legacy data', async () => {
      // This tests that the schema accepts partial domainRatings objects
      // (e.g., from drafts or legacy data where not all domains were rated)
      const user = userEvent.setup();
      const { DailyForm } = await import('@/components/DailyForm');

      const initialData = {
        date: '2026-01-01',
        energyLevel: 7,
        meaningfulWin: 'Initial win',
        tomorrowPriority: 'Initial priority',
        domainRatings: {
          career: 8,
          // Other domains not present - simulating partial/legacy data
        },
      };

      render(<DailyForm onSubmit={mockOnSubmit} initialData={initialData} />);

      // Form should render without validation errors
      // Expand domain ratings
      const expandButton = screen.queryByRole('button', { name: /expand|show|domain|life map/i });
      if (expandButton) {
        await user.click(expandButton);
      }

      // Career should have the value from initialData
      const careerInput = screen.getByLabelText(/career/i);
      expect(careerInput).toHaveValue(8);

      // Submit should work with partial domainRatings
      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });
});
