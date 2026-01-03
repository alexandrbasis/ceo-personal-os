# Test Plan - North Star Editor

**Date**: 2026-01-03
**Status**: Complete - All Tests Written

## Summary
- **Total Criteria**: 4
- **Test Files Created**: 4
- **Total Test Cases**: 101
- **All Tests Failing**: Yes (98 failing, 3 passing for existing functionality)

## Criteria Coverage

| # | Criterion | Tests | Status | Test File |
|---|-----------|-------|--------|-----------|
| AC1 | North Star Page | 32 cases | Written | `src/__tests__/pages/north-star.test.tsx` |
| AC2 | Rich Markdown Editor | 36 cases | Written | `src/__tests__/components/NorthStarEditor.test.tsx` |
| AC3 | API (GET/PUT) | 20 cases | Written | `src/__tests__/api/north-star.test.ts` |
| AC4 | Navigation Integration | 13 cases | Written | `src/__tests__/components/QuickActions.north-star.test.tsx` |

## Test Files Created

1. `src/__tests__/api/north-star.test.ts` - API route tests (20 tests)
2. `src/__tests__/components/NorthStarEditor.test.tsx` - Editor component tests (36 tests)
3. `src/__tests__/pages/north-star.test.tsx` - Page tests (32 tests)
4. `src/__tests__/components/QuickActions.north-star.test.tsx` - Navigation tests (13 tests)

## Detailed Test Coverage

### AC1: North Star Page
**Test File**: `src/__tests__/pages/north-star.test.tsx`

**Test Cases**:
- [x] Should render page at `/north-star`
- [x] Should load content from GET /api/north-star
- [x] Should show loading state initially
- [x] Should render markdown content (headings, lists, bold)
- [x] Should have Edit button to switch to edit mode
- [x] Should show Save/Cancel buttons in edit mode
- [x] Should call PUT /api/north-star when Save clicked
- [x] Should show success/error toasts
- [x] Should show error state on API failure
- [x] Should have retry button on error
- [x] Should have proper page structure and accessibility

### AC2: Rich Markdown Editor
**Test File**: `src/__tests__/components/NorthStarEditor.test.tsx`

**Test Cases**:
- [x] Should render rich markdown editor
- [x] Should render formatting toolbar with bold, italic, headers, lists, links
- [x] Should toggle between edit and preview modes
- [x] Should not restore from localStorage (fresh start each load)
- [x] Should display initial content in editor
- [x] Should update content when typing
- [x] Should show Save button and call onSave with content
- [x] Should show Cancel button and call onCancel
- [x] Should show loading state while saving
- [x] Should handle save errors gracefully
- [x] Should render markdown preview correctly
- [x] Should handle code blocks and tables in preview
- [x] Should support keyboard navigation
- [x] Should have accessible labels

### AC3: API (GET/PUT north_star.md)
**Test File**: `src/__tests__/api/north-star.test.ts`

**Test Cases**:
- [x] GET should return markdown content as string
- [x] GET should read from correct file path
- [x] GET should return 500 on file read error
- [x] GET should return 500 on permission denied
- [x] GET should return empty string if file is empty
- [x] GET should handle special characters
- [x] GET should handle very long content
- [x] PUT should update file content successfully
- [x] PUT should write to correct file path
- [x] PUT should return updated content in response
- [x] PUT should return 400 on missing content field
- [x] PUT should return 400 on empty request body
- [x] PUT should return 400 on invalid JSON
- [x] PUT should return 400 when content is not a string
- [x] PUT should return 500 on file write error
- [x] PUT should return 500 on disk full error
- [x] PUT should allow empty content string
- [x] PUT should handle special characters
- [x] PUT should handle very long content
- [x] PUT should preserve newlines and whitespace

### AC4: Navigation Integration
**Test File**: `src/__tests__/components/QuickActions.north-star.test.tsx`

**Test Cases**:
- [x] Should render North Star link/button in QuickActions
- [x] Should link to `/north-star`
- [x] Should display North Star in navigation section
- [x] Should have a dedicated section for North Star
- [x] Should have descriptive text
- [x] Should be keyboard navigable
- [x] Should have accessible labels
- [x] Should work with screen readers
- [x] Should coexist with Daily Review button
- [x] Should coexist with Weekly Review button
- [x] Should coexist with Goals link
- [x] Should coexist with View All Reviews link
- [x] Should have consistent styling

## Edge Cases Covered
- Empty north_star.md file
- Very long markdown content (100K+ characters)
- Special characters in markdown (& < > " ' ` $ @ ! # % ^ *)
- Code blocks and tables in markdown
- File permissions errors (EACCES)
- File not found errors (ENOENT)
- Disk full errors (ENOSPC)
- Invalid JSON in request body
- Network errors during API calls
- Save failures and error recovery

## Verification

```
npm run test -- src/__tests__/api/north-star.test.ts src/__tests__/components/NorthStarEditor.test.tsx src/__tests__/pages/north-star.test.tsx src/__tests__/components/QuickActions.north-star.test.tsx

Test Suites: 4 failed, 4 total
Tests:       98 failed, 3 passed, 101 total
```

All tests are failing as expected (no implementation yet). The 3 passing tests are for existing QuickActions functionality.

## Ready for Implementation

All tests are written and failing. Implementation can begin.

### Implementation Order (recommended):
1. Add `NORTH_STAR_PATH` to `src/lib/config.ts`
2. Create API route `src/app/api/north-star/route.ts` (GET, PUT)
3. Create `NorthStarEditor` component `src/components/NorthStarEditor.tsx`
4. Create page `src/app/north-star/page.tsx`
5. Update `QuickActions` component with North Star link
