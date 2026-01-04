# Test Plan - Memory Editor

**Date**: 2026-01-04
**Status**: Planning

## Acceptance Criteria -> Test Mapping

| # | Criterion | Test Type | Test File | Status |
|---|-----------|-----------|-----------|--------|
| AC1 | Memory Page at /memory with markdown rendering | Page | `memory.test.tsx` | Pending |
| AC2 | Editor with formatting toolbar and auto-save draft | Component | `MemoryEditor.test.tsx` | Pending |
| AC3 | GET /api/memory and PUT /api/memory | API | `memory.test.ts` | Pending |
| AC4 | Link/callout in QuickActions for Memory | Integration | `QuickActions.memory.test.tsx` | Pending |

## Test Structure

### AC1: Memory Page (/memory)
**Test File**: `src/__tests__/pages/memory.test.tsx`

**Test Cases**:
- [ ] Should render the memory page
- [ ] Should show loading state initially
- [ ] Should load content from GET /api/memory
- [ ] Should display page title
- [ ] Should render markdown content after loading
- [ ] Should render markdown headings
- [ ] Should render markdown lists
- [ ] Should render markdown bold text
- [ ] Should start in view mode by default
- [ ] Should display Edit button in view mode
- [ ] Should switch to edit mode when Edit button clicked
- [ ] Should display content in editor when in edit mode
- [ ] Should show Save button in edit mode
- [ ] Should call PUT /api/memory when Save clicked
- [ ] Should show success toast after successful save
- [ ] Should return to view mode after successful save
- [ ] Should show error toast when save fails
- [ ] Should remain in edit mode when save fails
- [ ] Should show Cancel button in edit mode
- [ ] Should return to view mode when Cancel clicked
- [ ] Should not save changes when Cancel clicked
- [ ] Should show error state when API fails to load
- [ ] Should show retry button on error
- [ ] Should retry loading when retry button clicked
- [ ] Should handle empty content gracefully

### AC2: MemoryEditor Component
**Test File**: `src/__tests__/components/MemoryEditor.test.tsx`

**Test Cases**:
- [ ] Should render rich markdown editor
- [ ] Should display initial content in editor
- [ ] Should update content when typing
- [ ] Should render formatting toolbar
- [ ] Should have bold button
- [ ] Should have italic button
- [ ] Should have headers button or dropdown
- [ ] Should have list button
- [ ] Should have link button
- [ ] Should apply bold formatting when bold button clicked
- [ ] Should have toggle between edit and preview modes
- [ ] Should start in edit mode by default
- [ ] Should switch to preview mode when preview clicked
- [ ] Should render markdown content in preview mode
- [ ] Should switch back to edit mode when edit clicked
- [ ] Should auto-save draft to localStorage when typing
- [ ] Should restore draft from localStorage on mount
- [ ] Should clear draft from localStorage after successful save
- [ ] Should debounce auto-save to avoid excessive writes
- [ ] Should render Save button
- [ ] Should call onSave with content when Save clicked
- [ ] Should call onSave with modified content
- [ ] Should disable Save button while saving
- [ ] Should show loading indicator while saving
- [ ] Should handle save error gracefully
- [ ] Should re-enable Save button after save error
- [ ] Should render Cancel button
- [ ] Should call onCancel when Cancel button clicked
- [ ] Should not call onSave when Cancel clicked
- [ ] Should handle empty initial content
- [ ] Should handle very long content
- [ ] Should handle special characters in content
- [ ] Should handle markdown with code blocks
- [ ] Should handle markdown with tables

### AC3: API Routes (/api/memory)
**Test File**: `src/__tests__/api/memory.test.ts`

**Test Cases - GET**:
- [ ] Should return markdown content as string
- [ ] Should read from correct file path
- [ ] Should return 500 on file read error
- [ ] Should return 500 on permission denied
- [ ] Should return empty string if file is empty
- [ ] Should handle markdown with special characters
- [ ] Should handle very long content

**Test Cases - PUT**:
- [ ] Should update file content successfully
- [ ] Should write to correct file path
- [ ] Should return updated content in response
- [ ] Should return 400 on missing content field
- [ ] Should return 400 on empty request body
- [ ] Should return 400 on invalid JSON
- [ ] Should return 400 when content is not a string
- [ ] Should return 500 on file write error
- [ ] Should return 500 on disk full error
- [ ] Should allow empty content string
- [ ] Should handle content with special characters
- [ ] Should handle very long content
- [ ] Should preserve newlines and whitespace

### AC4: QuickActions Memory Link
**Test File**: `src/__tests__/components/QuickActions.memory.test.tsx`

**Test Cases**:
- [ ] Should render Memory link in QuickActions
- [ ] Should have correct href to /memory
- [ ] Should be visible and accessible
- [ ] Should have proper label text
- [ ] Should have a memory section with description
- [ ] Should have reminder callout for quarterly reviews
- [ ] Should be within the quick actions container
- [ ] Should be focusable via keyboard
- [ ] Should be activatable with Enter key
- [ ] Should render memory link regardless of review date props

## Edge Cases Identified

1. **Empty content**: File exists but is empty
2. **Very long content**: Files with 100k+ characters
3. **Special characters**: `& < > " ' \` $ @ ! # % ^ * ( ) [ ] { }`
4. **Code blocks**: Markdown with fenced code blocks
5. **Tables**: Markdown tables
6. **Network errors**: API failures
7. **Permission errors**: File system permission issues
8. **Draft restoration**: LocalStorage draft on page load

## Dependencies (mocks needed)

- `fs/promises` - file system operations
- `@/lib/config` - MEMORY_PATH configuration
- `next/navigation` - useRouter
- `sonner` - toast notifications
- `localStorage` - draft auto-save

## Test Files to Create

1. `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/__tests__/api/memory.test.ts`
2. `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/__tests__/components/MemoryEditor.test.tsx`
3. `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/__tests__/pages/memory.test.tsx`
4. `/Users/alexandrbasis/conductor/workspaces/ceo-personal-os/harare/dashboard/src/__tests__/components/QuickActions.memory.test.tsx`
