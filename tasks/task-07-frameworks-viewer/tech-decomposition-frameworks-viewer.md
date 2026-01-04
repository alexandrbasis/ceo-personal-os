# Technical Task: Frameworks Viewer/Editor

## Overview
Add viewer/editor for framework files from README (excluding life_map which has separate task).

## Problem Statement
Dashboard has no access to framework files:
- `frameworks/annual_review.md` - Gustin-style reflection
- `frameworks/vivid_vision.md` - Future visualization
- `frameworks/ideal_life_costing.md` - Lifestyle analysis

## Design Decisions (Clarified)
- **Descriptions source**: README.md framework table
- **Auto-save**: Not implemented (follow existing NorthStarEditor pattern)
- **URL pattern**: Kebab-case (`/frameworks/annual-review`)
- **Navigation**: Add to QuickActions component

## Acceptance Criteria

### AC1: Frameworks Page
- [ ] Page at `/frameworks` listing all frameworks
- [ ] Card for each framework with description (from README.md table)
- [ ] Link to individual framework page

### AC2: Framework View
- [ ] Page at `/frameworks/[framework-name]` (kebab-case URLs)
- [ ] Markdown rendering of framework content
- [ ] Edit button for modifications

### AC3: Framework Editor
- [ ] Markdown editor with preview (tab-based like NorthStarEditor)
- [ ] Toolbar with formatting buttons
- [ ] Save and Cancel functionality

### AC4: API
- [ ] `GET /api/frameworks/[name]` - read file
- [ ] `PUT /api/frameworks/[name]` - update file
- [ ] Validate framework name against allowlist

### AC5: Navigation
- [ ] Add Frameworks link to QuickActions component

## Test Plan

### API Tests (`src/__tests__/api/frameworks/route.test.ts`)
- GET /api/frameworks/annual-review returns content
- GET /api/frameworks/invalid-name returns 404
- PUT /api/frameworks/vivid-vision updates file
- PUT validates framework name against allowlist

### Component Tests (`src/__tests__/components/FrameworkEditor.test.tsx`)
- Renders in edit mode with toolbar
- Toggles between edit and preview
- Save button calls onSave callback
- Cancel button calls onCancel callback

### E2E Tests (`e2e/frameworks.spec.ts`)
- Navigate to /frameworks and see 3 framework cards
- Click framework card to view content
- Click Edit to enter edit mode
- Make changes and save successfully

## Implementation Steps
1. Update config.ts with framework paths constants
2. Create API route `app/api/frameworks/[name]/route.ts`
   - GET: Read framework file from frameworks/ directory
   - PUT: Update framework file
   - Validate framework name against allowlist (annual-review, vivid-vision, ideal-life-costing)
3. Create frameworks list page at `/frameworks`
   - Display cards for: annual_review, vivid_vision, ideal_life_costing
   - Use descriptions from README.md table
4. Create framework viewer at `/frameworks/[name]`
   - View mode: Render markdown
   - Edit mode: Use FrameworkEditor component
5. Create FrameworkEditor component (similar to NorthStarEditor)
6. Add navigation link to QuickActions component

## Tracking & Progress
- **Linear Issue**: TBD
- **Branch**: feature/frameworks-viewer
- **PR**: TBD
