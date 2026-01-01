/**
 * API Route: /api/reviews/weekly
 *
 * GET - List all weekly reviews
 * POST - Create a new weekly review
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { REVIEWS_WEEKLY_PATH } from '@/lib/config';
import {
  parseWeeklyReview,
  serializeWeeklyReview,
} from '@/lib/parsers/weekly-review';
import type { WeeklyReviewFormData, WeeklyReviewListItem } from '@/lib/types';

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Validate WeeklyReviewFormData
 */
function validateFormData(
  data: unknown
): { valid: true; data: WeeklyReviewFormData } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const formData = data as Record<string, unknown>;

  // Check required fields
  if (!formData.date || typeof formData.date !== 'string') {
    return { valid: false, error: 'Missing or invalid date field' };
  }

  if (!isValidDateFormat(formData.date)) {
    return { valid: false, error: 'Invalid date format. Expected YYYY-MM-DD' };
  }

  if (formData.weekNumber === undefined || typeof formData.weekNumber !== 'number') {
    return { valid: false, error: 'Missing or invalid weekNumber field' };
  }

  if (formData.weekNumber < 1 || formData.weekNumber > 53) {
    return { valid: false, error: 'weekNumber must be between 1 and 53' };
  }

  if (!formData.movedNeedle || typeof formData.movedNeedle !== 'string') {
    return { valid: false, error: 'Missing or invalid movedNeedle field' };
  }

  if (!formData.noiseDisguisedAsWork || typeof formData.noiseDisguisedAsWork !== 'string') {
    return { valid: false, error: 'Missing or invalid noiseDisguisedAsWork field' };
  }

  if (!formData.timeLeaks || typeof formData.timeLeaks !== 'string') {
    return { valid: false, error: 'Missing or invalid timeLeaks field' };
  }

  if (!formData.strategicInsight || typeof formData.strategicInsight !== 'string') {
    return { valid: false, error: 'Missing or invalid strategicInsight field' };
  }

  if (!formData.adjustmentForNextWeek || typeof formData.adjustmentForNextWeek !== 'string') {
    return { valid: false, error: 'Missing or invalid adjustmentForNextWeek field' };
  }

  return {
    valid: true,
    data: {
      date: formData.date,
      weekNumber: formData.weekNumber,
      movedNeedle: formData.movedNeedle as string,
      noiseDisguisedAsWork: formData.noiseDisguisedAsWork as string,
      timeLeaks: formData.timeLeaks as string,
      strategicInsight: formData.strategicInsight as string,
      adjustmentForNextWeek: formData.adjustmentForNextWeek as string,
      notes: formData.notes as string | undefined,
      duration: formData.duration as number | undefined,
    },
  };
}

/**
 * Check if a filename is a dated review file (YYYY-MM-DD.md)
 */
function isDatedReviewFile(filename: string): boolean {
  return /^\d{4}-\d{2}-\d{2}\.md$/.test(filename);
}

/**
 * GET /api/reviews/weekly
 * Returns a list of all weekly reviews sorted by date descending
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Read directory contents
    let files: string[];
    try {
      files = await fs.readdir(REVIEWS_WEEKLY_PATH);
    } catch {
      // Directory doesn't exist or is empty
      return NextResponse.json({ reviews: [] });
    }

    // Filter to only dated markdown files
    const reviewFiles = files.filter(isDatedReviewFile);

    // Parse each file and collect review list items
    const reviews: WeeklyReviewListItem[] = [];

    for (const filename of reviewFiles) {
      const filePath = path.join(REVIEWS_WEEKLY_PATH, filename);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = parseWeeklyReview(content, filePath);

        reviews.push({
          date: parsed.date || filename.replace('.md', ''),
          weekNumber: parsed.weekNumber || 0,
          movedNeedle: parsed.movedNeedle || '',
          filePath,
          type: 'weekly',
        });
      } catch {
        // Skip files that can't be read
        continue;
      }
    }

    // Sort by date descending
    reviews.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json(
      { error: 'Failed to list reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews/weekly
 * Creates a new weekly review file
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = validateFormData(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const formData = validation.data;
    const filename = `${formData.date}.md`;
    const filePath = path.join(REVIEWS_WEEKLY_PATH, filename);

    // Check if file already exists
    try {
      await fs.access(filePath);
      // File exists - return conflict
      return NextResponse.json(
        { success: false, error: `Review for ${formData.date} already exists` },
        { status: 409 }
      );
    } catch {
      // File doesn't exist - proceed with creation
    }

    // Ensure directory exists
    await fs.mkdir(REVIEWS_WEEKLY_PATH, { recursive: true });

    // Serialize and write the file
    const content = serializeWeeklyReview(formData);
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ success: true, filePath }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
