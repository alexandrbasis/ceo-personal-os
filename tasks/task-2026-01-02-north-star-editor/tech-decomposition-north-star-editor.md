# Technical Task: North Star Editor

## Overview
Add viewer/editor for `north_star.md` - the user's core direction statement.

## Problem Statement
Dashboard has no access to `north_star.md` - one of the foundational files from README.

## Acceptance Criteria

### AC1: North Star Page
- [ ] Page at `/north-star` showing current north star
- [ ] Markdown rendering of content
- [ ] Edit button to switch to edit mode
- [ ] Save button commits changes to `north_star.md`

### AC2: Inline Editor
- [ ] Simple textarea or markdown editor
- [ ] Preview mode before saving
- [ ] Auto-save draft to localStorage

### AC3: API
- [ ] `GET /api/north-star` - read file
- [ ] `PUT /api/north-star` - update file

### AC4: Dashboard Integration
- [ ] North Star card/section on dashboard (optional)
- [ ] Link in navigation

## Test Plan
- API route tests for read/write
- Component tests for editor
- E2E test for view/edit flow

## Implementation Steps
1. Create API route `app/api/north-star/route.ts`
2. Create page `app/north-star/page.tsx`
3. Add markdown editor component
4. Add to navigation

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
