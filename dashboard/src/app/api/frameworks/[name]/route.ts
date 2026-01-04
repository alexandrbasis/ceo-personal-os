/**
 * API Route: /api/frameworks/[name]
 *
 * GET - Get framework markdown content
 * PUT - Update framework markdown content
 *
 * Supported frameworks (kebab-case URL → underscore filename):
 * - annual-review → annual_review.md
 * - vivid-vision → vivid_vision.md
 * - ideal-life-costing → ideal_life_costing.md
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { FRAMEWORKS_PATH } from '@/lib/config';

/**
 * Framework allowlist mapping URL slug to filename
 * Only these frameworks are accessible via the API
 */
const FRAMEWORK_MAP: Record<string, string> = {
  'annual-review': 'annual_review.md',
  'vivid-vision': 'vivid_vision.md',
  'ideal-life-costing': 'ideal_life_costing.md',
};

/**
 * Validate framework name against allowlist
 * Returns the filename if valid, null if invalid
 */
function getFrameworkFilename(name: string): string | null {
  // Security: Only allow exact matches from the allowlist
  return FRAMEWORK_MAP[name] || null;
}

/**
 * GET /api/frameworks/[name]
 * Returns the raw markdown content of the framework file
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  const { name } = await params;

  // Validate framework name against allowlist
  const filename = getFrameworkFilename(name);
  if (!filename) {
    return NextResponse.json(
      { error: 'Framework not found' },
      { status: 404 }
    );
  }

  const filePath = path.join(FRAMEWORKS_PATH, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    return NextResponse.json({
      content,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read framework file' },
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
 * PUT /api/frameworks/[name]
 * Updates the framework markdown content
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  const { name } = await params;

  // Validate framework name against allowlist
  const filename = getFrameworkFilename(name);
  if (!filename) {
    return NextResponse.json(
      { error: 'Framework not found' },
      { status: 404 }
    );
  }

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
  const filePath = path.join(FRAMEWORKS_PATH, filename);

  // Write to file
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch {
    return NextResponse.json(
      { error: 'Failed to write framework file' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    content,
  });
}
