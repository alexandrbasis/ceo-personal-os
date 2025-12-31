/**
 * Path configuration for file-based storage
 *
 * MARKDOWN_BASE_PATH points to the project root (parent of dashboard/)
 * where all markdown files are stored.
 */

import path from 'path';

// Base path is the project root (parent of dashboard/)
export const MARKDOWN_BASE_PATH = path.resolve(process.cwd(), '..');

// Reviews directory
export const REVIEWS_DAILY_PATH = path.join(
  MARKDOWN_BASE_PATH,
  'reviews',
  'daily'
);

// Life map file
export const LIFE_MAP_PATH = path.join(
  MARKDOWN_BASE_PATH,
  'frameworks',
  'life_map.md'
);
