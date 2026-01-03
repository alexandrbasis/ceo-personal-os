/**
 * API Route: /api/reviews
 *
 * GET - List all reviews (aggregated daily + weekly)
 * Supports query parameters:
 *   - type: 'all' | 'daily' | 'weekly' (default: 'all')
 *   - sort: 'desc' | 'asc' (default: 'desc')
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { REVIEWS_DAILY_PATH, REVIEWS_WEEKLY_PATH } from '@/lib/config';
import { parseDailyReview } from '@/lib/parsers/daily-review';
import { parseWeeklyReview } from '@/lib/parsers/weekly-review';

type ReviewType = 'all' | 'daily' | 'weekly';
type SortOrder = 'desc' | 'asc';

const VALID_TYPES: ReviewType[] = ['all', 'daily', 'weekly'];
const VALID_SORTS: SortOrder[] = ['desc', 'asc'];

/**
 * Check if a filename is a dated review file (YYYY-MM-DD.md)
 */
function isDatedReviewFile(filename: string): boolean {
  return /^\d{4}-\d{2}-\d{2}\.md$/.test(filename);
}

interface DailyReviewItem {
  date: string;
  type: 'daily';
  energyLevel: number;
  tomorrowPriority: string;
  filePath: string;
}

interface WeeklyReviewItem {
  date: string;
  type: 'weekly';
  weekNumber: number;
  movedNeedle: string;
  filePath: string;
}

type AggregatedReviewItem = DailyReviewItem | WeeklyReviewItem;

/**
 * Read daily reviews from directory
 */
async function readDailyReviews(): Promise<DailyReviewItem[]> {
  const reviews: DailyReviewItem[] = [];

  let files: string[];
  try {
    files = await fs.readdir(REVIEWS_DAILY_PATH);
  } catch {
    return reviews;
  }

  const reviewFiles = files.filter(isDatedReviewFile);

  for (const filename of reviewFiles) {
    const filePath = path.join(REVIEWS_DAILY_PATH, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = parseDailyReview(content, filePath);

      reviews.push({
        date: parsed.date || filename.replace('.md', ''),
        type: 'daily',
        energyLevel: parsed.energyLevel || 0,
        tomorrowPriority: parsed.tomorrowPriority || '',
        filePath,
      });
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  return reviews;
}

/**
 * Read weekly reviews from directory
 */
async function readWeeklyReviews(): Promise<WeeklyReviewItem[]> {
  const reviews: WeeklyReviewItem[] = [];

  let files: string[];
  try {
    files = await fs.readdir(REVIEWS_WEEKLY_PATH);
  } catch {
    return reviews;
  }

  const reviewFiles = files.filter(isDatedReviewFile);

  for (const filename of reviewFiles) {
    const filePath = path.join(REVIEWS_WEEKLY_PATH, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = parseWeeklyReview(content, filePath);

      reviews.push({
        date: parsed.date || filename.replace('.md', ''),
        type: 'weekly',
        weekNumber: parsed.weekNumber || 0,
        movedNeedle: parsed.movedNeedle || '',
        filePath,
      });
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  return reviews;
}

/**
 * GET /api/reviews
 * Returns aggregated list of all reviews sorted by date
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type') || 'all';
    const sortParam = searchParams.get('sort') || 'desc';

    // Validate type parameter
    if (!VALID_TYPES.includes(typeParam as ReviewType)) {
      return NextResponse.json(
        { error: `Invalid type parameter. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate sort parameter
    if (!VALID_SORTS.includes(sortParam as SortOrder)) {
      return NextResponse.json(
        { error: `Invalid sort parameter. Must be one of: ${VALID_SORTS.join(', ')}` },
        { status: 400 }
      );
    }

    const reviewType = typeParam as ReviewType;
    const sortOrder = sortParam as SortOrder;

    // Collect reviews based on type
    let reviews: AggregatedReviewItem[] = [];

    if (reviewType === 'all' || reviewType === 'daily') {
      const dailyReviews = await readDailyReviews();
      reviews = reviews.concat(dailyReviews);
    }

    if (reviewType === 'all' || reviewType === 'weekly') {
      const weeklyReviews = await readWeeklyReviews();
      reviews = reviews.concat(weeklyReviews);
    }

    // Sort by date
    reviews.sort((a, b) => {
      const comparison = a.date.localeCompare(b.date);
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json(
      { error: 'Failed to list reviews' },
      { status: 500 }
    );
  }
}
