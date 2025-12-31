/**
 * API Route: /api/reviews/daily
 *
 * GET - List all daily reviews
 * POST - Create a new daily review
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { REVIEWS_DAILY_PATH } from '@/lib/config';
import { parseDailyReview, serializeDailyReview } from '@/lib/parsers/daily-review';
import type { DailyReviewFormData, ReviewListItem } from '@/lib/types';

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Validate DailyReviewFormData
 */
function validateFormData(
  data: unknown
): { valid: true; data: DailyReviewFormData } | { valid: false; error: string } {
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

  if (formData.energyLevel === undefined || typeof formData.energyLevel !== 'number') {
    return { valid: false, error: 'Missing or invalid energyLevel field' };
  }

  if (formData.energyLevel < 1 || formData.energyLevel > 10) {
    return { valid: false, error: 'energyLevel must be between 1 and 10' };
  }

  if (!formData.meaningfulWin || typeof formData.meaningfulWin !== 'string') {
    return { valid: false, error: 'Missing or invalid meaningfulWin field' };
  }

  if (!formData.tomorrowPriority || typeof formData.tomorrowPriority !== 'string') {
    return { valid: false, error: 'Missing or invalid tomorrowPriority field' };
  }

  return {
    valid: true,
    data: {
      date: formData.date,
      energyLevel: formData.energyLevel,
      energyFactors: formData.energyFactors as string | undefined,
      meaningfulWin: formData.meaningfulWin as string,
      frictionPoint: formData.frictionPoint as string | undefined,
      frictionAction: formData.frictionAction as 'address' | 'letting_go' | undefined,
      thingToLetGo: formData.thingToLetGo as string | undefined,
      tomorrowPriority: formData.tomorrowPriority as string,
      notes: formData.notes as string | undefined,
      completionTimeMinutes: formData.completionTimeMinutes as number | undefined,
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
 * GET /api/reviews/daily
 * Returns a list of all daily reviews sorted by date descending
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Read directory contents
    let files: string[];
    try {
      files = await fs.readdir(REVIEWS_DAILY_PATH);
    } catch {
      // Directory doesn't exist or is empty
      return NextResponse.json({ reviews: [] });
    }

    // Filter to only dated markdown files
    const reviewFiles = files.filter(isDatedReviewFile);

    // Parse each file and collect review list items
    const reviews: ReviewListItem[] = [];

    for (const filename of reviewFiles) {
      const filePath = path.join(REVIEWS_DAILY_PATH, filename);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = parseDailyReview(content, filePath);

        reviews.push({
          date: parsed.date || filename.replace('.md', ''),
          energyLevel: parsed.energyLevel || 0,
          tomorrowPriority: parsed.tomorrowPriority || '',
          filePath,
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
 * POST /api/reviews/daily
 * Creates a new daily review file
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
    const filePath = path.join(REVIEWS_DAILY_PATH, filename);

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
    await fs.mkdir(REVIEWS_DAILY_PATH, { recursive: true });

    // Serialize and write the file
    const content = serializeDailyReview(formData);
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json(
      { success: true, filePath },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
