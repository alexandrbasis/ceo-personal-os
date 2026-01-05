/**
 * API Route: /api/goals/snapshot
 *
 * GET - Returns first 5 goals from 1_year.md with title, description, status
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GOALS_PATH } from '@/lib/config';

interface GoalSnapshot {
  title: string;
  description: string;
  status: string;
}

const MAX_GOALS = 5;
const MAX_DESCRIPTION_LENGTH = 100;

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { status: string | null; body: string } {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { status: null, body: content };
  }

  const frontmatterText = frontmatterMatch[1];
  const body = frontmatterMatch[2];

  // Extract status from frontmatter
  const statusMatch = frontmatterText.match(/^status:\s*(.+)$/m);
  const rawStatus = statusMatch ? statusMatch[1].trim() : null;

  return { status: rawStatus, body };
}

/**
 * Normalize status value to standard format
 */
function normalizeStatus(rawStatus: string | null): string {
  const defaultStatus = 'On Track';

  if (!rawStatus) {
    return defaultStatus;
  }

  // Normalize: lowercase, replace hyphens with spaces
  const normalized = rawStatus.toLowerCase().replace(/-/g, ' ');

  // Map to valid status values
  if (normalized === 'on track') {
    return 'On Track';
  }
  if (normalized === 'needs attention') {
    return 'Needs Attention';
  }
  if (normalized === 'behind') {
    return 'Behind';
  }

  // Invalid status defaults to "On Track"
  return defaultStatus;
}

/**
 * Truncate description to max length with ellipsis
 */
function truncateDescription(description: string): string {
  if (description.length <= MAX_DESCRIPTION_LENGTH) {
    return description;
  }
  return description.slice(0, MAX_DESCRIPTION_LENGTH) + '...';
}

/**
 * Parse goals from markdown content
 */
function parseGoals(content: string, defaultStatus: string): GoalSnapshot[] {
  const goals: GoalSnapshot[] = [];

  // Match Goal N: patterns
  const goalPattern = /\*\*Goal\s+(\d+):\*\*/g;
  const matches: { index: number; goalNum: string }[] = [];

  let match;
  while ((match = goalPattern.exec(content)) !== null) {
    matches.push({ index: match.index, goalNum: match[1] });
  }

  for (let i = 0; i < matches.length && goals.length < MAX_GOALS; i++) {
    const startIndex = matches[i].index;
    const endIndex = matches[i + 1]?.index ?? content.length;
    const goalSection = content.slice(startIndex, endIndex);

    // Extract description from *What:* field
    const whatMatch = goalSection.match(/\*What:\*\s*\n([\s\S]+?)(?:\n\n|\n\*|$)/);
    let description = '';

    if (whatMatch) {
      description = whatMatch[1].trim();
    }

    // Use goal number as title (Goal 1, Goal 2, etc.)
    const title = `Goal ${matches[i].goalNum}`;

    goals.push({
      title,
      description: truncateDescription(description),
      status: defaultStatus,
    });
  }

  return goals;
}

/**
 * GET /api/goals/snapshot
 * Returns first 5 goals from 1_year.md
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const filePath = path.join(GOALS_PATH, '1_year.md');

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Handle empty file
    if (!fileContent.trim()) {
      return NextResponse.json({ goals: [] });
    }

    // Parse frontmatter and get status
    const { status: rawStatus, body } = parseFrontmatter(fileContent);
    const defaultStatus = normalizeStatus(rawStatus);

    // Parse goals from content
    const goals = parseGoals(body, defaultStatus);

    return NextResponse.json({ goals });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if file not found
    if (errorMessage.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Goals file not found' },
        { status: 404 }
      );
    }

    // Other errors (permissions, etc.)
    return NextResponse.json(
      { error: 'Failed to read goals file' },
      { status: 500 }
    );
  }
}
