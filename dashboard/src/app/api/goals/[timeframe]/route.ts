/**
 * API Route: /api/goals/[timeframe]
 *
 * GET - Get a goal file by timeframe (1-year, 3-year, 10-year)
 * PUT - Update a goal file
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { GOALS_PATH, GOALS_DRAFTS_PATH } from '@/lib/config';

interface RouteContext {
  params: Promise<{ timeframe: string }>;
}

// Valid timeframes
const VALID_TIMEFRAMES = ['1-year', '3-year', '10-year'] as const;
type ValidTimeframe = (typeof VALID_TIMEFRAMES)[number];

/**
 * Validate timeframe
 */
function isValidTimeframe(timeframe: string): timeframe is ValidTimeframe {
  return VALID_TIMEFRAMES.includes(timeframe as ValidTimeframe);
}

/**
 * Convert timeframe to filename (e.g., "1-year" -> "1_year.md")
 */
function timeframeToFilename(timeframe: ValidTimeframe): string {
  return `${timeframe.replace('-', '_')}.md`;
}

/**
 * Normalize metadata values - convert Date objects to YYYY-MM-DD strings
 */
function normalizeMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value instanceof Date) {
      // Convert Date to YYYY-MM-DD string
      normalized[key] = value.toISOString().split('T')[0];
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}

/**
 * GET /api/goals/[timeframe]
 * Returns goal file content and metadata
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { timeframe } = await context.params;

  // Validate timeframe
  if (!isValidTimeframe(timeframe)) {
    return NextResponse.json(
      { error: 'Invalid timeframe. Must be one of: 1-year, 3-year, 10-year' },
      { status: 400 }
    );
  }

  const filename = timeframeToFilename(timeframe);
  const filePath = path.join(GOALS_PATH, filename);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { content, data: metadata } = matter(fileContent);

    return NextResponse.json({
      content: content.trim() ? fileContent : fileContent,
      metadata: normalizeMetadata(metadata || {}),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if file not found
    if (errorMessage.includes('ENOENT')) {
      return NextResponse.json(
        { error: `Goal file for ${timeframe} not found` },
        { status: 404 }
      );
    }

    // Other errors (permissions, etc.)
    return NextResponse.json(
      { error: 'Failed to read goal file' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/goals/[timeframe]
 * Updates goal file content
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { timeframe } = await context.params;

  // Validate timeframe
  if (!isValidTimeframe(timeframe)) {
    return NextResponse.json(
      { error: 'Invalid timeframe. Must be one of: 1-year, 3-year, 10-year' },
      { status: 400 }
    );
  }

  // Parse request body
  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Validate content
  if (body.content === undefined || body.content === null) {
    return NextResponse.json(
      { error: 'Missing required field: content' },
      { status: 400 }
    );
  }

  if (typeof body.content !== 'string' || body.content.trim() === '') {
    return NextResponse.json(
      { error: 'Invalid or empty content' },
      { status: 400 }
    );
  }

  const filename = timeframeToFilename(timeframe);
  const filePath = path.join(GOALS_PATH, filename);
  const draftPath = path.join(GOALS_DRAFTS_PATH, filename);

  try {
    // Write to file
    await fs.writeFile(filePath, body.content, 'utf-8');

    // Try to clear draft after successful save
    try {
      await fs.unlink(draftPath);
    } catch {
      // Ignore if draft doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to write goal file' },
      { status: 500 }
    );
  }
}
