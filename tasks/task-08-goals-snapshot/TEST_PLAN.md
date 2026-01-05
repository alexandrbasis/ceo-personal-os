# Test Plan - Goals Snapshot on Dashboard

**Date**: 2026-01-04T21:00:00Z
**Status**: Complete - All Tests Written

## Summary
- **Task**: Add Goals Snapshot component to dashboard
- **Source**: tech-decomposition-goals-snapshot.md
- **Total Criteria**: 4 (AC1-AC4)
- **Test Files Created**: 2
- **Total Test Cases**: 58
- **All Tests Failing**: Yes (awaiting implementation)

## Acceptance Criteria to Test Mapping

| # | Criterion | Test Type | Test File | Test Count | Status |
|---|-----------|-----------|-----------|------------|--------|
| AC1 | Goals Snapshot Component | Component | `GoalsSnapshot.test.tsx` | 16 | Written |
| AC2 | Status from Frontmatter | API + Unit | `goals-snapshot.test.ts` | 8 | Written |
| AC3 | API Endpoint | API | `goals-snapshot.test.ts` | 18 | Written |
| AC4 | Navigation | Component | `GoalsSnapshot.test.tsx` | 6 | Written |

## Test Structure

### AC1: Goals Snapshot Component
**Test File**: `src/__tests__/components/GoalsSnapshot.test.tsx`

**Test Cases**:
- [x] Should render as a card component
- [x] Should display "Goals Snapshot" or similar heading
- [x] Should display first 3-5 goals from API response
- [x] Should show goal title for each goal
- [x] Should show description excerpt for each goal
- [x] Should truncate long descriptions with ellipsis
- [x] Should limit displayed goals to maximum of 5
- [x] Should show status indicator for each goal
- [x] Should apply green styling for "On Track" status
- [x] Should apply yellow/warning styling for "Needs Attention" status
- [x] Should apply red/error styling for "Behind" status
- [x] Should show loading state while fetching
- [x] Should show error state when fetch fails
- [x] Should show error state when API returns error response
- [x] Should handle empty goals list gracefully
- [x] Should show retry option on error

### AC2: Status from Frontmatter
**Test File**: `src/__tests__/api/goals-snapshot.test.ts`

**Test Cases**:
- [x] Should read status field from goal frontmatter
- [x] Should default to "On Track" when no status field present
- [x] Should support status value "On Track"
- [x] Should support status value "Needs Attention"
- [x] Should support status value "Behind"
- [x] Should normalize hyphenated status values (e.g., "on-track" -> "On Track")
- [x] Should normalize lowercase status values
- [x] Should default invalid status values to "On Track"
- [x] Should handle malformed frontmatter gracefully

### AC3: API Endpoint
**Test File**: `src/__tests__/api/goals-snapshot.test.ts`

**Test Cases**:
- [x] GET /api/goals/snapshot should return 200 with goals array
- [x] Should return first 5 goals maximum
- [x] Should return fewer goals if file has less than 5
- [x] Should return goal with title, description, and status fields
- [x] Should parse goal title correctly
- [x] Should parse goal description from "What" field
- [x] Should read from 1_year.md file
- [x] Should return 500 on file read error
- [x] Should return 404 when goals file not found
- [x] Should handle empty goals file
- [x] Should handle file with no goals defined
- [x] Should truncate description at 100 characters
- [x] Should add ellipsis when truncating
- [x] Should not truncate short descriptions
- [x] Should handle goals with missing "What" field
- [x] Should preserve goal order from file
- [x] Should handle special characters in goal text
- [x] Should handle goals file with only template placeholders

### AC4: Navigation
**Test File**: `src/__tests__/components/GoalsSnapshot.test.tsx`

**Test Cases**:
- [x] Should render clickable goal items
- [x] Should navigate to /goals page when goal is clicked
- [x] Should render "View All" link
- [x] Should have "View All" link with href="/goals"
- [x] Should position "View All" link in card header or footer
- [x] Navigation elements should be keyboard accessible

## Edge Cases Covered

1. **Empty goals file**: Returns empty array, component shows "No goals" message
2. **Less than 5 goals**: Returns available goals without errors
3. **Goals without descriptions**: Handles missing "What" field gracefully
4. **Very long descriptions**: Truncates at 100 chars with ellipsis
5. **Network error**: Shows error state with retry option
6. **Invalid status values**: Defaults to "On Track"
7. **Malformed frontmatter**: Handles gracefully without crashing
8. **Template placeholders**: Parses even if goals have placeholder text
9. **Special characters**: Preserves special chars in goal text
10. **Single goal**: Renders correctly with just one goal

## Dependencies (mocks used)

- `fs/promises` - Mocked for file system operations in API tests
- `@/lib/config` - Mocked for GOALS_PATH constant
- `next/navigation` - Mocked for router navigation in component tests
- `global.fetch` - Mocked for API calls in component tests

## Test Files Created

1. `/dashboard/src/__tests__/api/goals-snapshot.test.ts` - API route tests (26 test cases)
2. `/dashboard/src/__tests__/components/GoalsSnapshot.test.tsx` - Component tests (32 test cases)

## Verification

```bash
cd /Users/alexandrbasis/conductor/workspaces/ceo-personal-os/lusaka/dashboard
npm run test -- --testPathPatterns="goals-snapshot|GoalsSnapshot"
```

### Test Run Results
```
Test Suites: 2 failed, 2 total
Tests:       58 failed, 58 total
Time:        0.74 s
```

All 58 tests FAIL as expected because:
- API route `/api/goals/snapshot` does not exist yet
- Component `GoalsSnapshot` does not exist yet

This is correct TDD behavior - tests define the expected behavior before implementation.

## Ready for Implementation

All tests are written and failing. Implementation can begin with:

1. Create `/app/api/goals/snapshot/route.ts` - API route handler
2. Create `/components/GoalsSnapshot.tsx` - React component
3. Add component to dashboard page

The tests will pass once implementation is complete and matches the expected behavior.
