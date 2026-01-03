# Technical Task: Life Map Editor

## Overview
Add editing capability for `frameworks/life_map.md` - currently only read-only visualization exists.

## Problem Statement
Dashboard shows Life Map radar chart (read-only) but cannot edit domain scores in the source file.

## Acceptance Criteria

### AC1: Life Map Edit Page
- [ ] Page at `/life-map/edit` route
- [ ] Sliders for each of 6 domains (1-10, silent clamping)
- [ ] Text fields for domain assessments
- [ ] Preview of changes on radar chart

### AC2: Save to File
- [ ] Save updates directly to `frameworks/life_map.md`
- [ ] Table-only update (preserve all other markdown content)
- [ ] Show success confirmation (toast notification)

### AC3: API
- [ ] `PUT /api/life-map` - update file

### AC4: Dashboard Integration
- [ ] Edit button on Life Map card in dashboard
- [ ] Visual feedback when changes saved

## Test Plan
- API route tests for PUT
- Component tests for editor
- E2E test for edit flow

## Implementation Steps
1. Create `LifeMapEditor.tsx` component with sliders and text fields
2. Add PUT handler to existing life-map API route
3. Add `serializeLifeMap()` function to `lib/parsers/life-map.ts`
4. Add edit page at `/life-map/edit` route
5. Add edit button to Life Map card on dashboard

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
