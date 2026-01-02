# Technical Task: Frameworks Viewer/Editor

## Overview
Add viewer/editor for framework files from README (excluding life_map which has separate task).

## Problem Statement
Dashboard has no access to framework files:
- `frameworks/annual_review.md` - Gustin-style reflection
- `frameworks/vivid_vision.md` - Future visualization
- `frameworks/ideal_life_costing.md` - Lifestyle analysis

## Acceptance Criteria

### AC1: Frameworks Page
- [ ] Page at `/frameworks` listing all frameworks
- [ ] Card for each framework with description
- [ ] Link to individual framework page

### AC2: Framework View
- [ ] Page at `/frameworks/[framework-name]`
- [ ] Markdown rendering of framework content
- [ ] Edit button for modifications

### AC3: Framework Editor
- [ ] Markdown editor with preview
- [ ] Auto-save draft

### AC4: API
- [ ] `GET /api/frameworks/[name]` - read file
- [ ] `PUT /api/frameworks/[name]` - update file

## Test Plan
- API route tests
- Component tests
- E2E test

## Implementation Steps
1. Create API route `app/api/frameworks/[name]/route.ts`
2. Create pages: `/frameworks`, `/frameworks/[name]`
3. Add to navigation

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: TBD
- **PR**: TBD
