# Technical Task: Goals Editor (1/3/10 Year)

## Overview
Add viewer/editor for goals files: `goals/1_year.md`, `goals/3_year.md`, `goals/10_year.md`.

## Problem Statement
Dashboard has no access to goals files - critical for tracking progress in quarterly/annual reviews.

## Dependencies
- Add to package.json: `react-markdown`, `remark-gfm`
- Add shadcn/ui Tabs component: `npx shadcn@latest add tabs`

## Acceptance Criteria

### AC1: Goals Page
- [ ] Page at `/goals` with tabs for 1-year, 3-year, 10-year (using shadcn/ui Tabs)
- [ ] Show current goals from each file
- [ ] Markdown rendering (using react-markdown + remark-gfm)

### AC2: Goals Editor
- [ ] Edit each timeframe separately
- [ ] Markdown editor with live preview (side-by-side or toggle)
- [ ] Server-side auto-save draft via `POST /api/goals/[timeframe]/draft`

### AC3: API
- [ ] `GET /api/goals/[timeframe]` - read goal file (1-year, 3-year, 10-year)
- [ ] `PUT /api/goals/[timeframe]` - update goal file
- [ ] `GET /api/goals/[timeframe]/draft` - read draft (if exists)
- [ ] `POST /api/goals/[timeframe]/draft` - save draft (auto-save)
- [ ] `DELETE /api/goals/[timeframe]/draft` - clear draft after successful save

### AC4: Goal Tracking
- [ ] Status per goal: On Track / Needs Attention / Behind (stored in frontmatter)
- [ ] Display status badges in goal viewer
- [ ] Link to quarterly reviews page (navigation link when relevant)

## Technical Specifications

### Auto-Save Draft Behavior
- Debounce: 2 seconds after last keystroke
- Storage: Server-side file at `goals/.drafts/[timeframe].md`
- Show visual indicator: "Draft saved" toast (subtle)
- On page load: Check for draft, prompt user to restore or discard
- Clear draft on successful PUT save

### Goal Status Storage
- Store status in markdown frontmatter:
  ```yaml
  ---
  status: on-track | needs-attention | behind
  last_updated: 2026-01-02
  ---
  ```
- Parse with gray-matter (already in dependencies)

## Test Plan

### API Route Tests
- `GET /api/goals/1-year` returns goal file content
- `GET /api/goals/invalid` returns 400 error
- `PUT /api/goals/1-year` updates file and clears draft
- Draft API: save, retrieve, delete operations

### Component Tests
- GoalsPage renders with 3 tabs
- Tab switching loads correct content
- Markdown renders correctly (headings, lists, links)
- Editor shows preview alongside textarea
- Auto-save triggers after typing stops
- Status badge displays correctly

### E2E Test
- User loads /goals → sees 1-year tab by default
- User switches to 3-year tab → content updates
- User clicks edit → editor opens with current content
- User types → draft auto-saves (verify via API)
- User saves → file updates, draft clears
- User reloads → sees persisted changes

## Implementation Steps
1. Install dependencies: `npm install react-markdown remark-gfm` + `npx shadcn@latest add tabs`
2. Create API routes `src/app/api/goals/[timeframe]/route.ts` (GET, PUT)
3. Create draft API routes `src/app/api/goals/[timeframe]/draft/route.ts` (GET, POST, DELETE)
4. Create page `src/app/goals/page.tsx` with tabs component
5. Create GoalsEditor component with markdown preview
6. Add goal status tracking (frontmatter parsing)
7. Add to navigation sidebar

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: feature/goals-editor
- **PR**: TBD
