/**
 * Weekly Review Markdown Parser and Serializer
 *
 * Parses the weekly review markdown format into a WeeklyReview object.
 * Serializes WeeklyReviewFormData back to markdown format.
 */

import type { WeeklyReview, WeeklyReviewFormData } from '@/lib/types';

/**
 * Check if a value is a placeholder (e.g., [Your key outcomes], [YYYY-MM-DD])
 */
function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return /^\[.*\]$/.test(trimmed);
}

/**
 * Extract section content between two section headers
 */
function extractSection(
  content: string,
  sectionHeader: string
): string | undefined {
  const sectionRegex = new RegExp(
    `## ${sectionHeader}\\s*\\n([\\s\\S]*?)(?=\\n---\\n|\\n## |$)`,
    'i'
  );
  const match = content.match(sectionRegex);
  return match ? match[1] : undefined;
}

/**
 * Extract blockquote content from a section
 */
function extractBlockquote(sectionContent: string): string | undefined {
  // Match blockquote lines starting with >
  const lines = sectionContent.split('\n');
  const blockquoteLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('>')) {
      // Remove the > and any following space
      const content = line.replace(/^>\s?/, '').trim();
      if (content) {
        blockquoteLines.push(content);
      }
    }
  }

  const result = blockquoteLines.join(' ').trim();

  // Check if result is a placeholder or empty
  if (!result || isPlaceholder(result)) {
    return undefined;
  }

  return result;
}

/**
 * Parse the weekly review markdown content into a structured object
 */
export function parseWeeklyReview(
  content: string,
  filePath: string
): Partial<WeeklyReview> & { filePath: string } {
  const result: Partial<WeeklyReview> & { filePath: string } = {
    filePath,
  };

  // Extract date: **Week Starting:** YYYY-MM-DD
  const dateMatch = content.match(/\*\*Week Starting:\*\*\s*(\S+)/);
  if (dateMatch) {
    const dateValue = dateMatch[1].trim();
    // Check if it's a valid date format (not a placeholder)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      result.date = dateValue;
    }
  }

  // Extract week number: **Week Number:** N
  const weekMatch = content.match(/\*\*Week Number:\*\*\s*(\d+)/);
  if (weekMatch) {
    const weekValue = parseInt(weekMatch[1], 10);
    if (!isNaN(weekValue) && weekValue >= 1 && weekValue <= 53) {
      result.weekNumber = weekValue;
    }
  }

  // Extract "moved needle" from section
  const movedNeedleSection = extractSection(
    content,
    'What Actually Moved the Needle This Week'
  );
  if (movedNeedleSection) {
    result.movedNeedle = extractBlockquote(movedNeedleSection);
  }

  // Extract "noise disguised as work" from section
  const noiseSection = extractSection(
    content,
    'What Was Noise Disguised as Work'
  );
  if (noiseSection) {
    result.noiseDisguisedAsWork = extractBlockquote(noiseSection);
  }

  // Extract "time leaks" from section
  const timeLeaksSection = extractSection(content, 'Where Your Time Leaked');
  if (timeLeaksSection) {
    result.timeLeaks = extractBlockquote(timeLeaksSection);
  }

  // Extract "strategic insight" from section
  const insightSection = extractSection(content, 'One Strategic Insight');
  if (insightSection) {
    result.strategicInsight = extractBlockquote(insightSection);
  }

  // Extract "adjustment for next week" from section
  const adjustmentSection = extractSection(
    content,
    'One Adjustment for Next Week'
  );
  if (adjustmentSection) {
    result.adjustmentForNextWeek = extractBlockquote(adjustmentSection);
  }

  // Extract notes from optional section
  const notesSection = extractSection(content, 'Optional: Notes');
  if (notesSection) {
    // Try to get text after the italic instruction line first
    const notesMatch = notesSection.match(
      /\*Anything else worth capturing\?\*\s*\n+(.+)/i
    );
    if (notesMatch) {
      const notesValue = notesMatch[1].trim();
      if (notesValue && !isPlaceholder(notesValue)) {
        result.notes = notesValue;
      }
    } else {
      // If no instruction line, get any non-empty text content
      const lines = notesSection.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and placeholders
        if (trimmed && !isPlaceholder(trimmed) && !trimmed.startsWith('*')) {
          result.notes = trimmed;
          break;
        }
      }
    }
  }

  // Extract completion time: **Time to complete:** N minutes
  const timeMatch = content.match(
    /\*\*Time to complete:\*\*\s*(\d+)\s*minutes/i
  );
  if (timeMatch) {
    result.duration = parseInt(timeMatch[1], 10);
  }

  return result;
}

/**
 * Serialize WeeklyReviewFormData to markdown format
 */
export function serializeWeeklyReview(data: WeeklyReviewFormData): string {
  const lines: string[] = [];

  // Header
  lines.push('# Weekly Review');
  lines.push('');
  lines.push(`**Week Starting:** ${data.date}`);
  lines.push(`**Week Number:** ${data.weekNumber}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // What Actually Moved the Needle This Week section
  lines.push('## What Actually Moved the Needle This Week');
  lines.push('');
  lines.push('*Not tasks completed. The outcomes that truly mattered.*');
  lines.push('');
  lines.push(`> ${data.movedNeedle}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // What Was Noise Disguised as Work section
  lines.push('## What Was Noise Disguised as Work');
  lines.push('');
  lines.push('*Busy work that felt productive but didn\'t advance key goals.*');
  lines.push('');
  lines.push(`> ${data.noiseDisguisedAsWork}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Where Your Time Leaked section
  lines.push('## Where Your Time Leaked');
  lines.push('');
  lines.push('*Where did hours disappear without meaningful output?*');
  lines.push('');
  lines.push(`> ${data.timeLeaks}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // One Strategic Insight section
  lines.push('## One Strategic Insight');
  lines.push('');
  lines.push(
    '*What did this week teach you about your work, priorities, or approach?*'
  );
  lines.push('');
  lines.push(`> ${data.strategicInsight}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // One Adjustment for Next Week section
  lines.push('## One Adjustment for Next Week');
  lines.push('');
  lines.push("*What one change will you make based on this week's learning?*");
  lines.push('');
  lines.push(`> ${data.adjustmentForNextWeek}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Optional: Notes section
  lines.push('## Optional: Notes');
  lines.push('');
  lines.push('*Anything else worth capturing?*');
  lines.push('');
  lines.push(data.notes || '');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Time to complete footer
  const timeValue =
    data.duration !== undefined ? `${data.duration} minutes` : '___ minutes';
  lines.push(`**Time to complete:** ${timeValue}`);
  lines.push('');
  lines.push('*Target: under 20 minutes*');

  return lines.join('\n');
}
