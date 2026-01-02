# Technical Task: Life Map Editor

## Overview
Add editing capability for `frameworks/life_map.md` - currently only read-only visualization exists.

## Problem Statement
Dashboard shows Life Map radar chart (read-only) but cannot edit domain scores in the source file.

## Acceptance Criteria

### AC1: Life Map Edit Page
- [ ] Page at `/life-map/edit` or edit mode on `/life-map`
- [ ] Sliders for each of 6 domains (1-10)
- [ ] Text fields for domain assessments
- [ ] Preview of changes on radar chart

### AC2: Save to File
- [ ] Save updates directly to `frameworks/life_map.md`
- [ ] Preserve markdown structure
- [ ] Show success confirmation

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
1. Create `LifeMapEditor.tsx` component
2. Add PUT handler to existing life-map API route
3. Create life-map serializer
4. Add edit page or modal
5. Add edit button to dashboard

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
