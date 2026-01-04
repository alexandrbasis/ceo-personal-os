# Test Plan - Frameworks Viewer/Editor

**Date**: 2026-01-04
**Status**: Complete - All Tests Written

## Summary

- **Total Criteria**: 5
- **Test Files Created**: 5
- **Total Test Cases**: 112
- **All Tests Failing**: Yes (awaiting implementation)

Testing the Frameworks Viewer/Editor feature which provides:
- Listing page for all frameworks at `/frameworks`
- Individual framework view/edit pages at `/frameworks/[name]`
- API endpoints for reading and writing framework files
- Navigation integration in QuickActions component

## Acceptance Criteria -> Test Mapping

| # | Criterion | Test Type | Test File | Tests | Status |
|---|-----------|-----------|-----------|-------|--------|
| AC1 | Frameworks Page (`/frameworks` listing) | Page | `pages/frameworks.test.tsx` | 28 | Written |
| AC2 | Framework View (`/frameworks/[name]`) | Page | `pages/framework-detail.test.tsx` | 37 | Written |
| AC3 | Framework Editor (markdown editor) | Component | `components/FrameworkEditor.test.tsx` | 38 | Written |
| AC4 | API (GET/PUT `/api/frameworks/[name]`) | API | `api/frameworks.test.ts` | 33 | Written |
| AC5 | Navigation (QuickActions link) | Component | `components/QuickActions.frameworks.test.tsx` | 16 | Written |

## Test Files Created

1. `src/__tests__/api/frameworks.test.ts` - 33 test cases
2. `src/__tests__/components/FrameworkEditor.test.tsx` - 38 test cases
3. `src/__tests__/components/QuickActions.frameworks.test.tsx` - 16 test cases
4. `src/__tests__/pages/frameworks.test.tsx` - 28 test cases
5. `src/__tests__/pages/framework-detail.test.tsx` - 37 test cases

## Verification

```
npm test -- --testPathPatterns="frameworks|FrameworkEditor"

Tests: 112 failed, 6 passed (existing QuickActions sections)
All new tests FAIL as expected (no implementation exists)
```

## Test Structure

### AC1: Frameworks Page (`/frameworks`)
**Test File**: `src/__tests__/pages/frameworks.test.tsx`

**Test Cases** (28 total):
- [x] Should render the frameworks listing page
- [x] Should show loading state initially
- [x] Should display page title
- [x] Should display 3 framework cards
- [x] Should display Annual Review framework card
- [x] Should display Vivid Vision framework card
- [x] Should display Ideal Lifestyle Costing framework card
- [x] Should display framework name on each card
- [x] Should display description for Annual Review
- [x] Should display description for Vivid Vision
- [x] Should display description for Ideal Lifestyle Costing
- [x] Should display source attribution where available
- [x] Should have link to /frameworks/annual-review
- [x] Should have link to /frameworks/vivid-vision
- [x] Should have link to /frameworks/ideal-life-costing
- [x] Should navigate to framework page when card is clicked
- [x] Should show error state when API fails to load
- [x] Should show retry button on error
- [x] Should retry loading when retry button clicked
- [x] Should handle empty frameworks list gracefully
- [x] Should have proper page structure
- [x] Should have navigation back link
- [x] Should display cards in a grid layout
- [x] Should have proper heading hierarchy
- [x] Should have accessible link labels
- [x] Should support keyboard navigation
- [x] Should have appropriate ARIA landmarks
- [x] Should work without API call if frameworks are static

### AC2: Framework View (`/frameworks/[name]`)
**Test File**: `src/__tests__/pages/framework-detail.test.tsx`

**Test Cases** (37 total):
- [x] Should render the framework detail page
- [x] Should show loading state initially
- [x] Should load content from GET /api/frameworks/[name]
- [x] Should display page title
- [x] Should load annual-review framework
- [x] Should load vivid-vision framework
- [x] Should load ideal-life-costing framework
- [x] Should render markdown content after loading
- [x] Should render markdown headings
- [x] Should render markdown lists
- [x] Should render markdown bold text
- [x] Should render numbered lists
- [x] Should render code inline
- [x] Should use react-markdown for rendering
- [x] Should start in view mode by default
- [x] Should display Edit button in view mode
- [x] Should switch to edit mode when Edit button clicked
- [x] Should display content in editor when in edit mode
- [x] Should show Save button in edit mode
- [x] Should call PUT /api/frameworks/[name] when Save clicked
- [x] Should show success toast after successful save
- [x] Should return to view mode after successful save
- [x] Should show error toast when save fails
- [x] Should remain in edit mode when save fails
- [x] Should show Cancel button in edit mode
- [x] Should return to view mode when Cancel clicked
- [x] Should not save changes when Cancel clicked
- [x] Should show error state when API fails to load
- [x] Should show 404 for invalid framework name
- [x] Should show retry button on error
- [x] Should retry loading when retry button clicked
- [x] Should handle empty content gracefully
- [x] Should have proper page structure
- [x] Should have navigation back link
- [x] Should have proper heading hierarchy
- [x] Should have accessible button labels
- [x] Should support keyboard navigation

### AC3: Framework Editor Component
**Test File**: `src/__tests__/components/FrameworkEditor.test.tsx`

**Test Cases** (38 total):
- [x] Should render rich markdown editor
- [x] Should display initial content in editor
- [x] Should update content when typing
- [x] Should render formatting toolbar
- [x] Should have bold button
- [x] Should have italic button
- [x] Should have headers button or dropdown
- [x] Should have list button
- [x] Should have link button
- [x] Should apply bold formatting when bold button clicked
- [x] Should have toggle between edit and preview modes
- [x] Should start in edit mode by default
- [x] Should switch to preview mode when preview clicked
- [x] Should render markdown content in preview mode
- [x] Should switch back to edit mode when edit clicked
- [x] Should not restore content from localStorage (no auto-save)
- [x] Should start fresh with initialContent each load
- [x] Should render Save button
- [x] Should call onSave with content when Save clicked
- [x] Should call onSave with modified content
- [x] Should disable Save button while saving
- [x] Should show loading indicator while saving
- [x] Should handle save error gracefully
- [x] Should re-enable Save button after save error
- [x] Should render Cancel button
- [x] Should call onCancel when Cancel button clicked
- [x] Should not call onSave when Cancel clicked
- [x] Should not save unsaved changes when Cancel clicked
- [x] Should have accessible labels for editor
- [x] Should have accessible labels for toolbar buttons
- [x] Should support keyboard navigation
- [x] Should handle empty initial content
- [x] Should handle very long content
- [x] Should handle special characters in content
- [x] Should handle markdown with code blocks
- [x] Should handle markdown with tables
- [x] Should accept optional frameworkName prop
- [x] Should display framework name in title if provided

### AC4: API Routes (`/api/frameworks/[name]`)
**Test File**: `src/__tests__/api/frameworks.test.ts`

**Test Cases - GET** (18 total):
- [x] Should return markdown content for annual-review
- [x] Should return markdown content for vivid-vision
- [x] Should return markdown content for ideal-life-costing
- [x] Should read annual-review from correct file path
- [x] Should read vivid-vision from correct file path
- [x] Should read ideal-life-costing from correct file path
- [x] Should return 404 for life-map (excluded)
- [x] Should return 404 for invalid-name
- [x] Should return 404 for north-star
- [x] Should return 404 for principles
- [x] Should return 404 for path traversal attempts
- [x] Should return 404 for underscore naming (annual_review)
- [x] Should return 404 for empty name
- [x] Should return 404 for uppercase (ANNUAL-REVIEW)
- [x] Should not allow path traversal attempts
- [x] Should return 500 on file read error
- [x] Should return 500 on permission denied
- [x] Should return empty string if file is empty
- [x] Should handle markdown with special characters
- [x] Should handle very long content

**Test Cases - PUT** (15 total):
- [x] Should update file content successfully for annual-review
- [x] Should update file content successfully for vivid-vision
- [x] Should update file content successfully for ideal-life-costing
- [x] Should write annual-review to correct file path
- [x] Should write vivid-vision to correct file path
- [x] Should write ideal-life-costing to correct file path
- [x] Should return updated content in response
- [x] Should return 404 for invalid framework names
- [x] Should return 400 on missing content field
- [x] Should return 400 on empty request body
- [x] Should return 400 on invalid JSON
- [x] Should return 400 when content is not a string
- [x] Should return 500 on file write error
- [x] Should return 500 on disk full error
- [x] Should allow empty content string
- [x] Should handle content with special characters
- [x] Should handle very long content
- [x] Should preserve newlines and whitespace

### AC5: Navigation (QuickActions)
**Test File**: `src/__tests__/components/QuickActions.frameworks.test.tsx`

**Test Cases** (16 total):
- [x] Should render Frameworks link in QuickActions
- [x] Should have href pointing to /frameworks
- [x] Should render a Frameworks section in QuickActions
- [x] Should display appropriate description text for frameworks
- [x] Should navigate to /frameworks when link is clicked
- [x] Should have accessible label for frameworks link
- [x] Should be keyboard navigable
- [x] Should support keyboard activation (Enter key)
- [x] Should render frameworks link with consistent styling
- [x] Should be visible alongside other navigation items
- [x] Should maintain existing daily section functionality
- [x] Should maintain existing weekly section functionality
- [x] Should maintain existing goals section functionality
- [x] Should maintain existing north star section functionality
- [x] Should maintain existing principles section functionality
- [x] Should maintain existing memory section functionality

## Edge Cases Covered

- Invalid framework names (not in allowlist)
- Very long content (100k+ characters)
- Special characters and markdown edge cases
- Empty files
- Network errors during save
- Path traversal attacks
- Case sensitivity

## Dependencies (mocks needed)

- `fs/promises` - for file system operations
- `@/lib/config` - for framework path constants
- `next/navigation` - for useRouter, useParams
- `sonner` - for toast notifications
- `global.fetch` - for API calls in components

## Framework Name Mapping

| URL Name | File Name | Description (from README) |
|----------|-----------|---------------------------|
| annual-review | annual_review.md | Structured year-end reflection |
| vivid-vision | vivid_vision.md | Detailed future-state visualization |
| ideal-life-costing | ideal_life_costing.md | Understanding what your life actually costs |

## Ready for Implementation

All tests are written and failing. Implementation can begin.

The implementation should create:
1. `src/app/api/frameworks/[name]/route.ts` - API handlers
2. `src/app/frameworks/page.tsx` - Listing page
3. `src/app/frameworks/[name]/page.tsx` - Detail/edit page
4. `src/components/FrameworkEditor.tsx` - Editor component
5. Update `src/components/QuickActions.tsx` - Add Frameworks link
6. Update `src/lib/config.ts` - Add FRAMEWORKS_PATH constant
