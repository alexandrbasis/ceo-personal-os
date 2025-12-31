/**
 * API Route: /api/reviews/daily/[date]
 *
 * GET - Get a specific daily review by date
 * PUT - Update an existing daily review
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { REVIEWS_DAILY_PATH } from '@/lib/config';
import { parseDailyReview, serializeDailyReview } from '@/lib/parsers/daily-review';
import type { DailyReviewFormData } from '@/lib/types';

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
 * Validate DailyReviewFormData for update
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
 * GET /api/reviews/daily/[date]
 * Returns a parsed daily review for the specified date
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
  const filePath = path.join(REVIEWS_DAILY_PATH, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = parseDailyReview(content, filePath);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: `Review for ${date} not found` },
      { status: 404 }
    );
  }
}

/**
 * PUT /api/reviews/daily/[date]
 * Updates an existing daily review
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
  const filePath = path.join(REVIEWS_DAILY_PATH, filename);

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
    const content = serializeDailyReview(formData);
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
