# Test Plan - Web Dashboard MVP

**Date**: 2024-12-31
**Status**: COMPLETE - All Tests Written

## Summary

This test plan covers all acceptance criteria from the technical decomposition document (T1-T6). Tests are written following TDD approach - they all FAIL initially since no implementation exists (expected behavior).

- **Total Criteria**: 7 (T1-T6, including T2.5)
- **Test Files Created**: 10
- **Total Test Cases**: 123
- **All Tests Failing**: Yes (116 failing, 7 passing - setup tests pass because utils exist)

## Acceptance Criteria to Test Mapping

| # | Criterion (Section) | Test Type | Test File | Status |
|---|---------------------|-----------|-----------|--------|
| T1 | Project Setup | Unit | `src/__tests__/lib/setup.test.ts` | PASS (7 tests) |
| T2 | Markdown Parser (Daily Review) | Unit | `src/__tests__/lib/daily-review-parser.test.ts` | Written (19 tests) |
| T2.5 | Markdown Serializer | Unit | `src/__tests__/lib/daily-review-serializer.test.ts` | Written (16 tests) |
| T3 | Life Map Parser | Unit | `src/__tests__/lib/life-map-parser.test.ts` | Written (14 tests) |
| T4 | API Routes | Integration | `src/__tests__/api/reviews.test.ts`, `src/__tests__/api/life-map.test.ts` | Written (21 tests) |
| T5 | Components | Component | `src/__tests__/components/*.test.tsx` | Written (38 tests) |
| T6 | Page Integration | E2E | `src/__tests__/e2e/*.spec.ts` | Written (30 tests) |

## Test Files Created

### Unit Tests (Jest)
1. `dashboard/src/__tests__/lib/setup.test.ts` - 7 tests (PASSING)
2. `dashboard/src/__tests__/lib/daily-review-parser.test.ts` - 19 tests
3. `dashboard/src/__tests__/lib/daily-review-serializer.test.ts` - 16 tests
4. `dashboard/src/__tests__/lib/life-map-parser.test.ts` - 14 tests

### API Tests (Jest)
5. `dashboard/src/__tests__/api/reviews.test.ts` - 16 tests
6. `dashboard/src/__tests__/api/life-map.test.ts` - 5 tests

### Component Tests (React Testing Library)
7. `dashboard/src/__tests__/components/LifeMapChart.test.tsx` - 11 tests
8. `dashboard/src/__tests__/components/DailyForm.test.tsx` - 18 tests
9. `dashboard/src/__tests__/components/ReviewsList.test.tsx` - 9 tests
10. `dashboard/src/__tests__/components/QuickActions.test.tsx` - 10 tests

### E2E Tests (Playwright)
11. `dashboard/src/__tests__/e2e/dashboard.spec.ts` - 15 tests
12. `dashboard/src/__tests__/e2e/daily-review.spec.ts` - 25 tests

---

## Test Details by Criterion

### T1: Project Setup Tests (PASSING)

**Test File**: `src/__tests__/lib/setup.test.ts`

**Test Cases**:
- [x] TypeScript configuration is valid
- [x] Module aliases work (@/ imports)
- [x] Utility functions (cn) work correctly
- [x] Should merge conflicting Tailwind classes
- [x] Should handle conditional classes
- [x] Should handle falsy values

---

### T2: Markdown Parser Tests (Daily Review)

**Test File**: `src/__tests__/lib/daily-review-parser.test.ts`

The parser handles the EXISTING TEMPLATE.md format:
- Energy level: `**Energy level (1-10):** [ ]` or `**Energy level (1-10):** 7`
- Blockquotes for answers: `> [Your win]`
- Checkboxes: `[ ] Needs action` or `[x] Just needs acknowledgment`

**Test Cases (19 total)**:
- [ ] Should parse a complete daily review file with all fields filled
- [ ] Should extract date from "**Date:** YYYY-MM-DD" format
- [ ] Should extract energy level from "**Energy level (1-10):** N"
- [ ] Should extract energy factors from text after question
- [ ] Should extract meaningful win from blockquote
- [ ] Should extract friction point from blockquote
- [ ] Should detect friction action as "letting_go" when acknowledgment checked
- [ ] Should detect friction action as "address" when action checked
- [ ] Should extract thing to let go from blockquote
- [ ] Should extract tomorrow's priority from blockquote
- [ ] Should extract notes from optional section
- [ ] Should extract completion time
- [ ] Should handle missing optional fields (return undefined)
- [ ] Should return undefined frictionAction when neither checkbox checked
- [ ] Should handle malformed markdown gracefully
- [ ] Should return partial data when file incomplete
- [ ] Should handle template placeholders as empty values
- [ ] Should handle energy level with empty brackets
- [ ] Should trim whitespace from extracted values

---

### T2.5: Markdown Serialization Tests

**Test File**: `src/__tests__/lib/daily-review-serializer.test.ts`

**Test Cases (16 total)**:
- [ ] Should generate markdown with correct header
- [ ] Should include formatted date in field
- [ ] Should generate Energy Check section with level
- [ ] Should include energy factors
- [ ] Should generate One Meaningful Win section with blockquote
- [ ] Should generate One Friction Point section with blockquote
- [ ] Should generate letting_go friction action with checked checkbox
- [ ] Should generate address friction action with checked checkbox
- [ ] Should generate One Thing to Let Go section
- [ ] Should generate One Priority for Tomorrow section
- [ ] Should generate Optional Notes section
- [ ] Should generate Time to complete footer
- [ ] Should handle missing optional fields with empty blockquotes
- [ ] Should handle unchecked friction action
- [ ] Should include helper text in sections
- [ ] Round-trip: form data -> markdown -> parse -> same data (3 tests)

---

### T3: Life Map Parser Tests

**Test File**: `src/__tests__/lib/life-map-parser.test.ts`

**Test Cases (14 total)**:
- [ ] Should parse life map with all 6 domain scores
- [ ] Should extract Career score from table row
- [ ] Should extract Relationships score from table row
- [ ] Should extract Health score from table row
- [ ] Should extract Meaning score from table row
- [ ] Should extract Finances score from table row
- [ ] Should extract Fun score from table row
- [ ] Should extract assessment text for each domain
- [ ] Should handle empty score cells (return 0)
- [ ] Should handle partial scores
- [ ] Should handle malformed table gracefully
- [ ] Should return all expected domains even if some missing
- [ ] Should be case-insensitive for domain names
- [ ] Should handle non-numeric score values
- [ ] getLifeMapChartData: should convert to chart format

---

### T4: API Route Tests

**Test File**: `src/__tests__/api/reviews.test.ts` (16 tests)

**GET /api/reviews/daily**:
- [ ] Should return list of all daily reviews
- [ ] Should return array with date, energyLevel, tomorrowPriority, filePath
- [ ] Should return empty array when no reviews exist
- [ ] Should order reviews by date descending
- [ ] Should filter out non-markdown files

**POST /api/reviews/daily**:
- [ ] Should create new markdown file with valid data
- [ ] Should return success: true and filePath on success
- [ ] Should return error if file already exists
- [ ] Should validate required fields
- [ ] Should validate date format
- [ ] Should validate energyLevel range

**GET /api/reviews/daily/[date]**:
- [ ] Should return parsed review for valid date
- [ ] Should return 404 when review not found
- [ ] Should validate date format

**PUT /api/reviews/daily/[date]**:
- [ ] Should update existing review file
- [ ] Should return success: true on update
- [ ] Should return 404 when file does not exist
- [ ] Should validate update data

**Test File**: `src/__tests__/api/life-map.test.ts` (5 tests)

**GET /api/life-map**:
- [ ] Should return life map with all 6 domain scores
- [ ] Should return domains object with score and assessment
- [ ] Should return 500 if life_map.md not found
- [ ] Should handle malformed life map gracefully
- [ ] Should handle empty scores correctly

---

### T5: Component Tests

**Test File**: `src/__tests__/components/LifeMapChart.test.tsx` (11 tests)
- [ ] Should render radar chart container
- [ ] Should render with 6 data points
- [ ] Should include PolarGrid, PolarAngleAxis, Radar components
- [ ] Should use "domain" as angle axis key
- [ ] Should use "score" as radar data key
- [ ] Should handle null/undefined scores as 0
- [ ] Should handle empty data array
- [ ] Should have accessible name
- [ ] Should accept custom height prop
- [ ] Should display all 6 domain labels
- [ ] Integration: transform LifeMap data to chart format

**Test File**: `src/__tests__/components/DailyForm.test.tsx` (18 tests)
- [ ] Should render all required form fields
- [ ] Should render date picker (defaults to today)
- [ ] Should render energy level slider
- [ ] Should render energy factors textarea
- [ ] Should render meaningful win textarea
- [ ] Should render friction point textarea
- [ ] Should render friction action radio group
- [ ] Should render thing to let go textarea
- [ ] Should render tomorrow's priority textarea
- [ ] Should render notes textarea
- [ ] Should render submit button
- [ ] Should validate required fields on submit
- [ ] Should show validation errors
- [ ] Should require meaningful win
- [ ] Should require tomorrow's priority
- [ ] Should call onSubmit with form data
- [ ] Should save draft to localStorage
- [ ] Should restore draft from localStorage
- [ ] Should accept initialData for edit mode
- [ ] Should display elapsed timer

**Test File**: `src/__tests__/components/ReviewsList.test.tsx` (9 tests)
- [ ] Should render list of reviews
- [ ] Should display date for each review
- [ ] Should display energy badge for each review
- [ ] Should display tomorrow's priority preview
- [ ] Should show "No reviews yet" when empty
- [ ] Should limit to 5 most recent reviews
- [ ] Should color-code energy badges
- [ ] Should link each review to detail page
- [ ] Should truncate long priority text

**Test File**: `src/__tests__/components/QuickActions.test.tsx` (10 tests)
- [ ] Should render "Start Daily Review" button
- [ ] Should link to /daily when clicked
- [ ] Should show green status when reviewed today
- [ ] Should show "Last review: Today" text
- [ ] Should show yellow status when reviewed yesterday
- [ ] Should show "Last review: Yesterday" text
- [ ] Should show red status when no review 2+ days
- [ ] Should show warning message for missed reviews
- [ ] Should show red status when no reviews exist
- [ ] Should show "No reviews yet" message

---

### T6: Page Integration Tests (E2E)

**Test File**: `src/__tests__/e2e/dashboard.spec.ts` (15 tests)
- [ ] Should load dashboard page
- [ ] Should display Life Map radar chart
- [ ] Should display all 6 domain labels
- [ ] Should display Quick Actions section
- [ ] Should display "Start Daily Review" button
- [ ] Should display Recent Reviews list
- [ ] Should display review status indicator
- [ ] Should load in under 2 seconds
- [ ] Should navigate to daily review form
- [ ] Should show "View All Reviews" link
- [ ] Should display reviews with date and energy
- [ ] Should show at most 5 recent reviews
- [ ] Should link reviews to detail pages
- [ ] Should fetch life map data from API
- [ ] Should display correctly on mobile/tablet

**Test File**: `src/__tests__/e2e/daily-review.spec.ts` (25 tests)
- [ ] New review: should display empty form
- [ ] New review: should default date to today
- [ ] New review: should display energy level slider
- [ ] New review: should display all form sections
- [ ] New review: should display timer
- [ ] New review: should display submit button
- [ ] New review: should show validation errors
- [ ] New review: should submit form with valid data
- [ ] New review: should redirect after submission
- [ ] New review: should show success toast
- [ ] View review: should display rendered markdown
- [ ] View review: should display Edit button
- [ ] View review: should navigate to edit page
- [ ] View review: should display Previous/Next navigation
- [ ] View review: should display date in readable format
- [ ] Edit review: should display pre-filled form
- [ ] Edit review: should show date matching URL
- [ ] Edit review: should submit updates via PUT
- [ ] Edit review: should redirect after update
- [ ] Edit review: should show Cancel button
- [ ] Form interactions: should update energy via slider
- [ ] Form interactions: should allow selecting friction action
- [ ] Form interactions: should save draft to localStorage
- [ ] Form interactions: should restore draft on load
- [ ] Error handling: should handle network errors
- [ ] Error handling: should show 404 for non-existent date

---

## Edge Cases Covered

1. **Empty/malformed markdown files**: Parser tests verify no crash
2. **Missing optional fields**: Tests verify undefined returned
3. **Date edge cases**: Invalid dates, future dates tested
4. **Energy level boundaries**: Values 0, 1, 10, 11 tested
5. **Empty blockquotes**: `> ` with no content handled
6. **Checkbox variations**: `[ ]`, `[x]` states tested
7. **Life map empty scores**: Table rows with missing values tested
8. **File system errors**: API tests mock ENOENT errors
9. **localStorage unavailable**: Mocked in component tests
10. **Special characters**: Round-trip tests include special chars

## Dependencies Mocked

- `fs/promises` - File system operations (for API tests)
- `next/navigation` - Router hooks (useRouter, useParams)
- `localStorage` - Browser storage (for form draft)
- `recharts` - Chart components (for unit testing)

## Test Commands

```bash
# Run all unit tests
npm run test

# Run specific test suites
npm run test:lib        # Parser/utility tests (50 tests)
npm run test:api        # API route tests (21 tests)
npm run test:components # Component tests (48 tests)

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Verification

```
npm run test
Tests: 116 failed, 7 passed (expected - no implementation)

Test Suites: 9 failed, 1 passed, 10 total
Tests:       116 failed, 7 passed, 123 total
```

## Ready for Implementation

All tests are written and failing (except setup tests which verify utilities).
Implementation can begin with TDD approach:
1. Implement parser/serializer -> T2, T2.5, T3 tests pass
2. Implement API routes -> T4 tests pass
3. Implement components -> T5 tests pass
4. Build pages -> T6 E2E tests pass

---

*Test plan completed: 2024-12-31*
*Status: COMPLETE - Ready for Implementation*
