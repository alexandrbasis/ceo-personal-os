# Test Plan - Life Map Editor

**Date**: 2026-01-03
**Status**: Complete - All Tests Written

## Summary
- **Total Criteria**: 4 (AC1-AC4)
- **Test Files Created**: 4
- **Total Test Cases**: 98
- **All Tests Failing**: Yes (awaiting implementation)

## Criteria Coverage

| # | Criterion | Tests | Status | File |
|---|-----------|-------|--------|------|
| AC1 | Life Map Edit Page | 58 cases | Written | `LifeMapEditor.test.tsx`, `life-map-edit.test.tsx` |
| AC2 | Save to File (Serializer) | 17 cases | Written | `life-map-serializer.test.ts` |
| AC3 | API PUT /api/life-map | 18 cases | Written | `life-map.test.ts` |
| AC4 | Dashboard Integration | 11 cases | Written | `dashboard-life-map.test.tsx` |

## Test Files Created

1. `dashboard/src/__tests__/lib/life-map-serializer.test.ts` - 17 tests
2. `dashboard/src/__tests__/api/life-map.test.ts` - 18 new PUT tests (extended existing)
3. `dashboard/src/__tests__/components/LifeMapEditor.test.tsx` - 35 tests
4. `dashboard/src/__tests__/pages/life-map-edit.test.tsx` - 23 tests
5. `dashboard/src/__tests__/components/dashboard-life-map.test.tsx` - 11 tests

## Detailed Test Coverage

### AC1: Life Map Edit Page
**Test Files**:
- `src/__tests__/components/LifeMapEditor.test.tsx` (35 tests)
- `src/__tests__/pages/life-map-edit.test.tsx` (23 tests)

**Test Cases**:
- [x] Should render sliders for all 6 domains
- [x] Should render slider for each domain (Career, Relationships, Health, Meaning, Finances, Fun)
- [x] Should have sliders with min=1 and max=10
- [x] Should display current score value next to each slider
- [x] Should silently clamp values below 1 to 1
- [x] Should silently clamp values above 10 to 10
- [x] Should not show error messages when clamping
- [x] Should render text fields for all 6 domain assessments
- [x] Should display initial assessment values in text fields
- [x] Should allow editing assessment text
- [x] Should allow empty assessment text
- [x] Should have accessible labels for assessment fields
- [x] Should render preview radar chart
- [x] Should update preview chart when slider values change
- [x] Should show all 6 domains in preview
- [x] Should render save button
- [x] Should call onSave with updated data when save clicked
- [x] Should disable save button while saving
- [x] Should show loading indicator while saving
- [x] Should render cancel button
- [x] Should call onCancel when cancel button clicked
- [x] Should have accessible labels for all sliders
- [x] Should support keyboard navigation on sliders
- [x] Should announce save status to screen readers
- [x] Should handle empty initial data gracefully
- [x] Should handle save error gracefully
- [x] Should handle very long assessment text
- [x] Should handle special characters in assessment text
- [x] Page renders the edit page
- [x] Page shows loading state initially
- [x] Page loads current life map data from API
- [x] Page renders sliders after loading
- [x] Page displays current domain scores from API
- [x] Page shows error state when API fails
- [x] Page shows retry button on error
- [x] Page calls PUT API when save button clicked
- [x] Page shows success toast notification after save
- [x] Page navigates to dashboard after successful save
- [x] Page shows error toast when save fails
- [x] Page navigates back when cancel button clicked

### AC2: Save to File (Serializer)
**Test File**: `src/__tests__/lib/life-map-serializer.test.ts` (17 tests)

**Test Cases**:
- [x] Should generate correct markdown table format
- [x] Should preserve domain order (career, relationships, health, meaning, finances, fun)
- [x] Should handle special characters in assessments
- [x] Should handle empty assessment text
- [x] Should handle undefined assessment text (treat as empty)
- [x] Should handle score of 10 correctly
- [x] Should handle score of 1 correctly
- [x] Should preserve all non-table content when updating
- [x] Should only update the table rows, not add new content
- [x] Should handle file content with different whitespace
- [x] Round-trip: parse -> serialize -> parse = same data
- [x] Round-trip: handle minimal data
- [x] Round-trip: preserve special characters
- [x] Should handle assessments with pipe characters
- [x] Should handle very long assessments
- [x] Should handle score of 0 (unrated)
- [x] Should handle file with missing table (create new table)

### AC3: API PUT /api/life-map
**Test File**: `src/__tests__/api/life-map.test.ts` (18 new tests)

**Test Cases**:
- [x] Should accept valid update with all 6 domains
- [x] Should write updated content to file
- [x] Should accept partial update (some domains)
- [x] Should clamp score values below 1 to 1
- [x] Should clamp score values above 10 to 10
- [x] Should allow empty assessment text
- [x] Should return 500 on file write error
- [x] Should return 500 on file read error
- [x] Should return 400 on invalid request body
- [x] Should return 400 when domains object is missing
- [x] Should preserve non-table content in file
- [x] Should return updated life map data in response
- [x] Should handle special characters in assessments
- [x] Should handle undefined assessment (treat as empty string)
- [x] Should validate score is a number
- [x] Should handle decimal scores by truncating

### AC4: Dashboard Integration
**Test File**: `src/__tests__/components/dashboard-life-map.test.tsx` (11 tests)

**Test Cases**:
- [x] Should render edit button on Life Map card
- [x] Should have edit button within Life Map card
- [x] Should render edit button with appropriate icon or label
- [x] Should navigate to /life-map/edit when edit button clicked
- [x] Should have correct href if using Link component
- [x] Should refresh Life Map data when returning from edit
- [x] Should display updated scores after save
- [x] Should have accessible name for edit button
- [x] Should be keyboard accessible
- [x] Should show edit button even when chart has no data
- [x] Should not disable edit button during loading

## Edge Cases Covered

1. **Score Clamping**: Values < 1 clamped to 1, values > 10 clamped to 10
2. **Special Characters**: Assessments with &, ', (, ), >, $, :, and dashes
3. **Empty Assessments**: All domains can have empty assessment text
4. **Undefined Assessments**: Treated as empty string
5. **Partial Updates**: Only update specified domains, preserve others
6. **File Preservation**: Non-table markdown content preserved
7. **Very Long Assessments**: 500+ character assessments
8. **Decimal Scores**: Truncated to integers
9. **Missing Table**: Create new table if file has no table
10. **Network Errors**: Graceful handling of API failures

## Verification

```bash
# Run all Life Map tests
cd dashboard && npm test -- --testPathPatterns="life-map"

# Expected output (all tests FAILING - no implementation yet):
# Test Suites: 5 failed, 5 total
# Tests: ~98 failed, ~6 passed (existing GET tests), ~104 total
```

## Ready for Implementation

All tests are written and failing as expected. The implementation should:

1. Add `serializeLifeMap()` and `updateLifeMapFile()` to `lib/parsers/life-map.ts`
2. Add `PUT` handler to `app/api/life-map/route.ts`
3. Create `components/LifeMapEditor.tsx` component
4. Create `app/life-map/edit/page.tsx` page
5. Add edit button to dashboard Life Map card

## Dependencies (mocks used)

- `fs/promises` - readFile, writeFile, access
- `next/navigation` - useRouter (push, back)
- `global.fetch` - API calls
- `@/lib/config` - LIFE_MAP_PATH
- `sonner` - toast notifications
