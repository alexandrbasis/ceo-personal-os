# Technical Task: Memory Editor

## Overview
Add viewer/editor for `memory.md` - accumulated self-knowledge file.

## Problem Statement
Dashboard has no access to `memory.md` - the "institutional knowledge about yourself" from README.

## Acceptance Criteria

### AC1: Memory Page
- [ ] Page at `/memory` showing memory.md content
- [ ] Markdown rendering
- [ ] Sections for:
  - Patterns noticed across years
  - Insights that keep proving true
  - Warnings to your future self
  - Commitments you've made

### AC2: Editor
- [ ] Markdown editor with structure guidance
- [ ] Auto-save draft

### AC3: API
- [ ] `GET /api/memory` - read file
- [ ] `PUT /api/memory` - update file

### AC4: Integration
- [ ] Reminder to review before quarterly/annual reviews
- [ ] Link in navigation

## Test Plan
- API route tests
- Component tests
- E2E test

## Implementation Steps
1. Create API route `app/api/memory/route.ts`
2. Create page `app/memory/page.tsx`
3. Add to navigation

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
