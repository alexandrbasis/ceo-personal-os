/**
 * API Route: /api/principles
 *
 * GET - Get principles markdown content
 * PUT - Update principles markdown content
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { PRINCIPLES_PATH } from '@/lib/config';

/**
 * GET /api/principles
 * Returns the raw markdown content of principles.md
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const content = await fs.readFile(PRINCIPLES_PATH, 'utf-8');

    return NextResponse.json({
      content,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read principles file' },
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
 * PUT /api/principles
 * Updates the principles markdown content
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
    await fs.writeFile(PRINCIPLES_PATH, content, 'utf-8');
  } catch {
    return NextResponse.json(
      { error: 'Failed to write principles file' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    content,
  });
}
