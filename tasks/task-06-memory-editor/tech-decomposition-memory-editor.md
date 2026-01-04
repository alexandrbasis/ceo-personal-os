# Technical Task: Memory Editor

## Overview
Add viewer/editor for `memory.md` - accumulated self-knowledge file.

## Problem Statement
Dashboard has no access to `memory.md` - the "institutional knowledge about yourself" from README.

## Acceptance Criteria

### AC1: Memory Page
- [ ] Page at `/memory` showing memory.md content
- [ ] Markdown rendering (display existing sections from memory.md, like Principles page)
- [ ] View mode shows all existing sections with proper heading hierarchy

### AC2: Editor
- [ ] Markdown editor with formatting toolbar (bold, italic, headers, lists) like PrinciplesEditor
- [ ] Auto-save draft to localStorage

### AC3: API
- [ ] `GET /api/memory` - read file
- [ ] `PUT /api/memory` - update file

### AC4: Integration
- [ ] Link/callout in QuickActions: "Review Memory before quarterly reviews"
- [ ] Link in navigation (QuickActions component)

## Test Plan

### API Tests (src/__tests__/api/memory.test.ts)
- GET /api/memory returns content
- GET handles missing file (500)
- GET handles permission errors (500)
- GET returns empty string for empty file
- GET handles special characters
- PUT updates content successfully
- PUT validates request body (400 on missing/invalid content)
- PUT handles write errors (500)
- PUT preserves whitespace and special characters

### Component Tests (src/__tests__/components/MemoryEditor.test.tsx)
- Renders in edit mode with toolbar
- Preview mode shows rendered markdown
- Formatting toolbar buttons work (bold, italic, header, list, link)
- Auto-saves draft to localStorage with debounce
- Restores draft on mount
- Clears draft after successful save
- Save button calls onSave
- Cancel button calls onCancel
- Handles save errors

### Page Tests (src/__tests__/pages/memory.test.tsx)
- Renders loading state
- Renders error state with retry button
- Renders view mode with markdown content
- Edit button switches to edit mode
- Save updates content and returns to view mode
- Cancel returns to view mode without saving
- Empty state prompts to edit

### E2E Test (e2e/memory.spec.ts)
- Full journey: navigate to /memory → view content → edit → save → verify

## Implementation Steps

1. Add `MEMORY_PATH` to `src/lib/config.ts`
2. Create API route `src/app/api/memory/route.ts`
3. Create MemoryEditor component `src/components/MemoryEditor.tsx`
4. Create page `src/app/memory/page.tsx`
5. Add Memory section to QuickActions with reminder callout

## Technical Decisions (From Pre-Flight Validation)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sections display | View mode renders existing sections from memory.md | Like Principles page |
| Editor guidance | Formatting toolbar only | Matches PrinciplesEditor pattern |
| Reminder mechanism | Link/callout in QuickActions | Simple, non-intrusive |
| Linear tracking | Skip | Per user request |

## Tracking & Progress
- **Linear Issue**: Skipped per user request
- **Branch**: feature/memory-editor
- **PR**: TBD
