# Technical Task: Goals Editor (1/3/10 Year)

## Overview
Add viewer/editor for goals files: `goals/1_year.md`, `goals/3_year.md`, `goals/10_year.md`.

## Problem Statement
Dashboard has no access to goals files - critical for tracking progress in quarterly/annual reviews.

## Acceptance Criteria

### AC1: Goals Page
- [ ] Page at `/goals` with tabs/sections for 1-year, 3-year, 10-year
- [ ] Show current goals from each file
- [ ] Markdown rendering

### AC2: Goals Editor
- [ ] Edit each timeframe separately
- [ ] Markdown editor with preview
- [ ] Auto-save draft

### AC3: API
- [ ] `GET /api/goals/[timeframe]` - read file (1-year, 3-year, 10-year)
- [ ] `PUT /api/goals/[timeframe]` - update file

### AC4: Goal Tracking
- [ ] Optional: Status per goal (On Track / Needs Attention / Behind)
- [ ] Link goals to quarterly reviews

## Test Plan
- API route tests
- Component tests for tabbed editor
- E2E test

## Implementation Steps
1. Create API routes `app/api/goals/[timeframe]/route.ts`
2. Create page `app/goals/page.tsx` with tabs
3. Add goal status tracking (optional enhancement)
4. Add to navigation

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
