/**
 * Page Tests - Goals Edit Page
 *
 * Tests for /goals/edit/[timeframe] page
 * Verifies save flow, redirect behavior, and error handling
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ timeframe: '1-year' }),
  useRouter: () => ({ push: mockPush }),
}));

// Mock sonner toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

describe('Goals Edit Page', () => {
  const mockGoalContent = `# One-Year Goals

## This Year's Goals

Goal content here.
`;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default: GET returns goal content, no draft
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/draft')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ hasDraft: false }),
        });
      }
      if (url.includes('/api/goals/1-year')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: mockGoalContent,
            metadata: { status: 'on-track' },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Save Flow', () => {
    it('should make a single PUT request when saving', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      // Import dynamically to avoid hoisting issues
      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      // Clear previous fetch calls
      (global.fetch as jest.Mock).mockClear();

      // Set up successful PUT response
      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        if (options?.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Wait for save to complete
      await waitFor(() => {
        const putCalls = (global.fetch as jest.Mock).mock.calls.filter(
          ([_, options]) => options?.method === 'PUT'
        );
        expect(putCalls).toHaveLength(1);
      });
    });

    it('should delete draft after successful save', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockClear();
      (global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        const deleteCalls = (global.fetch as jest.Mock).mock.calls.filter(
          ([_, options]) => options?.method === 'DELETE'
        );
        expect(deleteCalls).toHaveLength(1);
        expect(deleteCalls[0][0]).toContain('/api/goals/1-year/draft');
      });
    });

    it('should show success toast on successful save', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Goals saved successfully!');
      });
    });

    it('should redirect to /goals after successful save', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Wait for save, then advance timer for redirect delay
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(mockPush).toHaveBeenCalledWith('/goals');
    });

    it('should show error toast on save failure', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Server error');
      });
    });

    it('should not redirect on save failure', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Draft Discard Flow', () => {
    it('should delete draft from server when user discards', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      // Mock: draft exists
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/draft') && !url.includes('DELETE')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              hasDraft: true,
              content: '# Draft content',
            }),
          });
        }
        if (url.includes('/api/goals/1-year') && !url.includes('/draft')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              content: mockGoalContent,
              metadata: {},
            }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      });

      const EditGoalsPage = (await import('@/app/goals/edit/[timeframe]/page')).default;

      render(<EditGoalsPage />);

      // Wait for draft prompt
      await waitFor(() => {
        expect(screen.getByText(/draft was found/i)).toBeInTheDocument();
      });

      (global.fetch as jest.Mock).mockClear();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Click "No" (aria-label="Discard") to discard draft
      const discardButton = screen.getByRole('button', { name: /discard/i });
      await user.click(discardButton);

      // Should call DELETE on draft endpoint
      await waitFor(() => {
        const deleteCalls = (global.fetch as jest.Mock).mock.calls.filter(
          ([_, options]) => options?.method === 'DELETE'
        );
        expect(deleteCalls).toHaveLength(1);
        expect(deleteCalls[0][0]).toContain('/api/goals/1-year/draft');
      });
    });
  });
});
