# Technical Task: Principles Editor

## Overview
Add viewer/editor for `principles.md` - user's operating principles.

## Problem Statement
Dashboard has no access to `principles.md` - foundational file from README.

## Acceptance Criteria

### AC1: Principles Page
- [ ] Page at `/principles` showing current principles
- [ ] Markdown rendering with proper list formatting
- [ ] Edit button to switch to edit mode
- [ ] Save button commits changes to `principles.md`

### AC2: Editor
- [ ] Markdown editor with live preview
- [ ] Auto-save draft to localStorage

### AC3: API
- [ ] `GET /api/principles` - read file
- [ ] `PUT /api/principles` - update file

### AC4: Navigation
- [ ] Link in sidebar/navigation

## Test Plan
- API route tests
- Component tests for editor
- E2E test for view/edit flow

## Implementation Steps
1. Create API route `app/api/principles/route.ts`
2. Create page `app/principles/page.tsx`
3. Add to navigation

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
