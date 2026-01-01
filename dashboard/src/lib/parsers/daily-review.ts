/**
 * Daily Review Markdown Parser and Serializer
 *
 * Parses the daily review TEMPLATE.md format into a DailyReview object.
 * Serializes DailyReviewFormData back to TEMPLATE.md markdown format.
 */

import type { DailyReview, DailyReviewFormData, DomainRatings } from '@/lib/types';

/**
 * Check if a value is a placeholder (e.g., [Your win], [YYYY-MM-DD])
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
 * Parse the daily review markdown content into a structured object
 */
export function parseDailyReview(
  content: string,
  filePath: string
): Partial<DailyReview> & { filePath: string } {
  const result: Partial<DailyReview> & { filePath: string } = {
    filePath,
  };

  // Extract date: **Date:** YYYY-MM-DD
  const dateMatch = content.match(/\*\*Date:\*\*\s*(\S+)/);
  if (dateMatch) {
    const dateValue = dateMatch[1].trim();
    // Check if it's a valid date format (not a placeholder)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      result.date = dateValue;
    }
  }

  // Extract energy level: **Energy level (1-10):** N or [ ]
  const energyMatch = content.match(/\*\*Energy level \(1-10\):\*\*\s*(\S+)/);
  if (energyMatch) {
    const energyValue = energyMatch[1].trim();
    // Only accept numeric values
    const parsed = parseInt(energyValue, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
      result.energyLevel = parsed;
    }
  }

  // Extract energy factors: text after "What's affecting your energy today?"
  const energySection = extractSection(content, 'Energy Check');
  if (energySection) {
    // Find text after "What's affecting your energy today?" but before next section
    const factorsMatch = energySection.match(
      /What's affecting your energy today\?\s*\n+(.+)/i
    );
    if (factorsMatch) {
      const factorsValue = factorsMatch[1].trim();
      if (factorsValue && !isPlaceholder(factorsValue)) {
        result.energyFactors = factorsValue;
      }
    }
  }

  // Extract meaningful win from blockquote
  const winSection = extractSection(content, 'One Meaningful Win');
  if (winSection) {
    result.meaningfulWin = extractBlockquote(winSection);
  }

  // Extract friction point and action
  const frictionSection = extractSection(content, 'One Friction Point');
  if (frictionSection) {
    result.frictionPoint = extractBlockquote(frictionSection);

    // Check checkboxes for action type
    // [x] Needs action - means "address"
    // [x] Just needs acknowledgment - means "letting_go"
    if (/\[x\]\s*Needs action/i.test(frictionSection)) {
      result.frictionAction = 'address';
    } else if (/\[x\]\s*Just needs acknowledgment/i.test(frictionSection)) {
      result.frictionAction = 'letting_go';
    }
    // If neither is checked, frictionAction stays undefined
  }

  // Extract thing to let go
  const letGoSection = extractSection(content, 'One Thing to Let Go');
  if (letGoSection) {
    result.thingToLetGo = extractBlockquote(letGoSection);
  }

  // Extract tomorrow's priority
  const tomorrowSection = extractSection(content, 'One Priority for Tomorrow');
  if (tomorrowSection) {
    result.tomorrowPriority = extractBlockquote(tomorrowSection);
  }

  // Extract notes
  const notesSection = extractSection(content, 'Optional: Brief Notes');
  if (notesSection) {
    // Get text after the italic instruction line
    const notesMatch = notesSection.match(
      /\*Anything else worth capturing\? Keep it short\.\*\s*\n+(.+)/i
    );
    if (notesMatch) {
      const notesValue = notesMatch[1].trim();
      if (notesValue && !isPlaceholder(notesValue)) {
        result.notes = notesValue;
      }
    }
  }

  // Extract completion time: **Time to complete:** N minutes
  const timeMatch = content.match(/\*\*Time to complete:\*\*\s*(\d+)\s*minutes/i);
  if (timeMatch) {
    result.completionTimeMinutes = parseInt(timeMatch[1], 10);
  }

  // Extract domain ratings from Life Map Ratings section
  const lifeMapSection = extractSection(content, 'Life Map Ratings');
  if (lifeMapSection) {
    const domainRatings: DomainRatings = {};
    const domainPatterns: [keyof DomainRatings, RegExp][] = [
      ['career', /Career:\s*(\d+)/i],
      ['relationships', /Relationships:\s*(\d+)/i],
      ['health', /Health:\s*(\d+)/i],
      ['meaning', /Meaning:\s*(\d+)/i],
      ['finances', /Finances:\s*(\d+)/i],
      ['fun', /Fun:\s*(\d+)/i],
    ];

    for (const [domain, pattern] of domainPatterns) {
      const match = lifeMapSection.match(pattern);
      if (match) {
        const value = parseInt(match[1], 10);
        if (!isNaN(value) && value >= 0 && value <= 10) {
          domainRatings[domain] = value;
        }
      }
    }

    // Only add domainRatings if at least one domain has a non-zero value
    if (Object.values(domainRatings).some(v => v !== undefined && v > 0)) {
      result.domainRatings = domainRatings;
    }
  }

  return result;
}

/**
 * Serialize DailyReviewFormData to TEMPLATE.md markdown format
 */
export function serializeDailyReview(data: DailyReviewFormData): string {
  const lines: string[] = [];

  // Header
  lines.push('# Daily Check-In');
  lines.push('');
  lines.push(`**Date:** ${data.date}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Energy Check section
  lines.push('## Energy Check');
  lines.push('');
  lines.push(`**Energy level (1-10):** ${data.energyLevel}`);
  lines.push('');
  lines.push('*1 = depleted, 5 = functional, 10 = fully charged*');
  lines.push('');
  lines.push("What's affecting your energy today?");
  lines.push('');
  lines.push(data.energyFactors || '');
  lines.push('');
  lines.push('---');
  lines.push('');

  // One Meaningful Win section
  lines.push('## One Meaningful Win');
  lines.push('');
  lines.push('*Not the biggest task completed. The thing that actually mattered.*');
  lines.push('');
  lines.push(`> ${data.meaningfulWin}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // One Friction Point section
  lines.push('## One Friction Point');
  lines.push('');
  lines.push("*What's creating resistance? Where are you stuck?*");
  lines.push('');
  lines.push(`> ${data.frictionPoint || ''}`);
  lines.push('');

  // Checkboxes for action type
  const needsAction = data.frictionAction === 'address' ? '[x]' : '[ ]';
  const justAcknowledge = data.frictionAction === 'letting_go' ? '[x]' : '[ ]';
  lines.push(`- ${needsAction} Needs action`);
  lines.push(`- ${justAcknowledge} Just needs acknowledgment`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // One Thing to Let Go section
  lines.push('## One Thing to Let Go');
  lines.push('');
  lines.push("*What expectation, worry, or 'should' can you release?*");
  lines.push('');
  lines.push(`> ${data.thingToLetGo || ''}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // One Priority for Tomorrow section
  lines.push('## One Priority for Tomorrow');
  lines.push('');
  lines.push('*If you only accomplish one thing, what would make tomorrow a success?*');
  lines.push('');
  lines.push(`> ${data.tomorrowPriority}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Optional Notes section
  lines.push('## Optional: Brief Notes');
  lines.push('');
  lines.push('*Anything else worth capturing? Keep it short.*');
  lines.push('');
  lines.push(data.notes || '');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Life Map Ratings section (optional - only if any domain is rated)
  if (data.domainRatings) {
    const hasAnyRating = Object.values(data.domainRatings).some(v => v !== undefined && v > 0);
    if (hasAnyRating) {
      lines.push('## Life Map Ratings');
      lines.push('');
      lines.push('*Rate your satisfaction today (0 = not rated, 1-10)*');
      lines.push('');
      lines.push(`- Career: ${data.domainRatings.career ?? 0}`);
      lines.push(`- Relationships: ${data.domainRatings.relationships ?? 0}`);
      lines.push(`- Health: ${data.domainRatings.health ?? 0}`);
      lines.push(`- Meaning: ${data.domainRatings.meaning ?? 0}`);
      lines.push(`- Finances: ${data.domainRatings.finances ?? 0}`);
      lines.push(`- Fun: ${data.domainRatings.fun ?? 0}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // Time to complete footer
  const timeValue =
    data.completionTimeMinutes !== undefined
      ? `${data.completionTimeMinutes} minutes`
      : '';
  lines.push(`**Time to complete:** ${timeValue}`);

  return lines.join('\n');
}
