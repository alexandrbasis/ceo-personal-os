# Test Plan - Principles Editor

**Date**: 2026-01-04T00:00:00Z
**Status**: Complete - All Tests Written

## Executive Summary

This test plan covers all 4 acceptance criteria for the Principles Editor feature. Tests follow the established patterns from the North Star Editor implementation.

## Summary

- **Total Criteria**: 4
- **Test Files Created**: 4
- **Total Test Cases**: 105
- **All Tests Failing**: Yes (awaiting implementation)

## Acceptance Criteria to Test Mapping

| # | Criterion | Test Type | Test File | Tests | Status | Commit |
|---|-----------|-----------|-----------|-------|--------|--------|
| 1 | Principles Page - route, markdown rendering, edit/save buttons | Page | `pages/principles.test.tsx` | 30 | Written | b275be9 |
| 2 | Editor - markdown editor with live preview, auto-save draft | Component | `components/PrinciplesEditor.test.tsx` | 38 | Written | e010cfd |
| 3 | API - GET/PUT /api/principles | API | `api/principles.test.ts` | 20 | Written | c8f296f |
| 4 | Navigation - Link in sidebar/navigation | Component | `components/QuickActions.principles.test.tsx` | 17 | Written | 487e744 |

## Test Structure

### AC1: Principles Page (`/principles`)

**Test File**: `dashboard/src/__tests__/pages/principles.test.tsx`

**Test Cases**:
- [x] Should render the principles page at /principles route
- [x] Should show loading state initially
- [x] Should load content from GET /api/principles
- [x] Should display page title
- [x] Should render markdown content after loading
- [x] Should render markdown headings properly
- [x] Should render markdown lists properly
- [x] Should render markdown bold/italic text
- [x] Should use react-markdown for rendering
- [x] Should start in view mode by default
- [x] Should display Edit button in view mode
- [x] Should switch to edit mode when Edit button clicked
- [x] Should display content in editor when in edit mode
- [x] Should show Save button in edit mode
- [x] Should call PUT /api/principles when Save clicked
- [x] Should show success toast after successful save
- [x] Should return to view mode after successful save
- [x] Should show error toast when save fails
- [x] Should remain in edit mode when save fails
- [x] Should show Cancel button in edit mode
- [x] Should return to view mode when Cancel clicked
- [x] Should not save changes when Cancel clicked
- [x] Should show error state when API fails to load
- [x] Should show retry button on error
- [x] Should retry loading when retry button clicked
- [x] Should handle empty content gracefully
- [x] Should have proper page structure
- [x] Should have navigation back link
- [x] Should have proper heading hierarchy (accessibility)
- [x] Should have accessible button labels
- [x] Should support keyboard navigation

### AC2: Editor (Markdown editor with live preview, auto-save draft)

**Test File**: `dashboard/src/__tests__/components/PrinciplesEditor.test.tsx`

**Test Cases**:
- [x] Should render markdown editor
- [x] Should display initial content in editor
- [x] Should update content when typing
- [x] Should render formatting toolbar
- [x] Should have bold button
- [x] Should have italic button
- [x] Should have headers button/dropdown
- [x] Should have list button
- [x] Should have link button
- [x] Should apply bold formatting when bold button clicked
- [x] Should have toggle between edit and preview modes
- [x] Should start in edit mode by default
- [x] Should switch to preview mode when preview clicked
- [x] Should render markdown content in preview mode
- [x] Should switch back to edit mode when edit clicked
- [x] Should auto-save draft to localStorage when typing
- [x] Should restore draft from localStorage on mount
- [x] Should clear draft from localStorage after successful save
- [x] Should debounce auto-save to avoid excessive writes
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

### AC3: API (GET /api/principles, PUT /api/principles)

**Test File**: `dashboard/src/__tests__/api/principles.test.ts`

**Test Cases**:
GET /api/principles:
- [x] Should return markdown content as string
- [x] Should read from correct file path (principles.md)
- [x] Should return 500 on file read error
- [x] Should return 500 on permission denied
- [x] Should return empty string if file is empty
- [x] Should handle markdown with special characters
- [x] Should handle very long content

PUT /api/principles:
- [x] Should update file content successfully
- [x] Should write to correct file path
- [x] Should return updated content in response
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

### AC4: Navigation (Link in sidebar/navigation)

**Test File**: `dashboard/src/__tests__/components/QuickActions.principles.test.tsx`

**Test Cases**:
- [x] Should render Principles link in QuickActions
- [x] Should have correct href to /principles
- [x] Should be visible and accessible
- [x] Should have proper label text
- [x] Should have a principles section with description
- [x] Should have descriptive text for principles link
- [x] Should be positioned near North Star section
- [x] Should be within the quick actions container
- [x] Should be focusable via keyboard
- [x] Should be activatable with Enter key
- [x] Should have consistent styling with other navigation links
- [x] Should be rendered as a Button component with secondary variant
- [x] Should render principles link regardless of lastReviewDate prop
- [x] Should render principles link with daily and weekly review props
- [x] Should render principles link with no props

## Edge Cases Identified

1. **Empty file content**: Handle gracefully, show empty state
2. **Very long content**: Ensure no performance issues (100k+ chars)
3. **Special characters**: `& < > " ' \` $ @ ! # % ^ *` etc.
4. **Markdown tables**: Ensure proper rendering in preview
5. **Code blocks**: Ensure proper syntax highlighting
6. **Network errors**: Show retry option
7. **File permission errors**: Display appropriate error message
8. **localStorage unavailable**: Handle gracefully for SSR

## Dependencies (mocks needed)

- `fs/promises` - for file read/write operations
- `next/navigation` - for router.push
- `sonner` - for toast notifications
- `localStorage` - for draft persistence
- `@/lib/config` - for PRINCIPLES_PATH constant

## Test Files Created

1. `/dashboard/src/__tests__/pages/principles.test.tsx`
2. `/dashboard/src/__tests__/components/PrinciplesEditor.test.tsx`
3. `/dashboard/src/__tests__/api/principles.test.ts`
4. `/dashboard/src/__tests__/components/QuickActions.principles.test.tsx`

## Verification

```bash
cd dashboard && ./node_modules/.bin/jest --testPathPatterns="principles" --passWithNoTests
```

**Result**:
```
Test Suites: 4 failed, 4 total
Tests:       105 failed, 105 total
```

All tests are failing as expected (no implementation exists yet).

## Ready for Implementation

All tests are written and failing. Implementation can begin.

The tests follow the established North Star Editor pattern and cover:
- Page rendering and markdown display
- View/Edit mode transitions
- Save/Cancel functionality
- API endpoint behavior
- Error handling
- Accessibility requirements
- Edge cases (empty content, long content, special characters)
- localStorage draft persistence
