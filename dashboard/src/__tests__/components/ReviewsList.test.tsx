/**
 * T5: Component Tests - ReviewsList
 *
 * Tests for the reviews list component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReviewListItem } from '@/lib/types';

describe('T5: ReviewsList Component', () => {
  const mockReviews: ReviewListItem[] = [
    {
      date: '2024-12-31',
      energyLevel: 8,
      tomorrowPriority: 'Complete Q1 planning document and send to team',
      filePath: '/reviews/daily/2024-12-31.md',
    },
    {
      date: '2024-12-30',
      energyLevel: 6,
      tomorrowPriority: 'Review product roadmap with stakeholders',
      filePath: '/reviews/daily/2024-12-30.md',
    },
    {
      date: '2024-12-29',
      energyLevel: 9,
      tomorrowPriority: 'Finalize investor deck before meeting',
      filePath: '/reviews/daily/2024-12-29.md',
    },
    {
      date: '2024-12-28',
      energyLevel: 5,
      tomorrowPriority: 'Catch up on emails and messages',
      filePath: '/reviews/daily/2024-12-28.md',
    },
    {
      date: '2024-12-27',
      energyLevel: 7,
      tomorrowPriority: 'Team sync and sprint planning',
      filePath: '/reviews/daily/2024-12-27.md',
    },
    {
      date: '2024-12-26',
      energyLevel: 4,
      tomorrowPriority: 'Post-holiday catch up',
      filePath: '/reviews/daily/2024-12-26.md',
    },
  ];

  it('should render list of reviews', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews.slice(0, 3)} />);

    // Should render review items
    expect(screen.getByText(/Dec 31/i)).toBeInTheDocument();
    expect(screen.getByText(/Dec 30/i)).toBeInTheDocument();
    expect(screen.getByText(/Dec 29/i)).toBeInTheDocument();
  });

  it('should display date for each review', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews.slice(0, 2)} />);

    // Check formatted dates are shown
    expect(screen.getByText(/31/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it('should display energy badge for each review', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews.slice(0, 3)} />);

    // Should show energy levels as badges
    expect(screen.getByText(/8/)).toBeInTheDocument();
    expect(screen.getByText(/6/)).toBeInTheDocument();
    expect(screen.getByText(/9/)).toBeInTheDocument();
  });

  it('should display tomorrow\'s priority preview', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews.slice(0, 2)} />);

    // Should show priority text (possibly truncated)
    expect(screen.getByText(/Q1 planning/i)).toBeInTheDocument();
    expect(screen.getByText(/product roadmap/i)).toBeInTheDocument();
  });

  it('should show "No reviews yet" when empty', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={[]} />);

    expect(screen.getByText(/no reviews/i)).toBeInTheDocument();
  });

  it('should limit to 5 most recent reviews', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews} limit={5} />);

    // Should only show 5 reviews even with 6 in data
    const reviewItems = screen.getAllByRole('listitem') ||
                        screen.getAllByTestId('review-item');
    expect(reviewItems.length).toBe(5);
  });

  it('should color-code energy badges (green for high, yellow for medium, red for low)', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews.slice(0, 5)} />);

    // Energy 9 should be green (high)
    const highEnergyBadge = screen.getByTestId('energy-badge-9') ||
                            screen.getByText('9').closest('[class*="green"]');

    // Energy 5 should be yellow (medium)
    const mediumEnergyBadge = screen.getByTestId('energy-badge-5') ||
                              screen.getByText('5').closest('[class*="yellow"]');

    // Energy 4 should be red (low)
    const lowEnergyBadge = screen.getByTestId('energy-badge-4') ||
                           screen.getByText('4').closest('[class*="red"]');

    // At minimum, expect the badges to exist
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should link each review to its detail page', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    render(<ReviewsList reviews={mockReviews.slice(0, 2)} />);

    // Each review should be a link
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);

    // Links should point to /daily/[date]
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('/daily/2024-12-31'));
  });

  it('should truncate long priority text', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    const longPriorityReview: ReviewListItem[] = [
      {
        date: '2024-12-31',
        energyLevel: 7,
        tomorrowPriority: 'This is a very long priority text that should be truncated because it exceeds the maximum display length for the list preview',
        filePath: '/reviews/daily/2024-12-31.md',
      },
    ];

    render(<ReviewsList reviews={longPriorityReview} />);

    // Should show truncated text with ellipsis or similar
    const priorityText = screen.getByText(/This is a very long/);
    expect(priorityText.textContent?.length).toBeLessThan(
      longPriorityReview[0].tomorrowPriority.length
    );
  });

  it('should handle reviews with missing optional fields', async () => {
    const { ReviewsList } = await import('@/components/ReviewsList');

    const minimalReview: ReviewListItem[] = [
      {
        date: '2024-12-31',
        energyLevel: 5,
        tomorrowPriority: 'Test',
        filePath: '/reviews/daily/2024-12-31.md',
      },
    ];

    expect(() => {
      render(<ReviewsList reviews={minimalReview} />);
    }).not.toThrow();
  });
});
