# Test Plan - Goals Editor (1/3/10 Year)

**Date**: 2026-01-02
**Status**: Complete - All Tests Written

## Summary
- **Total Criteria**: 4 (AC1, AC2, AC3, AC4)
- **Test Files Created**: 3
- **Total Test Cases**: 85
- **All Tests Failing**: Yes (awaiting implementation)

## Acceptance Criteria -> Test Mapping

| # | Criterion | Test Type | Test File | Status |
|---|-----------|-----------|-----------|--------|
| AC1 | Goals Page - /goals with tabs for 1-year, 3-year, 10-year | Component | `GoalsPage.test.tsx` | Written |
| AC1 | Goals Page - Show current goals from each file | Component | `GoalsPage.test.tsx` | Written |
| AC1 | Goals Page - Markdown rendering | Component | `GoalsPage.test.tsx` | Written |
| AC2 | Goals Editor - Edit each timeframe separately | Component | `GoalsEditor.test.tsx` | Written |
| AC2 | Goals Editor - Markdown editor with live preview | Component | `GoalsEditor.test.tsx` | Written |
| AC2 | Goals Editor - Server-side auto-save draft via API | Component | `GoalsEditor.test.tsx` | Written |
| AC3 | API - GET /api/goals/[timeframe] - read goal file | API | `goals.test.ts` | Written |
| AC3 | API - PUT /api/goals/[timeframe] - update goal file | API | `goals.test.ts` | Written |
| AC3 | API - GET /api/goals/[timeframe]/draft - read draft | API | `goals.test.ts` | Written |
| AC3 | API - POST /api/goals/[timeframe]/draft - save draft | API | `goals.test.ts` | Written |
| AC3 | API - DELETE /api/goals/[timeframe]/draft - clear draft | API | `goals.test.ts` | Written |
| AC4 | Goal Tracking - Status per goal in frontmatter | Component | `GoalsPage.test.tsx` | Written |
| AC4 | Goal Tracking - Display status badges in viewer | Component | `GoalsPage.test.tsx` | Written |
| AC4 | Goal Tracking - Link to quarterly reviews | Component | `GoalsPage.test.tsx` | Written |

## Test Files Created

1. `src/__tests__/api/goals.test.ts` - 36 test cases (AC3)
2. `src/__tests__/components/GoalsPage.test.tsx` - 29 test cases (AC1, AC4)
3. `src/__tests__/components/GoalsEditor.test.tsx` - 40 test cases (AC2)

## Test Coverage by Criterion

### AC1: Goals Page (29 tests in GoalsPage.test.tsx)

**Tab Rendering:**
- Should render page with 3 tabs (1-year, 3-year, 10-year)
- Should show 1-year tab as active by default
- Should switch to 3-year tab when clicked
- Should switch to 10-year tab when clicked
- Should fetch correct goal file when tab changes
- Should display tab panel content for active tab

**Content Display:**
- Should display markdown content from goal file
- Should render markdown headings correctly
- Should render markdown lists correctly
- Should render markdown links correctly
- Should render markdown tables correctly
- Should render markdown emphasis correctly
- Should render blockquotes correctly

**Loading and Error States:**
- Should show loading state while fetching
- Should show error state when fetch fails
- Should show error state when API returns error response
- Should show empty state for empty goal file
- Should provide retry option on error

**Edge Cases:**
- Should handle malformed markdown gracefully
- Should handle special characters in content
- Should handle very long content without freezing

### AC2: Goals Editor (40 tests in GoalsEditor.test.tsx)

**Editor Rendering:**
- Should render markdown textarea for editing
- Should render live preview panel
- Should update preview when text changes
- Should render preview with markdown formatting
- Should show edit and preview in side-by-side or toggle view
- Should render save button
- Should render cancel button
- Should display current timeframe being edited

**Auto-Save Draft:**
- Should trigger auto-save after typing stops (2s debounce)
- Should show "Draft saved" indicator after auto-save
- Should call draft API endpoint on auto-save
- Should not auto-save if content has not changed
- Should debounce multiple rapid changes
- Should show "Saving..." indicator while auto-save in progress
- Should handle auto-save errors gracefully

**Save Functionality:**
- Should call PUT API on save button click
- Should call onSave callback on successful save
- Should show success state after save
- Should show error state when save fails
- Should disable save button while saving
- Should include current content in save request

**Draft Restoration:**
- Should prompt to restore draft when draft exists
- Should restore draft content when user confirms
- Should allow discarding draft
- Should clear draft after successful save

**Cancel Functionality:**
- Should call onCancel when cancel button clicked
- Should warn if there are unsaved changes on cancel

**Different Timeframes:**
- Should save to correct endpoint for 3-year timeframe
- Should save to correct endpoint for 10-year timeframe

**Accessibility:**
- Should have accessible label for textarea
- Should support keyboard shortcuts for common actions
- Should announce save status to screen readers

**Edge Cases:**
- Should handle empty content gracefully
- Should preserve cursor position after preview update
- Should handle very large content
- Should handle special markdown characters
- Should handle network disconnection during save

**Toolbar Features:**
- Should render formatting toolbar
- Should insert heading markup when heading button clicked
- Should insert bold markup when bold button clicked

### AC3: API Routes (36 tests in goals.test.ts)

**GET /api/goals/[timeframe]:**
- Should return goal file content for 1-year
- Should return goal file content for 3-year
- Should return goal file content for 10-year
- Should return 400 for invalid timeframe
- Should return 400 for invalid timeframe format
- Should return 404 when file not found
- Should parse frontmatter and return metadata if present
- Should handle files without frontmatter
- Should map timeframe to correct filename

**PUT /api/goals/[timeframe]:**
- Should update goal file with valid content
- Should return success: true on update
- Should return 400 for invalid timeframe
- Should return 400 for missing content
- Should return 400 for empty content
- Should clear draft after successful update
- Should write to correct file path

**GET /api/goals/[timeframe]/draft:**
- Should return draft content if exists
- Should return 404 if no draft exists
- Should return 400 for invalid timeframe
- Should read from correct draft path

**POST /api/goals/[timeframe]/draft:**
- Should save draft content
- Should create drafts directory if not exists
- Should return success: true on save
- Should return 400 for invalid timeframe
- Should return 400 for missing content
- Should accept empty string content

**DELETE /api/goals/[timeframe]/draft:**
- Should delete draft file
- Should return success: true even if draft doesn't exist
- Should return 400 for invalid timeframe

**Timeframe Validation:**
- Should accept "1-year" as valid timeframe
- Should accept "3-year" as valid timeframe
- Should accept "10-year" as valid timeframe
- Should reject "2-year" as invalid timeframe
- Should reject numeric-only timeframe

**Error Handling:**
- Should handle file system errors gracefully on read
- Should handle file system errors gracefully on write
- Should handle malformed JSON in request body

### AC4: Goal Tracking (included in GoalsPage.test.tsx)

**Status Badges:**
- Should parse goal status from frontmatter
- Should display "On Track" badge with green styling
- Should display "Needs Attention" badge with yellow styling
- Should display "Behind" badge with red styling
- Should display last_updated date from frontmatter
- Should handle goals without status frontmatter

**Navigation:**
- Should render link to quarterly reviews page
- Should render edit button for each tab
- Should navigate to editor when edit button clicked

## Edge Cases Covered

- Empty goal files: Show empty state gracefully
- Malformed markdown: Do not crash, display raw content
- Invalid frontmatter: Handle gracefully
- Network errors: Show retry option and error messages
- Large files: Render without freezing UI
- Special characters in content: Escape properly
- Concurrent edits: Drafts prevent data loss
- Browser refresh during edit: Restore from draft
- Missing content in requests: Return 400 error
- File system errors: Return 500 with error message

## Dependencies (mocked)

- `fs/promises` - File system operations (readFile, writeFile, access, mkdir, unlink)
- `@/lib/config` - Path configurations (GOALS_PATH, GOALS_DRAFTS_PATH)
- `next/navigation` - Router hooks (useRouter, useSearchParams, etc.)
- `global.fetch` - For component API calls

## Verification

```
npm test -- --testPathPatterns="goals|Goals"

Tests: 85+ failed, 0 passed (expected - no implementation)
```

All tests are failing because:
1. API routes do not exist (`@/app/api/goals/[timeframe]/route.ts`)
2. API draft routes do not exist (`@/app/api/goals/[timeframe]/draft/route.ts`)
3. GoalsPage component does not exist (`@/components/GoalsPage.tsx`)
4. GoalsEditor component does not exist (`@/components/GoalsEditor.tsx`)

## Ready for Implementation

All tests are written and failing. Implementation can begin following TDD approach:

1. First implement API routes to make API tests pass
2. Then implement GoalsPage component for AC1 and AC4
3. Finally implement GoalsEditor component for AC2
