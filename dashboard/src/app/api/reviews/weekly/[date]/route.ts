/**
 * API Route: /api/reviews/weekly/[date]
 *
 * GET - Get a specific weekly review by date
 * PUT - Update an existing weekly review
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { REVIEWS_WEEKLY_PATH } from '@/lib/config';
import {
  parseWeeklyReview,
  serializeWeeklyReview,
} from '@/lib/parsers/weekly-review';
import type { WeeklyReviewFormData } from '@/lib/types';

interface RouteContext {
  params: Promise<{ date: string }>;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Validate WeeklyReviewFormData for update
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
 * GET /api/reviews/weekly/[date]
 * Returns a parsed weekly review for the specified date
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { date } = await context.params;

  // Validate date format
  if (!isValidDateFormat(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Expected YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const filename = `${date}.md`;
  const filePath = path.join(REVIEWS_WEEKLY_PATH, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = parseWeeklyReview(content, filePath);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: `Review for ${date} not found` },
      { status: 404 }
    );
  }
}

/**
 * PUT /api/reviews/weekly/[date]
 * Updates an existing weekly review
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { date } = await context.params;

  // Validate date format
  if (!isValidDateFormat(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Expected YYYY-MM-DD' },
      { status: 400 }
    );
  }

  const filename = `${date}.md`;
  const filePath = path.join(REVIEWS_WEEKLY_PATH, filename);

  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    return NextResponse.json(
      { success: false, error: `Review for ${date} not found` },
      { status: 404 }
    );
  }

  // Parse and validate request body
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

    // Serialize and write the file
    const content = serializeWeeklyReview(formData);
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
