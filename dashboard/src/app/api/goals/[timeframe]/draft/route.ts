/**
 * API Route: /api/goals/[timeframe]/draft
 *
 * GET - Get a draft for a goal file
 * POST - Save a draft (auto-save)
 * DELETE - Clear a draft after successful save
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GOALS_DRAFTS_PATH } from '@/lib/config';

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
 * GET /api/goals/[timeframe]/draft
 * Returns draft content if exists
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
  const draftPath = path.join(GOALS_DRAFTS_PATH, filename);

  try {
    const content = await fs.readFile(draftPath, 'utf-8');
    return NextResponse.json({
      content,
      hasDraft: true,
    });
  } catch (error) {
    // Check if file doesn't exist (ENOENT) - this is expected "no draft" case
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { hasDraft: false, error: 'No draft found' },
        { status: 404 }
      );
    }

    // For real errors (permissions, corruption, etc.), return 500
    console.error('Draft read error:', error);
    return NextResponse.json(
      { hasDraft: false, error: 'Failed to read draft' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[timeframe]/draft
 * Saves draft content (auto-save)
 */
export async function POST(
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

  // Validate content - must be present (but can be empty string)
  if (body.content === undefined || body.content === null) {
    return NextResponse.json(
      { error: 'Missing required field: content' },
      { status: 400 }
    );
  }

  if (typeof body.content !== 'string') {
    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400 }
    );
  }

  const filename = timeframeToFilename(timeframe);
  const draftPath = path.join(GOALS_DRAFTS_PATH, filename);

  try {
    // Ensure drafts directory exists
    await fs.mkdir(GOALS_DRAFTS_PATH, { recursive: true });

    // Write draft
    await fs.writeFile(draftPath, body.content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[timeframe]/draft
 * Clears draft after successful save
 */
export async function DELETE(
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
  const draftPath = path.join(GOALS_DRAFTS_PATH, filename);

  try {
    await fs.unlink(draftPath);
  } catch {
    // Ignore if file doesn't exist - idempotent delete
  }

  return NextResponse.json({ success: true });
}
