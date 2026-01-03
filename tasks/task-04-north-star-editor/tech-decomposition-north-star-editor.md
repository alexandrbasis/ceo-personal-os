# Technical Task: North Star Editor

## Overview
Add viewer/editor for `north_star.md` - the user's core direction statement.

## Problem Statement
Dashboard has no access to `north_star.md` - one of the foundational files from README.

## Design Decisions (Clarified 2026-01-03)
- **Editor**: Rich markdown editor with toolbar (bold, italic, headers, etc.)
- **Preview**: Toggle between edit and preview modes (not side-by-side)
- **Dashboard**: Navigation link only (no dashboard card - smaller scope)
- **localStorage**: No auto-restore on page load (start fresh each time)

## Acceptance Criteria

### AC1: North Star Page
- [ ] Page at `/north-star` showing current north star content
- [ ] Markdown rendering of content using react-markdown
- [ ] Edit button to switch to edit mode
- [ ] Save button commits changes to `north_star.md`

### AC2: Rich Markdown Editor
- [ ] Rich markdown editor with formatting toolbar
- [ ] Toggle between edit and preview modes
- [ ] Toolbar with bold, italic, headers, lists, links
- [ ] No localStorage draft restoration (fresh start on each page load)

### AC3: API
- [ ] `GET /api/north-star` - read north_star.md file content
- [ ] `PUT /api/north-star` - update north_star.md file content
- [ ] Return 400 on invalid request body
- [ ] Return 500 on file system errors

### AC4: Navigation Integration
- [ ] Link to North Star page in navigation/QuickActions

## Test Plan

### API Tests (`src/__tests__/api/north-star.test.ts`)
- GET returns markdown content as string
- GET returns 500 on file read error
- PUT updates file content successfully
- PUT returns 400 on missing content field
- PUT returns 500 on file write error

### Component Tests (`src/__tests__/components/NorthStarEditor.test.tsx`)
- Renders current north star content in view mode
- Edit button switches to edit mode with editor
- Editor toolbar has formatting buttons
- Toggle switches between edit and preview
- Save button calls PUT /api/north-star
- Cancel button navigates back without saving
- Shows loading state while fetching
- Shows error state on API failure

### Page Tests (`src/__tests__/pages/north-star.test.tsx`)
- Page renders at /north-star
- Loads data from GET /api/north-star
- Edit mode navigation works
- Save/cancel flow works correctly

## Implementation Steps
1. Add `NORTH_STAR_PATH` to `dashboard/src/lib/config.ts`
2. Create API route `src/app/api/north-star/route.ts`
3. Create NorthStarEditor component with rich editor
4. Create page `src/app/north-star/page.tsx`
5. Add edit page `src/app/north-star/edit/page.tsx`
6. Add link to QuickActions or navigation

## Technical Notes
- Use `react-markdown` with `remark-gfm` for rendering (already installed)
- Follow life-map API route pattern for file read/write
- Use existing Button, Card components from ui/
- Editor can use contentEditable div with execCommand for formatting

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: feature/north-star-editor
- **PR**: TBD
