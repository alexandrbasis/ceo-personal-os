/**
 * API Route: /api/north-star
 *
 * GET - Get north star markdown content
 * PUT - Update north star markdown content
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { NORTH_STAR_PATH } from '@/lib/config';

/**
 * GET /api/north-star
 * Returns the raw markdown content of north_star.md
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const content = await fs.readFile(NORTH_STAR_PATH, 'utf-8');

    return NextResponse.json({
      content,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read north star file' },
      { status: 500 }
    );
  }
}

/**
 * Validate that the request body has a valid content field
 * Returns null if valid, or an error message if invalid
 */
function validateRequestBody(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return 'Invalid request body';
  }

  const typedBody = body as Record<string, unknown>;

  if (!('content' in typedBody)) {
    return 'Missing content field';
  }

  if (typeof typedBody.content !== 'string') {
    return 'Content must be a string';
  }

  return null;
}

/**
 * PUT /api/north-star
 * Updates the north star markdown content
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Validate request body
  const validationError = validateRequestBody(body);
  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 }
    );
  }

  const { content } = body as { content: string };

  // Write to file
  try {
    await fs.writeFile(NORTH_STAR_PATH, content, 'utf-8');
  } catch {
    return NextResponse.json(
      { error: 'Failed to write north star file' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    content,
  });
}
