/**
 * API Route: /api/life-map
 *
 * GET - Get life map scores and assessments
 * PUT - Update life map scores and assessments
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { LIFE_MAP_PATH } from '@/lib/config';
import { parseLifeMap, getLifeMapChartData, updateLifeMapFile } from '@/lib/parsers/life-map';
import type { LifeMap, LifeMapDomain } from '@/lib/types';

/**
 * GET /api/life-map
 * Returns the parsed life map with domain scores and chart data
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const content = await fs.readFile(LIFE_MAP_PATH, 'utf-8');
    const lifeMap = parseLifeMap(content);
    const chartData = getLifeMapChartData(lifeMap);

    return NextResponse.json({
      ...lifeMap,
      chartData,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read life map' },
      { status: 500 }
    );
  }
}

/**
 * Valid domain keys for the life map
 */
const DOMAIN_KEYS = [
  'career',
  'relationships',
  'health',
  'meaning',
  'finances',
  'fun',
] as const;

type DomainKey = (typeof DOMAIN_KEYS)[number];

/**
 * Clamp a score value to the 1-10 range
 * Truncates decimals to integers
 */
function clampScore(score: number): number {
  const truncated = Math.trunc(score);
  return Math.max(1, Math.min(10, truncated));
}

/**
 * Validate that the request body has a valid domains structure
 * Returns null if valid, or an error message if invalid
 */
function validateRequestBody(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return 'Invalid request body';
  }

  const typedBody = body as Record<string, unknown>;

  if (!typedBody.domains || typeof typedBody.domains !== 'object') {
    return 'Missing domains object';
  }

  const domains = typedBody.domains as Record<string, unknown>;

  // Validate each domain if present
  for (const key of Object.keys(domains)) {
    const domain = domains[key] as Record<string, unknown> | undefined;
    if (domain && typeof domain.score !== 'undefined') {
      if (typeof domain.score !== 'number') {
        return `Invalid score type for domain ${key}`;
      }
    }
  }

  return null;
}

/**
 * PUT /api/life-map
 * Updates the life map with new domain scores and assessments
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

  const updateDomains = (body as { domains: Record<string, { score?: number; assessment?: string }> }).domains;

  // Read current file
  let fileContent: string;
  let currentLifeMap: LifeMap;
  try {
    fileContent = await fs.readFile(LIFE_MAP_PATH, 'utf-8');
    currentLifeMap = parseLifeMap(fileContent);
  } catch {
    return NextResponse.json(
      { error: 'Failed to read life map file' },
      { status: 500 }
    );
  }

  // Merge updates with current data
  for (const key of DOMAIN_KEYS) {
    const update = updateDomains[key];
    if (update) {
      const newDomain: LifeMapDomain = {
        score: typeof update.score === 'number'
          ? clampScore(update.score)
          : currentLifeMap.domains[key].score,
        assessment: update.assessment ?? currentLifeMap.domains[key].assessment ?? '',
      };
      currentLifeMap.domains[key] = newDomain;
    }
  }

  // Update file content
  const updatedContent = updateLifeMapFile(fileContent, currentLifeMap);

  // Write to file
  try {
    await fs.writeFile(LIFE_MAP_PATH, updatedContent, 'utf-8');
  } catch {
    return NextResponse.json(
      { error: 'Failed to write life map file' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    domains: currentLifeMap.domains,
  });
}
