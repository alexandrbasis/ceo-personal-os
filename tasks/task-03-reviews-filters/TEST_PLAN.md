# Test Plan - Reviews Filters & Sorting

**Date**: 2026-01-03
**Status**: Complete - All Tests Written
**Task**: Reviews Filters & Sorting (Daily/Weekly only)

## Summary

- **Total Criteria**: 4
- **Test Files Created**: 4
- **Total Test Cases**: 75
- **All Tests Failing**: Yes (awaiting implementation)

## Acceptance Criteria to Test Mapping

| # | Criterion | Test Type | Test File | Tests | Status |
|---|-----------|-----------|-----------|-------|--------|
| 1 | Type Filter | Component | `ReviewsFilter.test.tsx` | 18 | Written |
| 2 | Date Sorting | Component | `SortToggle.test.tsx` | 26 | Written |
| 3 | Combined View | Component | `ReviewsPage.test.tsx` | 26 | Written |
| 4 | API Updates | API/Unit | `reviews-aggregated.test.ts` | 20 | Written |

## Test Structure

### AC1: Type Filter
**Test File**: `dashboard/src/__tests__/components/ReviewsFilter.test.tsx`

**Test Cases** (18 tests):
- [x] Should render filter dropdown with All/Daily/Weekly options
- [x] Should have "All" as default selected option
- [x] Should call onFilterChange when option is selected
- [x] Should call onFilterChange with "daily" when Daily is selected
- [x] Should call onFilterChange with "all" when All is selected
- [x] Should update URL with type parameter when filter changes
- [x] Should read initial filter from URL params
- [x] Should persist filter on page refresh (via URL params)
- [x] Should preserve other URL params when updating filter
- [x] Should remove type param when "All" is selected
- [x] Should highlight current filter selection
- [x] Should handle invalid URL type param gracefully
- [x] Should handle empty type URL param
- [x] Should be accessible with keyboard navigation
- [x] Should have proper aria labels
- [x] Should announce filter change to screen readers
- [x] Should show count of reviews per type if provided
- [x] Should disable options with zero count if configured

### AC2: Date Sorting
**Test File**: `dashboard/src/__tests__/components/SortToggle.test.tsx`

**Test Cases** (26 tests):
- [x] Should render sort toggle with Newest/Oldest options
- [x] Should have "Newest First" as default
- [x] Should show visual indicator of current sort direction
- [x] Should show descending arrow when sort=desc
- [x] Should show ascending arrow when sort=asc
- [x] Should call onSortChange when toggled
- [x] Should toggle from desc to asc when clicked
- [x] Should toggle from asc to desc when clicked
- [x] Should update visual indicator when toggled
- [x] Should update URL with sort parameter when toggled
- [x] Should read initial sort from URL params
- [x] Should persist sort preference on page refresh
- [x] Should preserve other URL params when updating sort
- [x] Should remove sort param when set to default (desc)
- [x] Should handle invalid URL sort param gracefully
- [x] Should handle empty sort URL param
- [x] Should handle rapid toggling
- [x] Should have proper aria labels
- [x] Should indicate current sort direction in aria
- [x] Should be focusable with keyboard
- [x] Should toggle with Enter key
- [x] Should toggle with Space key
- [x] Should show clear label text for current state
- [x] Should have hover state
- [x] Should have disabled state when specified
- [x] Should not trigger callback when disabled

### AC3: Combined View
**Test File**: `dashboard/src/__tests__/components/ReviewsPage.test.tsx`

**Test Cases** (26 tests):
- [x] Should display all reviews (daily + weekly) in flat list when type=all
- [x] Should show type badge (Daily/Weekly) for each review item
- [x] Should display type badge with clear visual distinction
- [x] Should sort combined list chronologically
- [x] Should display flat list only (no grouped view)
- [x] Should filter to only daily reviews when type=daily
- [x] Should filter to only weekly reviews when type=weekly
- [x] Should update view when filter is changed
- [x] Should sort combined list ascending when sort=asc
- [x] Should update order when sort is toggled
- [x] Should integrate filter and sort URL params
- [x] Should update URL when both filter and sort change
- [x] Should handle empty state for each filter type
- [x] Should show general empty state when no reviews at all
- [x] Should show CTA to create review in empty state
- [x] Should show loading state while fetching
- [x] Should show error state on API failure
- [x] Should show energy level for daily reviews
- [x] Should show week number for weekly reviews
- [x] Should link daily reviews to /daily/[date]
- [x] Should link weekly reviews to /weekly/[date]
- [x] Should load with filter from URL on initial render
- [x] Should load with sort from URL on initial render
- [x] Should show page title
- [x] Should show total count of reviews
- [x] Should have back to dashboard link

### AC4: API Updates
**Test File**: `dashboard/src/__tests__/api/reviews-aggregated.test.ts`

**Test Cases** (20 tests):
- [x] GET /api/reviews should return all review types by default
- [x] Should return reviews sorted by date descending by default
- [x] Should include type field for each review item
- [x] GET /api/reviews?type=daily should return only daily reviews
- [x] Should return empty array when no daily reviews exist
- [x] GET /api/reviews?type=weekly should return only weekly reviews
- [x] Should return empty array when no weekly reviews exist
- [x] GET /api/reviews?sort=asc should return oldest first
- [x] GET /api/reviews?sort=desc should return newest first
- [x] Should support combined params: type=weekly&sort=asc
- [x] Should support combined params: type=daily&sort=desc
- [x] Should return 400 for invalid type parameter
- [x] Should return 400 for invalid sort parameter
- [x] Should return empty array when no reviews exist at all
- [x] Should handle directory not existing gracefully
- [x] Should return correct fields for daily reviews
- [x] Should return correct fields for weekly reviews
- [x] Should handle daily and weekly reviews with same date
- [x] Should filter out non-markdown and template files
- [x] Should handle type=all explicitly

## Edge Cases Covered

1. **Empty states**: No reviews at all, no daily reviews, no weekly reviews
2. **URL param validation**: Invalid type param, invalid sort param, empty params
3. **Mixed dates**: Daily and weekly reviews on same date
4. **Sort with both types**: Sorting combined list chronologically
5. **Type badge visibility**: Badge distinguishable for each type
6. **Keyboard navigation**: Full accessibility support
7. **URL state persistence**: Filter and sort persist via URL params
8. **Combined params**: Filter + sort working together

## Dependencies (mocks used)

- `fs/promises` - Mock file system for API tests
- `next/navigation` - Mock useSearchParams and useRouter for URL tests
- `@/lib/config` - Mock path configuration
- `global.fetch` - Mock fetch for component API calls

## Test Files Created

1. `dashboard/src/__tests__/api/reviews-aggregated.test.ts` - 20 tests
2. `dashboard/src/__tests__/components/ReviewsFilter.test.tsx` - 18 tests
3. `dashboard/src/__tests__/components/SortToggle.test.tsx` - 26 tests
4. `dashboard/src/__tests__/components/ReviewsPage.test.tsx` - 26 tests

## Verification

```bash
npm test -- --testPathPatterns="reviews-aggregated|ReviewsFilter|SortToggle|ReviewsPage"
```

**Results**: All 75 tests FAIL (expected - no implementation yet)

Error types observed:
- `Cannot find module '../../app/api/reviews/route'` - Route not implemented
- `Cannot find module '../../components/ReviewsFilter'` - Component not implemented
- `Cannot find module '../../components/SortToggle'` - Component not implemented

## Ready for Implementation

All tests are written and failing. Implementation can begin using these tests as specification.

### Implementation Order Recommended:
1. **AC4 - API Route** (`/api/reviews/route.ts`) - Foundation for data
2. **AC1 - ReviewsFilter** (`ReviewsFilter.tsx`) - Filter component
3. **AC2 - SortToggle** (`SortToggle.tsx`) - Sort component
4. **AC3 - ReviewsPage** (`reviews/page.tsx`) - Integration with components

### Files to Create/Modify:
- `dashboard/src/app/api/reviews/route.ts` - NEW aggregated endpoint
- `dashboard/src/components/ReviewsFilter.tsx` - NEW filter component
- `dashboard/src/components/SortToggle.tsx` - NEW sort component
- `dashboard/src/app/reviews/page.tsx` - MODIFY to use new components and API
