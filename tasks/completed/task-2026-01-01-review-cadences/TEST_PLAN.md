# Test Plan - Weekly Reviews (AC1)

**Date**: 2026-01-01
**Status**: Complete - All Tests Written

## Summary
- **Total Criteria**: 6 (from AC1)
- **Test Files Created**: 5
- **Total Test Cases**: 122
- **All Tests Failing**: Yes (awaiting implementation)

## Acceptance Criteria -> Test Mapping

| # | Criterion | Test Type | Test File | Status |
|---|-----------|-----------|-----------|--------|
| 1 | User can create a new weekly review from dashboard | Component/Integration | `WeeklyForm.test.tsx`, `weekly-reviews.test.ts`, `QuickActions.weekly.test.tsx` | Written |
| 2 | Weekly review form includes all required fields | Component | `WeeklyForm.test.tsx` | Written |
| 3 | Weekly reviews stored in reviews/weekly/ directory | Integration | `weekly-reviews.test.ts` | Written |
| 4 | Weekly reviews visible in Reviews list (filtered/grouped) | Component | `ReviewsList.weekly.test.tsx` | Written |
| 5 | Timer tracks reflection time | Component | `WeeklyForm.test.tsx` | Written |
| 6 | Can view/edit past weekly reviews | Integration | `weekly-reviews.test.ts` | Written |

## Test Files Created

### 1. `src/__tests__/components/WeeklyForm.test.tsx`
**Purpose**: Tests for the weekly review form component

**Test Suites**:
- Form Fields Rendering (9 tests)
- Form Validation (5 tests)
- Form Submission (4 tests)
- Draft Saving (3 tests)
- Pre-filled Data (Edit Mode) (2 tests)
- Timer Display (3 tests)
- Week Selection (2 tests)
- Accessibility (2 tests)

**Total Tests**: 30

### 2. `src/__tests__/api/weekly-reviews.test.ts`
**Purpose**: API integration tests for weekly review CRUD operations

**Test Suites**:
- GET /api/reviews/weekly (5 tests)
- POST /api/reviews/weekly (7 tests)
- GET /api/reviews/weekly/[date] (3 tests)
- PUT /api/reviews/weekly/[date] (5 tests)

**Total Tests**: 20

### 3. `src/__tests__/lib/weekly-review-parser.test.ts`
**Purpose**: Parser and serializer tests for weekly review markdown

**Test Suites**:
- parseWeeklyReview (15 tests)
- serializeWeeklyReview (11 tests)
- Round-trip tests (3 tests)

**Total Tests**: 29

### 4. `src/__tests__/components/ReviewsList.weekly.test.tsx`
**Purpose**: Tests for weekly reviews in the reviews list component

**Test Suites**:
- Weekly Reviews Rendering (5 tests)
- Filtering by Type (2 tests)
- Empty State (3 tests)
- List Limits (2 tests)
- Week Indicator Badge (2 tests)
- Long Content Handling (1 test)
- Ordering (1 test)
- Accessibility (2 tests)
- Year Transition (1 test)

**Total Tests**: 19

### 5. `src/__tests__/components/QuickActions.weekly.test.tsx`
**Purpose**: Tests for weekly review integration in QuickActions dashboard component

**Test Suites**:
- Start Weekly Review Button (3 tests)
- Weekly Status Indicator (6 tests)
- Weekly Review Timing (2 tests)
- Multiple Review Types Layout (2 tests)
- Accessibility (3 tests)
- View All Reviews Link (1 test)
- Week Number Display (1 test)

**Total Tests**: 18

## Types Added

Added to `src/lib/types.ts`:
- `WeeklyReview` interface
- `WeeklyReviewFormData` interface
- `WeeklyReviewListItem` interface

Added to `src/lib/config.ts`:
- `REVIEWS_WEEKLY_PATH` constant

## Weekly Review Fields Tested

Per README specification:
1. What actually moved the needle this week
2. What was noise disguised as work
3. Where your time leaked
4. One strategic insight
5. One adjustment for next week

Plus:
- Week start date (YYYY-MM-DD)
- Week number (1-52)
- Optional notes
- Duration (minutes)

## Edge Cases Covered

- Empty week with no data
- Week spanning year boundary (Week 52 to Week 1)
- Long content truncation in list views
- Template placeholders treated as empty
- Multi-line blockquote content
- Special characters in content
- Malformed markdown handling
- Draft restoration from localStorage
- Timer inclusion in submitted data
- Week selection navigation

## Verification

```bash
npm test -- --testPathPatterns="weekly" --passWithNoTests

Test Suites: 5 failed, 5 total
Tests:       121 failed, 1 passed, 122 total
```

All tests FAIL as expected - no implementation exists yet.

**Failure Reasons (expected)**:
- API tests: Cannot find module `@/app/api/reviews/weekly/route`
- Parser tests: Cannot find module `@/lib/parsers/weekly-review`
- Component tests: WeeklyForm component doesn't exist
- ReviewsList tests: Component doesn't support weekly type prop
- QuickActions tests: Component doesn't support weekly status

## Ready for Implementation

All tests are written and failing. Implementation should create:

1. `src/components/WeeklyForm.tsx` - Weekly review form component
2. `src/lib/parsers/weekly-review.ts` - Parser and serializer
3. `src/app/api/reviews/weekly/route.ts` - API list/create endpoints
4. `src/app/api/reviews/weekly/[date]/route.ts` - API get/update endpoints
5. `src/app/weekly/page.tsx` - Weekly review page
6. Update `src/components/ReviewsList.tsx` - Add weekly type support
7. Update `src/components/QuickActions.tsx` - Add weekly status

## Commits

All test files committed together:
- `test: add comprehensive failing tests for Weekly Reviews (AC1)`
